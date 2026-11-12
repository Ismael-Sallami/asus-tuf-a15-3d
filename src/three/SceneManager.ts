import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LaptopModel } from './LaptopModel';
import { AppTheme, CameraPreset, SystemId, ViewMode } from '../types/laptop';
import { BOARD_GROUPS, getPartById } from '../data/laptopSpecs';

export interface SceneCallbacks {
  onSelectPart?: (partId: string) => void;
  onSelectBoardGroup?: (groupId: string) => void;
}

export interface SceneStateParams {
  explosion: number;
  enabledSystems: SystemId[];
  selectedId: string | null;
  isolatedId: string | null;
  boardMode: boolean;
  boardProgress: number;
  view: CameraPreset;
  zoom: number;
  demoAngle?: number;
  lidAngle?: number;
}

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  public laptop: LaptopModel;

  private clock: THREE.Clock;
  private animationFrameId: number | null = null;
  private callbacks: SceneCallbacks;

  private raycaster: THREE.Raycaster;
  private pointerDownPos = new THREE.Vector2();

  private desiredCamPos = new THREE.Vector3(8, 7.5, 11);
  private desiredTarget = new THREE.Vector3(0, 1.15, -0.1);
  private needsCameraSync = true;

  private ambientLight!: THREE.AmbientLight;
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private bottomLight!: THREE.DirectionalLight;
  private shadowPlane!: THREE.Mesh;
  private shadowMat!: THREE.ShadowMaterial;

  private stateParams: SceneStateParams = {
    explosion: 0,
    enabledSystems: ['enclosure', 'power', 'cooling', 'computing', 'display'],
    selectedId: null,
    isolatedId: null,
    boardMode: false,
    boardProgress: 0,
    view: 'perspective',
    zoom: 1
  };

  constructor(container: HTMLElement, callbacks: SceneCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    // FOV=36° exacto para que a Z = 5 / tan(18°) la altura del plano Z=0 sea 10 unidades exactas
    this.camera = new THREE.PerspectiveCamera(36, width / Math.max(1, height), 0.1, 100);
    this.camera.position.set(8, 7.5, 11);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 50;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.target.set(0, 1.15, -0.1);
    this.controls.addEventListener('start', () => {
      this.needsCameraSync = false;
    });

    this.laptop = new LaptopModel();
    this.scene.add(this.laptop.group);

    this.setupLighting();
    this.raycaster = new THREE.Raycaster();

    this.bindEvents();
    this.recomputeCameraGoal();
    this.startLoop();
  }

  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
    this.keyLight.position.set(3, 9, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 28;
    const d = 7.5;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xe2e9ee, 1.45);
    this.fillLight.position.set(-7, 5, -3);
    this.scene.add(this.fillLight);

    this.bottomLight = new THREE.DirectionalLight(0xdce7ee, 1.5);
    this.bottomLight.position.set(1, -6, 3);
    this.scene.add(this.bottomLight);

    const shadowGeo = new THREE.PlaneGeometry(18, 18);
    this.shadowMat = new THREE.ShadowMaterial({ opacity: 0.18, color: 0x1e293b });
    this.shadowPlane = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -0.15;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  private bindEvents(): void {
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
  }

  private onWindowResize(): void {
    if (!this.container) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.recomputeCameraGoal();
  }

  private onPointerDown(e: PointerEvent): void {
    this.pointerDownPos.set(e.clientX, e.clientY);
  }

  private onPointerUp(e: PointerEvent): void {
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    if (dist > 6) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);

    if (this.stateParams.boardMode) {
      const hits = this.raycaster.intersectObjects(this.laptop.boardStudyGroup.children, true);
      for (const hit of hits) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData?.boardGroupId) {
            this.callbacks.onSelectBoardGroup?.(curr.userData.boardGroupId);
            return;
          }
          curr = curr.parent;
        }
      }
      return;
    }

    const hits = this.raycaster.intersectObjects(this.laptop.assemblyGroup.children, true);
    for (const hit of hits) {
      if (!hit.object.visible) continue;
      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData?.componentId) {
          this.callbacks.onSelectPart?.(curr.userData.componentId);
          return;
        }
        curr = curr.parent;
      }
    }
  }

  public syncState(next: Partial<SceneStateParams>, forceCameraSync = false): void {
    const prev = this.stateParams;
    this.stateParams = { ...prev, ...next };

    if (
      forceCameraSync ||
      prev.view !== this.stateParams.view ||
      prev.isolatedId !== this.stateParams.isolatedId ||
      prev.boardMode !== this.stateParams.boardMode ||
      prev.boardProgress !== this.stateParams.boardProgress ||
      prev.zoom !== this.stateParams.zoom ||
      Math.abs(prev.explosion - this.stateParams.explosion) > 0.001
    ) {
      this.recomputeCameraGoal();
    }
  }

  public resetCamera(): void {
    this.recomputeCameraGoal();
  }

  private recomputeCameraGoal(): void {
    const { explosion, isolatedId, view, zoom, boardMode, boardProgress } = this.stateParams;
    const width = this.container.clientWidth || window.innerWidth;
    const isNarrow = width < 580;

    if (boardMode) {
      const mobileScale = isNarrow ? 1.38 : 1.0;
      const angle = -0.12 + boardProgress * 0.16;
      this.desiredCamPos.set(
        Math.sin(angle) * 8 * mobileScale,
        (11.5 + boardProgress * 2.0) * mobileScale,
        (7.3 + boardProgress * 1.6) * mobileScale
      );
      this.desiredTarget.set(0, 0.55, 0);
      this.needsCameraSync = true;
      return;
    }

    const bigParts = ['top-case', 'bottom-cover', 'keyboard', 'display', 'heatsink', 'logic-board', 'battery'];
    const baseDist = isolatedId
      ? bigParts.includes(isolatedId)
        ? 10.5
        : 5.4
      : 14.2 + explosion * 3.6;

    const dist = (baseDist * (isNarrow ? 1.32 : 1.0) * (view === 'top' && !isolatedId ? 1 + explosion * 0.25 : 1)) / zoom;
    const targetY = isolatedId ? (isolatedId === 'display' ? 1.3 : 0.45) : 1.1 + explosion * 0.6;
    const targetZ = isolatedId ? 0 : view === 'top' ? -0.7 - explosion * 0.75 : -0.1;

    this.desiredTarget.set(0, targetY, targetZ);

    if (view === 'bottom') {
      this.desiredCamPos.set(0, targetY - dist, targetZ + 0.01);
    } else if (view === 'left' || view === 'right') {
      this.desiredCamPos.set((view === 'left' ? -1 : 1) * dist, 0.4, 0);
    } else if (view === 'top') {
      this.desiredCamPos.set(0, targetY + dist, targetZ + 0.01);
    } else if (view === 'front') {
      this.desiredCamPos.set(0, targetY + dist * 0.2, dist);
    } else {
      this.desiredCamPos.set(dist * 0.53, targetY + dist * 0.44, dist * 0.72);
    }

    this.needsCameraSync = true;
  }

  public setTheme(theme: AppTheme): void {
    if (theme === 'studio') {
      this.ambientLight.intensity = 1.45;
      this.keyLight.intensity = 3.1;
      this.fillLight.intensity = 1.5;
      this.shadowMat.opacity = 0.16;
    } else if (theme === 'blueprint') {
      this.ambientLight.intensity = 1.6;
      this.keyLight.intensity = 2.6;
      this.fillLight.intensity = 1.8;
      this.shadowMat.opacity = 0.25;
    } else {
      this.ambientLight.intensity = 1.25;
      this.keyLight.intensity = 2.8;
      this.fillLight.intensity = 1.4;
      this.shadowMat.opacity = 0.32;
    }
  }

  public setViewMode(mode: ViewMode): void {
    this.laptop.setViewMode(mode);
  }

  /**
   * Devuelve las coordenadas 2D de pantalla de la pieza seleccionada para mostrar su pin flotante
   */
  public getSelectedPartPin(): { x: number; y: number; name: string; visible: boolean } | null {
    const { selectedId, isolatedId, explosion, boardMode } = this.stateParams;
    if (!selectedId || isolatedId || explosion > 0.65 || boardMode) return null;

    const worldPos = this.laptop.getPartWorldPosition(selectedId);
    const part = getPartById(selectedId);
    if (!worldPos || !part) return null;

    const projected = worldPos.clone().project(this.camera);
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    const x = ((projected.x + 1) / 2) * w;
    const y = ((-projected.y + 1) / 2) * h;
    const inBounds = projected.z < 1 && x >= 20 && x <= w - 20 && y >= 20 && y <= h - 20;

    return { x, y, name: part.name, visible: inBounds };
  }

  /**
   * Devuelve las coordenadas 2D de los 8 bloques funcionales en el modo "Explorar placa base"
   */
  public getBoardGroupPins(): Array<{
    id: string;
    index: number;
    shortName: string;
    name: string;
    color: string;
    x: number;
    y: number;
    visible: boolean;
  }> {
    if (!this.stateParams.boardMode) return [];
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    return BOARD_GROUPS.map((bg, idx) => {
      const worldPos = this.laptop.getBoardGroupWorldPosition(bg.id);
      if (!worldPos) {
        return { id: bg.id, index: idx + 1, shortName: bg.shortName, name: bg.name, color: bg.color, x: 0, y: 0, visible: false };
      }
      const projected = worldPos.clone().project(this.camera);
      const x = ((projected.x + 1) / 2) * w;
      const y = ((-projected.y + 1) / 2) * h;
      const visible = projected.z < 1 && x >= 10 && x <= w - 10 && y >= 10 && y <= h - 10;
      return {
        id: bg.id,
        index: idx + 1,
        shortName: bg.shortName,
        name: bg.name,
        color: bg.color,
        x,
        y,
        visible
      };
    });
  }

  private startLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      if (this.renderer.domElement.width !== Math.floor(w * this.renderer.getPixelRatio()) ||
          this.renderer.domElement.height !== Math.floor(h * this.renderer.getPixelRatio())) {
        this.camera.aspect = w / Math.max(1, h);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
      const {
        explosion,
        enabledSystems,
        selectedId,
        isolatedId,
        boardMode,
        boardProgress,
        demoAngle,
        lidAngle
      } = this.stateParams;

      this.shadowPlane.visible = !boardMode && explosion < 0.62 && !isolatedId;

      this.laptop.updateAssemblyState({
        explosion,
        enabledSystems,
        selectedId,
        isolatedId,
        boardMode,
        boardProgress,
        lidAngle,
        viewportWidth: w,
        viewportHeight: h,
        delta,
        fanRPM: 2800 + explosion * 2400
      });

      this.controls.enabled = demoAngle === undefined && (explosion < 0.96 || !!isolatedId) && !boardMode;

      // En modo Knolling (explosion > 0.65), interpolar cámara hacia el frente [0, 0, Z_front]
      if (!boardMode && explosion > 0.65 && !isolatedId) {
        const p = THREE.MathUtils.smoothstep(explosion, 0.65, 1.0);
        const isNarrow = w < 580;
        const baseR = (isNarrow ? 18.0 : 14.5) + 0.65 * 2.8;
        const angle = demoAngle ?? 0.62;
        const orbitPos = new THREE.Vector3(Math.sin(angle) * baseR, 8.1, Math.cos(angle) * baseR);
        const frontZ = 5 / Math.tan(THREE.MathUtils.degToRad(18)); // 15.3884
        const knollCamPos = new THREE.Vector3(0, 0, frontZ);

        this.camera.position.copy(orbitPos.lerp(knollCamPos, p));
        this.controls.target.set(0, 1.55 * (1 - p), -0.1 * (1 - p));
        this.controls.update();
      } else if (!boardMode && demoAngle !== undefined) {
        const isNarrow = w < 580;
        const rDist = (isNarrow ? 18.0 : 14.5) + explosion * 2.8;
        this.camera.position.set(Math.sin(demoAngle) * rDist, 6.8 + explosion * 2.1, Math.cos(demoAngle) * rDist);
        this.controls.target.set(0, 1.1 + explosion * 0.8, -0.1);
        this.controls.update();
      } else if (this.needsCameraSync) {
        const damp = 1 - Math.exp(-8 * delta);
        this.camera.position.lerp(this.desiredCamPos, damp);
        this.controls.target.lerp(this.desiredTarget, damp);
        this.controls.update();
        if (this.camera.position.distanceTo(this.desiredCamPos) < 0.015) {
          this.needsCameraSync = false;
        }
      } else {
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
