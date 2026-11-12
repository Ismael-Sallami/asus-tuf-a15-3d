import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { LaptopModel } from './LaptopModel';
import { ViewMode, AppTheme } from '../types/laptop';

export interface SceneCallbacks {
  onComponentSelect?: (componentId: string | null) => void;
  onHoverChange?: (componentId: string | null) => void;
}

/**
 * Gestor integral del viewport 3D Three.js para el ASUS TUF Gaming A15.
 * Controla escena, renderizado cinematográfico con mapeo de tonos ACES, iluminación TUF,
 * cámara orbital interactiva y detección de piezas mediante Raycasting.
 */
export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  public laptop: LaptopModel;

  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private callbacks: SceneCallbacks;

  private isInspecting: boolean = false;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Parámetros de cámara cinemática
  private desiredCameraPos: THREE.Vector3 = new THREE.Vector3(18, 14, 26);
  private desiredCameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentCameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private cameraTween: gsap.core.Tween | null = null;
  private targetTween: gsap.core.Tween | null = null;

  // Estado de telemetría de ventiladores
  private fanRPM: number = 2400;

  // Luces dinámicas
  private ambientLight!: THREE.AmbientLight;
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private tufAmberLight!: THREE.SpotLight;
  private tufCyanLight!: THREE.SpotLight;

  // Elementos de pedestal y suelo
  private pedestalMesh!: THREE.Mesh;
  private pedestalMat!: THREE.MeshStandardMaterial;
  private shadowMat!: THREE.ShadowMaterial;
  private gridHelper!: THREE.GridHelper;
  private ringMesh!: THREE.Mesh;
  private innerRingMesh!: THREE.Mesh;

  constructor(container: HTMLElement, callbacks: SceneCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080a0d);
    this.scene.fog = new THREE.FogExp2(0x080a0d, 0.022);

    // 2. Cámara
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(18, 14, 26);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // 4. Controles orbitales de inspección libre 360°
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxDistance = 55;
    this.controls.minDistance = 6;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Evitar pasar por debajo del suelo
    this.controls.enabled = false; // Se activa explícitamente en modo inspección

    // 5. Cargar modelo paramétrico del portátil
    this.laptop = new LaptopModel();
    this.scene.add(this.laptop.group);

    // 6. Iluminación cinematográfica TUF Gaming
    this.setupLighting();

    // 7. Plataforma / Suelo de pedestal táctico
    this.setupPedestal();

    // 8. Raycaster para clics e interacciones
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.bindEvents();
    this.startLoop();
  }

  /**
   * Configura la iluminación de estudio con acentos ámbar (#FFB800) y cian (#00E5FF)
   */
  private setupLighting(): void {
    // Luz ambiental oscura para mantener contraste dramático
    this.ambientLight = new THREE.AmbientLight(0x131924, 1.2);
    this.scene.add(this.ambientLight);

    // Luz clave superior (Key Light)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(12, 22, 14);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 5;
    this.keyLight.shadow.camera.far = 60;
    this.keyLight.shadow.camera.left = -18;
    this.keyLight.shadow.camera.right = 18;
    this.keyLight.shadow.camera.top = 18;
    this.keyLight.shadow.camera.bottom = -18;
    this.keyLight.shadow.bias = -0.0003;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    // Luz de relleno fría (Fill Light)
    this.fillLight = new THREE.DirectionalLight(0x4a6572, 1.0);
    this.fillLight.position.set(-14, 10, -10);
    this.scene.add(this.fillLight);

    // Luz de recorte 1: Ámbar TUF Gaming (#FFB800) destacando aristas mecánicas
    this.tufAmberLight = new THREE.SpotLight(0xffb800, 3.5, 45, Math.PI / 4, 0.4, 1.2);
    this.tufAmberLight.position.set(-16, 12, 16);
    this.tufAmberLight.target = this.laptop.group;
    this.scene.add(this.tufAmberLight);

    // Luz de recorte 2: Cian Cyberpunk (#00E5FF) perfilando silicio y refrigeración
    this.tufCyanLight = new THREE.SpotLight(0x00e5ff, 2.8, 45, Math.PI / 4, 0.4, 1.2);
    this.tufCyanLight.position.set(18, 14, -14);
    this.tufCyanLight.target = this.laptop.group;
    this.scene.add(this.tufCyanLight);
  }

  /**
   * Crea una plataforma circular táctica con plano receptor de sombras reales y cuadrícula militar
   */
  private setupPedestal(): void {
    // 1. Pedestal base circular con bisel metálico táctico
    const pedestalGeo = new THREE.CylinderGeometry(15.5, 16.0, 0.4, 64);
    this.pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d13,
      roughness: 0.85,
      metalness: 0.25
    });
    this.pedestalMesh = new THREE.Mesh(pedestalGeo, this.pedestalMat);
    this.pedestalMesh.position.y = -4.7;
    this.pedestalMesh.receiveShadow = true;
    this.scene.add(this.pedestalMesh);

    // 2. Plano sutil de sombra de contacto (ShadowMaterial) sobre el pedestal
    const shadowGeo = new THREE.PlaneGeometry(34, 34);
    this.shadowMat = new THREE.ShadowMaterial({
      opacity: 0.52
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, this.shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -4.49;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    // 3. Suelo con retícula técnica de ingeniería
    this.gridHelper = new THREE.GridHelper(48, 48, 0x2a3648, 0x141a24);
    this.gridHelper.position.y = -4.48;
    this.scene.add(this.gridHelper);

    // 4. Anillo perimetral ámbar TUF Gaming (#FFB800)
    const ringGeo = new THREE.RingGeometry(14.8, 15.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffb800,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI / 2;
    this.ringMesh.position.y = -4.47;
    this.scene.add(this.ringMesh);

    // 5. Anillo concéntrico interior cian (#00E5FF)
    const innerRingGeo = new THREE.RingGeometry(8.9, 9.05, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    this.innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    this.innerRingMesh.rotation.x = Math.PI / 2;
    this.innerRingMesh.position.y = -4.47;
    this.scene.add(this.innerRingMesh);
  }

  /**
   * Conecta los listeners del DOM para redimensionado, hover y clics
   */
  private bindEvents(): void {
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    this.container.addEventListener('mousemove', this.onPointerMove);
    this.container.addEventListener('click', this.onPointerDown);
  }

  private onWindowResize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onPointerMove(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast para cursor y hover
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.laptop.getInteractiveMeshes(), false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const componentId = this.findComponentId(hit);
      this.container.style.cursor = componentId ? 'pointer' : 'default';
      if (this.callbacks.onHoverChange) {
        this.callbacks.onHoverChange(componentId);
      }
    } else {
      this.container.style.cursor = 'default';
      if (this.callbacks.onHoverChange) {
        this.callbacks.onHoverChange(null);
      }
    }
  }

  private onPointerDown(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.laptop.getInteractiveMeshes(), false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const componentId = this.findComponentId(hit);
      if (this.callbacks.onComponentSelect) {
        this.callbacks.onComponentSelect(componentId);
      }
    } else {
      if (this.callbacks.onComponentSelect) {
        this.callbacks.onComponentSelect(null);
      }
    }
  }

  /**
   * Busca en la cadena de ancestros de la malla el identificador de componente asociado
   */
  private findComponentId(obj: THREE.Object3D | null): string | null {
    let curr = obj;
    while (curr && curr !== this.laptop.group) {
      if (curr.userData && curr.userData.componentId) {
        return curr.userData.componentId as string;
      }
      curr = curr.parent;
    }
    return null;
  }

  /**
   * Actualiza la posición y punto de mira de la cámara.
   * - Si duration <= 0.25s (scrollytelling interactivo continuo), actualiza las metas cinemáticas
   *   directamente y el bucle de renderizado aplica amortiguamiento exponencial framerate-independent
   *   a 60 FPS sin crear/destruir tweens por cada píxel de scroll, eliminando micro-inercias y saltos.
   * - Si duration > 0.25s (selección manual de fases o botones HUD), interpola cinemáticamente con GSAP.
   */
  public setCameraPosition(
    pos: [number, number, number],
    target: [number, number, number],
    duration: number = 1.4
  ): void {
    if (this.cameraTween) {
      this.cameraTween.kill();
      this.cameraTween = null;
    }
    if (this.targetTween) {
      this.targetTween.kill();
      this.targetTween = null;
    }

    if (duration <= 0.25) {
      // Respuesta de scroll reactiva e inmediata
      this.desiredCameraPos.set(pos[0], pos[1], pos[2]);
      this.desiredCameraTarget.set(target[0], target[1], target[2]);
    } else {
      // Transición cinematográfica suave entre hitos
      this.cameraTween = gsap.to(this.desiredCameraPos, {
        x: pos[0],
        y: pos[1],
        z: pos[2],
        duration,
        ease: 'power2.out'
      });

      this.targetTween = gsap.to(this.desiredCameraTarget, {
        x: target[0],
        y: target[1],
        z: target[2],
        duration,
        ease: 'power2.out'
      });
    }
  }

  /**
   * Habilita o deshabilita el modo de inspección 360° mediante OrbitControls
   */
  public setInspectMode(enabled: boolean): void {
    this.isInspecting = enabled;
    this.controls.enabled = enabled;
    if (enabled) {
      this.controls.target.copy(this.currentCameraTarget);
      this.controls.update();
    } else {
      this.desiredCameraPos.copy(this.camera.position);
      this.desiredCameraTarget.copy(this.controls.target);
      this.currentCameraTarget.copy(this.controls.target);
    }
  }

  public getInspectMode(): boolean {
    return this.isInspecting;
  }

  /**
   * Sincroniza el nivel de desmontaje físico de las piezas del portátil (0 a 1)
   */
  public setExplodedProgress(t: number): void {
    this.laptop.setExplodedProgress(t);
  }

  /**
   * Alterna el modo de visualización de materiales: Normal, Térmico o Rayos X
   */
  public setViewMode(mode: ViewMode): void {
    this.laptop.setViewMode(mode);
  }

  /**
   * Resalta con halo y emisión un componente específico
   */
  public highlightComponent(id: string | null): void {
    this.laptop.highlightComponent(id);
  }

  /**
   * Ajusta la velocidad de las turbinas para la animación y telemetría
   */
  public setFanRPM(rpm: number): void {
    this.fanRPM = rpm;
  }

  /**
   * Transiciona la cámara cinemática hacia un ángulo preconfigurado de estudio
   */
  public setCameraPreset(preset: 'perspective' | 'top' | 'cooling' | 'front' | 'bottom'): void {
    const presets: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
      perspective: { pos: [18, 14, 26], target: [0, 0, 0] },
      top: { pos: [0, 25, 0.4], target: [0, 0, 0] },
      cooling: { pos: [-18, 11, 8], target: [-2, 1, -1] },
      front: { pos: [0, 5, 26], target: [0, 2, 0] },
      bottom: { pos: [14, -14, 18], target: [0, -1, 0] }
    };

    const targetConfig = presets[preset] || presets.perspective;
    this.setCameraPosition(targetConfig.pos, targetConfig.target, 1.2);
  }

  /**
   * Conmuta el tema de renderizado de la escena 3D (Studio Claro, Cyberpunk Oscuro, o Blueprint CAD)
   */
  public setTheme(theme: AppTheme): void {
    if (theme === 'studio') {
      // Tema Claro Minimalista Estilo Apple / Inside MacBook
      this.scene.background = new THREE.Color(0xf6f7f9);
      this.scene.fog = new THREE.FogExp2(0xf6f7f9, 0.015);

      this.ambientLight.color.set(0xffffff);
      this.ambientLight.intensity = 2.4;

      this.keyLight.color.set(0xffffff);
      this.keyLight.intensity = 2.8;

      this.fillLight.color.set(0xe2e8f0);
      this.fillLight.intensity = 1.6;

      this.tufAmberLight.intensity = 0.5;
      this.tufCyanLight.intensity = 0.5;

      this.pedestalMat.color.set(0xffffff);
      this.pedestalMat.roughness = 0.35;
      this.pedestalMat.metalness = 0.05;

      this.shadowMat.opacity = 0.16;
      this.gridHelper.visible = false;
      this.ringMesh.visible = false;
      this.innerRingMesh.visible = false;

      this.renderer.toneMappingExposure = 1.08;
    } else if (theme === 'blueprint') {
      // Tema CAD Blueprint Técnico
      this.scene.background = new THREE.Color(0x07152b);
      this.scene.fog = new THREE.FogExp2(0x07152b, 0.02);

      this.ambientLight.color.set(0x0e2a4a);
      this.ambientLight.intensity = 1.8;

      this.keyLight.color.set(0x00e5ff);
      this.keyLight.intensity = 2.5;

      this.fillLight.color.set(0x0077b6);
      this.fillLight.intensity = 1.4;

      this.tufAmberLight.intensity = 1.2;
      this.tufCyanLight.intensity = 4.2;

      this.pedestalMat.color.set(0x0a192f);
      this.pedestalMat.roughness = 0.7;
      this.pedestalMat.metalness = 0.3;

      this.shadowMat.opacity = 0.4;
      this.gridHelper.visible = true;
      this.ringMesh.visible = true;
      this.innerRingMesh.visible = true;

      this.renderer.toneMappingExposure = 1.15;
    } else {
      // Tema Cyber Militar Oscuro TUF (Por defecto)
      this.scene.background = new THREE.Color(0x080a0d);
      this.scene.fog = new THREE.FogExp2(0x080a0d, 0.022);

      this.ambientLight.color.set(0x131924);
      this.ambientLight.intensity = 1.2;

      this.keyLight.color.set(0xffffff);
      this.keyLight.intensity = 2.2;

      this.fillLight.color.set(0x4a6572);
      this.fillLight.intensity = 1.0;

      this.tufAmberLight.intensity = 3.5;
      this.tufCyanLight.intensity = 2.8;

      this.pedestalMat.color.set(0x0a0d13);
      this.pedestalMat.roughness = 0.85;
      this.pedestalMat.metalness = 0.25;

      this.shadowMat.opacity = 0.52;
      this.gridHelper.visible = true;
      this.ringMesh.visible = true;
      this.innerRingMesh.visible = true;

      this.renderer.toneMappingExposure = 1.15;
    }
  }

  /**
   * Aísla un subsistema específico (ej. refrigeración o silicio) aplicando efecto translúcido
   */
  public isolateCategory(category: string | null): void {
    this.laptop.isolateCategory(category);
  }

  /**
   * Calcula las coordenadas de pantalla 2D proyectadas para cada hotspot 3D en tiempo real
   */
  public getHotspotsScreenPositions(): Record<
    string,
    {
      x: number;
      y: number;
      visible: boolean;
      name: string;
      code: string;
      badge: string;
      metric: string;
      targetId: string;
    }
  > {
    const result: Record<
      string,
      {
        x: number;
        y: number;
        visible: boolean;
        name: string;
        code: string;
        badge: string;
        metric: string;
        targetId: string;
      }
    > = {};

    if (!this.container || !this.camera) return result;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const defs = this.laptop.getHotspotDefinitions();

    defs.forEach((def) => {
      const obj = def.getObject();
      if (!obj) return;

      const worldPos = new THREE.Vector3();
      obj.localToWorld(worldPos.copy(def.localOffset));

      const projected = worldPos.clone().project(this.camera);

      // Si está por delante de la cámara y dentro del cuadrante visible
      const inFront = projected.z < 1;
      const x = ((projected.x + 1) / 2) * width;
      const y = ((-projected.y + 1) / 2) * height;

      // Margen de seguridad para no salirse de los límites visibles de la ventana
      const inBounds = x >= 30 && x <= width - 30 && y >= 60 && y <= height - 90;

      result[def.id] = {
        x,
        y,
        visible: inFront && inBounds,
        name: def.name,
        code: def.code,
        badge: def.badge,
        metric: def.metric,
        targetId: def.targetId
      };
    });

    return result;
  }

  /**
   * Bucle principal de renderizado continuo a 60/120 FPS con suavizado cinemático
   */
  private startLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Actualizar modelo 3D (ventiladores, rotaciones y partículas térmicas)
      this.laptop.update(delta, this.fanRPM);

      // Amortiguamiento cinemático de cámara o actualización de OrbitControls
      if (!this.isInspecting) {
        const damp = 1 - Math.exp(-20 * delta);
        this.camera.position.lerp(this.desiredCameraPos, damp);
        this.currentCameraTarget.lerp(this.desiredCameraTarget, damp);
        this.camera.lookAt(this.currentCameraTarget);
      } else {
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Libera recursos WebGL y listeners de eventos al desmontar el componente React
   */
  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.onWindowResize);
    this.container.removeEventListener('mousemove', this.onPointerMove);
    this.container.removeEventListener('click', this.onPointerDown);

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
