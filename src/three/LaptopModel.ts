import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PARTS, BOARD_GROUPS } from '../data/laptopSpecs';
import { ViewMode, SystemId } from '../types/laptop';

/**
 * Crea una figura 2D rectangular con esquinas redondeadas (equivalente a $t en Inside MacBook)
 */
function createRoundedRectShape(width: number, height: number, radius: number, offsetX = 0, offsetY = 0): THREE.Shape {
  const shape = new THREE.Shape();
  const x = offsetX - width / 2;
  const y = offsetY - height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function createExtrudedMesh(
  shape: THREE.Shape,
  depth: number,
  yOffset: number,
  color: number | string,
  metalness = 0.65,
  roughness = 0.38,
  tapered = false
): THREE.Mesh {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 6,
    bevelEnabled: false,
    curveSegments: 28
  });

  if (tapered) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const zNorm = THREE.MathUtils.smoothstep(pos.getZ(i) / depth, 0.65, 1.0);
      pos.setXY(i, pos.getX(i) * (1 - 0.013 * zNorm), pos.getY(i) * (1 - 0.018 * zNorm));
    }
    geo.computeVertexNormals();
  }

  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = yOffset;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createRoundedBox(
  size: [number, number, number],
  position: [number, number, number],
  color: number | string,
  radius = 0.035,
  metalness = 0.65,
  roughness = 0.36
): THREE.Mesh {
  const r = Math.min(radius, Math.min(...size) / 2.1);
  const geo = new RoundedBoxGeometry(size[0], size[1], size[2], 3, r);
  const mat = new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createScrew(position: [number, number, number]): THREE.Group {
  const g = new THREE.Group();
  g.position.set(position[0], position[1], position[2]);

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.029, 0.029, 0.008, 12),
    new THREE.MeshStandardMaterial({ color: '#a7aaa5', metalness: 0.85, roughness: 0.3 })
  );
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.002, 0.006),
    new THREE.MeshStandardMaterial({ color: '#282d28' })
  );
  slot.position.y = 0.005;
  g.add(head, slot);
  return g;
}

export class LaptopModel {
  public readonly group: THREE.Group;
  public readonly assemblyGroup: THREE.Group;
  public readonly boardStudyGroup: THREE.Group;

  // Mapa de los 16 grupos de piezas individuales (centrados en su origen local)
  public readonly partGroups: Map<string, THREE.Group> = new Map();
  // Subgrupo interno para compensar el pivote de la pantalla en modo Knolling
  private displayInnerGroup!: THREE.Group;
  private displayLidGroup!: THREE.Group;
  // Rotores de los ventiladores para giro continuo
  private fanRotors: THREE.Object3D[] = [];

  // Grupos del modo "Explorar placa base" (8 bloques funcionales)
  public readonly boardPartGroups: Map<string, THREE.Group> = new Map();
  private boardLines: Map<string, THREE.Line> = new Map();

  // Materiales originales para restaurar entre modos Normal / FLIR / Rayos X
  private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map();
  public readonly interactiveMeshes: THREE.Mesh[] = [];

  private lidAngle = 1.945;

  constructor() {
    this.group = new THREE.Group();
    this.assemblyGroup = new THREE.Group();
    this.boardStudyGroup = new THREE.Group();
    this.boardStudyGroup.visible = false;

    this.group.add(this.assemblyGroup, this.boardStudyGroup);

    this.buildAllParts();
    this.buildBoardStudyScene();
    this.registerMaterials();
  }

  /**
   * Construye las 16 piezas modulares del ASUS TUF Gaming A15 centradas en su propio sistema local
   */
  private buildAllParts(): void {
    PARTS.forEach((part) => {
      const wrapper = new THREE.Group();
      wrapper.name = part.id;
      wrapper.userData = { componentId: part.id };
      wrapper.position.set(part.at[0], part.at[1], part.at[2]);

      const inner = new THREE.Group();
      inner.userData = { componentId: part.id };
      wrapper.add(inner);

      switch (part.id) {
        case 'top-case':
          this.buildTopCase(inner);
          break;
        case 'bottom-cover':
          this.buildBottomCover(inner);
          break;
        case 'display':
          this.displayInnerGroup = inner;
          this.buildDisplay(inner);
          break;
        case 'keyboard':
          this.buildKeyboard(inner);
          break;
        case 'trackpad':
          this.buildTrackpad(inner);
          break;
        case 'logic-board':
          this.buildLogicBoard(inner);
          break;
        case 'cpu-ryzen':
          this.buildProcessorChip(inner, 'RYZEN 9', '7940HS · 4NM', '#2a3439', '#8c9498');
          break;
        case 'gpu-rtx':
          this.buildProcessorChip(inner, 'RTX 4070', 'ADA · 140W TGP', '#1f332c', '#889690', true);
          break;
        case 'left-fan':
          this.buildArcFlowFan(inner, false);
          break;
        case 'right-fan':
          this.buildArcFlowFan(inner, true);
          break;
        case 'heatsink':
          this.buildHeatsink(inner);
          break;
        case 'ram-ddr5':
          this.buildRamModules(inner);
          break;
        case 'ssd-nvme':
          this.buildSsdModule(inner);
          break;
        case 'battery':
          this.buildBattery(inner);
          break;
        case 'speakers':
          this.buildSpeakers(inner);
          break;
        case 'io-hinges':
          this.buildIoAndHinges(inner);
          break;
      }

      // Propagar componentId a todas las mallas hijas para el raycaster
      wrapper.traverse((child) => {
        child.userData.componentId = part.id;
      });

      this.partGroups.set(part.id, wrapper);
      this.assemblyGroup.add(wrapper);
    });
  }

  /**
   * 1. Carcasa superior (C-Cover) con huecos empotrados para teclado y touchpad y paredes laterales
   */
  private buildTopCase(target: THREE.Group): void {
    const topDeckShape = createRoundedRectShape(6.252, 4.424, 0.17);
    topDeckShape.holes.push(createRoundedRectShape(5.59, 2.3, 0.085, 0, -0.72));
    topDeckShape.holes.push(createRoundedRectShape(2.62, 1.63, 0.1, 0, 1.29));

    const skirtShape = createRoundedRectShape(6.252, 4.424, 0.17);
    skirtShape.holes.push(createRoundedRectShape(6.12, 4.29, 0.13));

    const deckMesh = createExtrudedMesh(topDeckShape, 0.032, 0.02, '#232830', 0.68, 0.34);
    const skirtMesh = createExtrudedMesh(skirtShape, 0.185, 0.005, '#1d2229', 0.68, 0.36, true);

    // Muesca frontal de apertura y bisagra trasera oscura
    const frontLip = createRoundedBox([0.96, 0.014, 0.085], [0, 0.014, 2.185], '#39414a', 0.006);
    const rearVentBar = createRoundedBox([5.15, 0.07, 0.13], [0, -0.022, -2.14], '#14171c', 0.02);

    // Indicadores LED TUF de estado (4 puntos ámbar)
    const ledGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.01, 10);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    [-0.18, -0.06, 0.06, 0.18].forEach((x) => {
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(x, 0.025, -1.96);
      target.add(led);
    });

    // Botón de encendido hexagonal TUF en esquina superior derecha
    const pwrBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.015, 6),
      new THREE.MeshStandardMaterial({ color: '#333b44', metalness: 0.7, roughness: 0.3 })
    );
    pwrBtn.position.set(2.68, 0.022, -1.96);

    target.add(deckMesh, skirtMesh, frontLip, rearVentBar, pwrBtn);
  }

  /**
   * 2. Tapa inferior (D-Cover) con pies de goma, rejilla panal de abeja y grabado TUF
   */
  private buildBottomCover(target: THREE.Group): void {
    const baseShape = createRoundedRectShape(6.15, 4.31, 0.22);
    const baseMesh = createExtrudedMesh(baseShape, 0.016, 0.012, '#171b20', 0.55, 0.45);
    target.add(baseMesh);

    // 4 patas de goma antideslizantes
    [-2.65, 2.65].forEach((x) => {
      [-1.71, 1.71].forEach((z) => {
        const foot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.15, 0.018, 32),
          new THREE.MeshStandardMaterial({ color: '#262b30', roughness: 0.9 })
        );
        foot.position.set(x, -0.009, z);
        target.add(foot);
      });
    });

    // Textura inferior con inscripción TUF GAMING A15 y rejilla hexagonal
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 1024, 512);

    // Ranuras de admisión tipo panal
    ctx.fillStyle = '#0c0f12';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 22; c++) {
        ctx.fillRect(180 + c * 30, 90 + r * 24, 22, 10);
      }
    }
    ctx.font = '700 54px monospace';
    ctx.fillStyle = '#737c86';
    ctx.textAlign = 'center';
    ctx.fillText('ASUS TUF GAMING A15', 512, 345);
    ctx.font = '500 24px monospace';
    ctx.fillStyle = '#525a63';
    ctx.fillText('FA507NV · MIL-STD-810H VERIFIED CHASSIS', 512, 390);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const labelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.9),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.85, depthWrite: false })
    );
    labelPlane.rotation.x = Math.PI / 2;
    labelPlane.position.set(0, -0.005, 0);
    target.add(labelPlane);

    // Tornillos perimetrales
    [-2.9, -1.1, 1.1, 2.9].forEach((x) => {
      [-1.94, 1.94].forEach((z) => {
        const s = createScrew([x, -0.005, z]);
        s.rotation.x = Math.PI;
        target.add(s);
      });
    });
  }

  /**
   * 3. Pantalla IPS 144Hz con tapa de aluminio y telemetría gráfica
   */
  private buildDisplay(target: THREE.Group): void {
    this.displayLidGroup = new THREE.Group();
    this.displayLidGroup.rotation.x = -this.lidAngle;
    target.add(this.displayLidGroup);

    // Carcasa de aluminio de la pantalla (A-Cover)
    const lidShell = createRoundedBox([6.252, 0.065, 4.2], [0, 0, 2.01], '#1d2228', 0.03, 0.68, 0.34);
    const bezel = createRoundedBox([6.19, 0.014, 4.115], [0, -0.04, 2.01], '#0b0e12', 0.006, 0.1, 0.8);

    // Wallpaper técnico de alta resolución en el panel IPS 144Hz
    const canvas = document.createElement('canvas');
    canvas.width = 1512;
    canvas.height = 982;
    const ctx = canvas.getContext('2d')!;

    const bgGrad = ctx.createRadialGradient(756, 491, 80, 756, 491, 820);
    bgGrad.addColorStop(0, '#16222f');
    bgGrad.addColorStop(0.55, '#0b1118');
    bgGrad.addColorStop(1, '#06090d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1512, 982);

    // Líneas geométricas sutiles estilo estudio de ingeniería
    ctx.strokeStyle = 'rgba(120, 180, 215, 0.14)';
    ctx.lineWidth = 2;
    for (let r = 140; r <= 420; r += 70) {
      ctx.beginPath();
      ctx.arc(756, 491, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Emblema central y especificaciones de pantalla
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.font = '700 56px sans-serif';
    ctx.fillText('ASUS TUF GAMING A15', 756, 470);
    ctx.fillStyle = '#8fa8be';
    ctx.font = '500 25px monospace';
    ctx.fillText('15.6" FHD 144HZ IPS · 100% SRGB · NVIDIA G-SYNC · MUX SWITCH', 756, 525);

    const screenTex = new THREE.CanvasTexture(canvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = 8;

    const lcdPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.04, 3.92),
      new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })
    );
    lcdPlane.rotation.x = Math.PI / 2;
    lcdPlane.position.set(0, -0.049, 2.03);

    // Módulo de cámara superior HD 720p
    const camHousing = createRoundedBox([0.7, 0.008, 0.19], [0, -0.056, 3.925], '#080b0e', 0.003, 0.1, 0.8);
    const camLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.018, 16),
      new THREE.MeshBasicMaterial({ color: '#1e3a4c' })
    );
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, -0.062, 3.95);

    this.displayLidGroup.add(lidShell, bezel, lcdPlane, camHousing, camLens);
  }

  /**
   * 4. Teclado chiclet RGB con teclas WASD translúcidas y serigrafía de alta definición
   */
  private buildKeyboard(target: THREE.Group): void {
    const basePlate = createRoundedBox([5.55, 0.014, 2.265], [0, -0.006, 0], '#0b0d11', 0.005, 0.1, 0.85);
    target.add(basePlate);

    const rows = [
      ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'DEL'],
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '⌫'],
      ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
      ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
      ['CTRL', 'FN', 'WIN', 'ALT', 'TUF GAMING', 'ALT', 'CTRL', '◀', '▲▼', '▶']
    ];
    const weights = [
      [1.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
      [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
      [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
      [1.1, 1, 1, 1.2, 5.6, 1.2, 1, 0.95, 0.95, 0.95]
    ];

    const canvas = document.createElement('canvas');
    canvas.width = 1680;
    canvas.height = 700;
    const ctx = canvas.getContext('2d')!;

    rows.forEach((row, rIdx) => {
      let xCursor = 10;
      row.forEach((label, cIdx) => {
        const wPx = (weights[rIdx][cIdx] / 15) * 1660;
        const keyW = wPx - 10;
        const yPx = 10 + rIdx * 114;
        const keyH = 102;

        const isWASD =
          (rIdx === 2 && label === 'W') ||
          (rIdx === 3 && (label === 'A' || label === 'S' || label === 'D'));

        const kx = ((xCursor + keyW / 2) / 1680) * 5.49 - 2.745;
        const kz = ((yPx + keyH / 2) / 700) * 2.23 - 1.115;
        const kw = (keyW / 1680) * 5.49;
        const kd = (keyH / 700) * 2.23;

        const keyMesh = createRoundedBox(
          [kw, 0.022, kd],
          [kx, 0.008, kz],
          isWASD ? '#9cc5d9' : '#13171e',
          0.007,
          isWASD ? 0.25 : 0.08,
          isWASD ? 0.25 : 0.82
        );
        target.add(keyMesh);

        ctx.fillStyle = isWASD ? '#0f172a' : '#dce3ec';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${label.length > 2 ? 15 : 23}px sans-serif`;
        ctx.fillText(label, xCursor + keyW / 2, yPx + keyH / 2);

        xCursor += wPx;
      });
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const legendPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.49, 2.23),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })
    );
    legendPlane.rotation.x = -Math.PI / 2;
    legendPlane.position.set(0, 0.021, 0);
    target.add(legendPlane);
  }

  /**
   * 5. Touchpad de precisión (+26% superficie)
   */
  private buildTrackpad(target: THREE.Group): void {
    const base = createRoundedBox([2.596, 0.022, 1.603], [0, 0, 0], '#181c22', 0.01, 0.35, 0.45);
    const surface = createRoundedBox([2.57, 0.004, 1.58], [0, 0.013, 0], '#20262e', 0.002, 0.4, 0.5);
    target.add(base, surface);
  }

  /**
   * 6. Placa base (Logic Board) con recortes circulares para ventiladores y fases VRM Digi+
   */
  private buildLogicBoard(target: THREE.Group): void {
    const pcbShape = createRoundedRectShape(5.9, 2.25, 0.08);
    [-1.96, 1.96].forEach((x) => {
      const hole = new THREE.Path();
      hole.absarc(x, 0, 0.8, 0, Math.PI * 2, true);
      pcbShape.holes.push(hole);
    });

    const pcbMesh = createExtrudedMesh(pcbShape, 0.038, 0, '#1d2d27', 0.25, 0.55);
    target.add(pcbMesh);

    // Zócalos centrales y bancos de bobinas VRM DrMOS
    const centerSocket = createRoundedBox([1.55, 0.035, 1.5], [0, 0.022, -0.03], '#1c2124', 0.02, 0.2, 0.6);
    target.add(centerSocket);

    [-1, 1].forEach((side) => {
      // Bancos de reguladores VRM y condensadores SMD
      for (let i = 0; i < 12; i++) {
        const choke = createRoundedBox(
          [0.12, 0.035, i % 3 ? 0.08 : 0.15],
          [side * (0.28 + (i % 6) * 0.25), 0.025, 0.85 + Math.floor(i / 6) * 0.14],
          i % 3 ? '#9f9d82' : '#3d4640',
          0.004
        );
        target.add(choke);
      }

      // Conectores laterales en placa
      for (let j = 0; j < 6; j++) {
        const smd = createRoundedBox(
          [0.15, 0.045, 0.14],
          [side * 2.76, 0.022, -0.72 + j * 0.26],
          j % 2 ? '#4d554c' : '#a4a696',
          0.005
        );
        target.add(smd);
      }

      target.add(createScrew([side * 2.8, 0.022, -1.0]));
      target.add(createScrew([side * 2.8, 0.022, 1.0]));
    });
  }

  /**
   * 7 y 8. Encapsulados de Silicio (AMD Ryzen 9 7940HS y NVIDIA GeForce RTX 4070)
   */
  private buildProcessorChip(
    target: THREE.Group,
    title: string,
    subtitle: string,
    substrateColor: string,
    dieColor: string,
    withVram = false
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = dieColor;
    ctx.fillRect(0, 0, 512, 384);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#182026';
    ctx.font = '700 66px sans-serif';
    ctx.fillText(title, 256, 195);
    ctx.font = '600 24px monospace';
    ctx.fillText(subtitle, 256, 250);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const substrate = createRoundedBox([1.12, 0.028, 0.88], [0, 0, 0], substrateColor, 0.012, 0.3, 0.6);
    const heatspreader = createRoundedBox([0.88, 0.034, 0.68], [0, 0.023, 0], dieColor, 0.014, 0.72, 0.28);

    const labelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.84, 0.64),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.65, roughness: 0.34 })
    );
    labelPlane.rotation.x = -Math.PI / 2;
    labelPlane.position.set(0, 0.042, 0);

    target.add(substrate, heatspreader, labelPlane);

    if (withVram) {
      // 4 chips GDDR6 rodeando el die de la RTX 4070
      [
        [-0.42, -0.22],
        [-0.42, 0.22],
        [0.42, -0.22],
        [0.42, 0.22]
      ].forEach(([vx, vz]) => {
        const vram = createRoundedBox([0.14, 0.02, 0.22], [vx, 0.018, vz], '#161b20', 0.004, 0.4, 0.5);
        target.add(vram);
      });
    }
  }

  /**
   * 9 y 10. Ventiladores Arc Flow de 84 aspas LCP (Izquierdo y Derecho)
   */
  private buildArcFlowFan(target: THREE.Group, flipped: boolean): void {
    const root = new THREE.Group();
    root.scale.set(flipped ? -1 : 1, 0.68, 1);
    target.add(root);

    const scrollShape = new THREE.Shape();
    scrollShape.moveTo(-0.66, -0.8);
    scrollShape.lineTo(0.64, -0.8);
    scrollShape.lineTo(0.64, -0.2);
    scrollShape.bezierCurveTo(0.92, 0.4, 0.45, 0.84, -0.05, 0.83);
    scrollShape.bezierCurveTo(-0.74, 0.83, -0.87, 0.25, -0.66, -0.2);
    scrollShape.closePath();

    const intakeHole = new THREE.Path();
    intakeHole.absarc(0, 0.12, 0.4, 0, Math.PI * 2, true);
    scrollShape.holes.push(intakeHole);

    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.71, 0.69, 0.12, 56),
      new THREE.MeshStandardMaterial({ color: '#24292e', metalness: 0.45, roughness: 0.45 })
    );
    drum.position.set(0, 0, 0.12);

    const topPlate = createExtrudedMesh(scrollShape, 0.025, 0.1, '#2f353b', 0.45, 0.42);

    // Rotor giratorio con aspas LCP
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 0.12, 0.12);

    const bladeCount = 42;
    const bladeGeo = new THREE.BoxGeometry(0.19, 0.024, 0.012);
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#687077', roughness: 0.4, metalness: 0.52 });

    for (let i = 0; i < bladeCount; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = (i / bladeCount) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0.285, 0, 0);
      blade.rotation.y = 0.4;
      pivot.add(blade);
      rotorGroup.add(pivot);
    }

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.175, 0.18, 0.032, 36),
      new THREE.MeshStandardMaterial({ color: '#c2c6c9', roughness: 0.28, metalness: 0.82 })
    );
    hub.position.y = 0.016;
    rotorGroup.add(hub);
    this.fanRotors.push(rotorGroup);

    // Bloque de aletas de radiador acoplado a la salida trasera del ventilador
    const finBox = createRoundedBox([1.28, 0.18, 0.34], [0, 0.01, -0.71], '#22272c', 0.015);
    for (let f = 0; f < 32; f++) {
      const fin = createRoundedBox(
        [0.014, 0.11, 0.1],
        [(f - 15.5) * 0.036, 0.02, -0.89],
        '#b87333',
        0.003,
        0.75,
        0.32
      );
      root.add(fin);
    }

    root.add(drum, topPlate, rotorGroup, finBox);
  }

  /**
   * 11. Red de 5 Caloductos de Cobre Sinterizado y Platos Fríos (Heatsink)
   */
  private buildHeatsink(target: THREE.Group): void {
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.45, 0.02, -0.74),
      new THREE.Vector3(-1.25, 0.02, -0.58),
      new THREE.Vector3(-0.65, 0.02, 0.16),
      new THREE.Vector3(0, 0.02, 0.26),
      new THREE.Vector3(0.65, 0.02, 0.16),
      new THREE.Vector3(1.25, 0.02, -0.58),
      new THREE.Vector3(2.45, 0.02, -0.74)
    ]);

    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.35, -0.01, -0.86),
      new THREE.Vector3(-1.1, -0.01, -0.35),
      new THREE.Vector3(0, -0.01, -0.1),
      new THREE.Vector3(1.1, -0.01, -0.35),
      new THREE.Vector3(2.35, -0.01, -0.86)
    ]);

    const copperMat = new THREE.MeshStandardMaterial({
      color: '#b86f38',
      metalness: 0.78,
      roughness: 0.28
    });

    const pipe1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 64, 0.11, 12, false), copperMat);
    pipe1.scale.set(1, 0.42, 1);

    const pipe2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 64, 0.095, 12, false), copperMat);
    pipe2.scale.set(1, 0.42, 1);

    // Platos fríos sobre CPU y GPU
    const cpuColdPlate = createRoundedBox([0.95, 0.05, 0.82], [-0.65, -0.01, 0.08], '#9e5d2c', 0.01, 0.75, 0.32);
    const gpuColdPlate = createRoundedBox([1.05, 0.05, 0.86], [0.65, -0.01, 0.08], '#9e5d2c', 0.01, 0.75, 0.32);

    // Aletas traseras de cobre
    [-1.96, 1.96].forEach((rx) => {
      for (let i = 0; i < 26; i++) {
        const fin = createRoundedBox(
          [0.018, 0.13, 0.26],
          [rx + (i - 12.5) * 0.045, 0, -0.86],
          '#8f562b',
          0.003,
          0.72,
          0.35
        );
        target.add(fin);
      }
    });

    target.add(pipe1, pipe2, cpuColdPlate, gpuColdPlate);
  }

  /**
   * 12. Doble módulo de memoria RAM SO-DIMM DDR5-4800
   */
  private buildRamModules(target: THREE.Group): void {
    [-0.58, 0.58].forEach((xOffset) => {
      const stick = new THREE.Group();
      stick.position.set(xOffset, 0, 0);

      const pcb = createRoundedBox([0.92, 0.025, 0.42], [0, 0, 0], '#183b2b', 0.008, 0.25, 0.55);
      stick.add(pcb);

      // 4 chips DRAM DDR5 en cada cara
      for (let c = 0; c < 4; c++) {
        const chip = createRoundedBox(
          [0.17, 0.018, 0.22],
          [-0.3 + c * 0.2, 0.018, -0.02],
          '#14181d',
          0.003,
          0.3,
          0.45
        );
        stick.add(chip);
      }

      // Contactos dorados SO-DIMM
      const goldPins = createRoundedBox([0.84, 0.01, 0.05], [0, 0.002, -0.19], '#d4af37', 0.002, 0.85, 0.25);
      stick.add(goldPins);

      target.add(stick);
    });
  }

  /**
   * 13. Unidad SSD M.2 2280 NVMe PCIe 4.0 con lámina térmica de cobre
   */
  private buildSsdModule(target: THREE.Group): void {
    const pcb = createRoundedBox([0.46, 0.026, 1.48], [0, 0, 0], '#16242b', 0.008, 0.25, 0.55);
    const controller = createRoundedBox([0.28, 0.022, 0.28], [0, 0.018, -0.45], '#8c949a', 0.004, 0.75, 0.3);
    const nand1 = createRoundedBox([0.34, 0.02, 0.38], [0, 0.018, -0.02], '#12161a', 0.004, 0.3, 0.5);
    const nand2 = createRoundedBox([0.34, 0.02, 0.38], [0, 0.018, 0.42], '#12161a', 0.004, 0.3, 0.5);
    const copperShield = createRoundedBox([0.38, 0.008, 1.15], [0, 0.028, 0.05], '#b87333', 0.002, 0.78, 0.28);
    const m2Pins = createRoundedBox([0.36, 0.01, 0.07], [0, 0.002, -0.71], '#d4af37', 0.002, 0.85, 0.25);
    const mountScrew = createScrew([0, 0.018, 0.71]);

    target.add(pcb, controller, nand1, nand2, copperShield, m2Pins, mountScrew);
  }

  /**
   * 14. Batería de 90Wh de 4 celdas de polímero de litio
   */
  private buildBattery(target: THREE.Group): void {
    const frame = createRoundedBox([4.85, 0.04, 1.58], [0, -0.02, 0], '#1b1f24', 0.02, 0.2, 0.75);
    target.add(frame);

    // 4 celdas Li-Po individuales
    [-1.75, -0.58, 0.58, 1.75].forEach((cx) => {
      const cell = createRoundedBox([1.08, 0.095, 1.46], [cx, 0.01, 0], '#2c3238', 0.035, 0.12, 0.82);
      const foil = createRoundedBox([1.0, 0.008, 1.36], [cx, 0.058, 0], '#373e46', 0.004, 0.15, 0.78);
      target.add(cell, foil);
    });

    // Etiqueta técnica 90Wh
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2c3238';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ASUS C41N2013 · 90Wh 4-CELL LI-ION POLYMER', 512, 118);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 26px monospace';
    ctx.fillText('15.4V === 5845mAh · FAST CHARGE 50% IN 30 MIN', 512, 175);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })
    );
    labelMesh.rotation.x = -Math.PI / 2;
    labelMesh.position.set(0, 0.064, 0);
    target.add(labelMesh);
  }

  /**
   * 15. Pareja de Altavoces Estéreo Dolby Atmos
   */
  private buildSpeakers(target: THREE.Group): void {
    [-2.78, 2.78].forEach((sx) => {
      const spk = new THREE.Group();
      spk.position.set(sx, 0, 0);

      const chamber = createRoundedBox([0.32, 0.12, 1.68], [0, 0, 0], '#21262c', 0.05, 0.2, 0.65);
      const wooferBox = createRoundedBox([0.48, 0.11, 0.54], [sx < 0 ? 0.06 : -0.06, 0.005, 0.56], '#282e35', 0.05);
      const cone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.014, 28),
        new THREE.MeshStandardMaterial({ color: '#111519', metalness: 0.3, roughness: 0.5 })
      );
      cone.position.set(sx < 0 ? 0.06 : -0.06, 0.065, 0.56);

      spk.add(chamber, wooferBox, cone);
      target.add(spk);
    });
  }

  /**
   * 16. Puertos I/O Laterales (USB4, HDMI 2.1, RJ45) y Bisagras Reforzadas
   */
  private buildIoAndHinges(target: THREE.Group): void {
    // Conectores laterales izquierdos (RJ45, HDMI 2.1, USB4, USB-C)
    [-0.95, -0.45, 0.05, 0.5].forEach((zPos, idx) => {
      const shield = createRoundedBox(
        [0.32, idx === 0 ? 0.095 : 0.065, idx < 2 ? 0.28 : 0.2],
        [-2.92, 0.02, zPos],
        '#a3aba8',
        0.02,
        0.8,
        0.28
      );
      target.add(shield);
    });

    // Puerto USB-A derecho
    const rightPort = createRoundedBox([0.32, 0.07, 0.28], [2.92, 0.02, 0.1], '#a3aba8', 0.02, 0.8, 0.28);
    target.add(rightPort);

    // Par de bisagras posteriores de acero templado
    [-2.35, 2.35].forEach((hx) => {
      const hinge = new THREE.Group();
      hinge.position.set(hx, 0.08, -1.25);

      const bracket = createRoundedBox([0.62, 0.03, 0.24], [0, 0, 0], '#9fa6a7', 0.01, 0.82, 0.3);
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.052, 0.58, 24),
        new THREE.MeshStandardMaterial({ color: '#5f696b', metalness: 0.85, roughness: 0.28 })
      );
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(0, 0.03, -0.08);

      hinge.add(bracket, barrel, createScrew([-0.22, 0.02, 0.06]), createScrew([0.22, 0.02, 0.06]));
      target.add(hinge);
    });
  }

  /**
   * Construye la escena dedicada para el modo "Explorar placa base" (8 grupos de circuito con líneas guía)
   */
  private buildBoardStudyScene(): void {
    // PCB base de gran formato
    const shape = createRoundedRectShape(8.1, 3.4, 0.15);
    [-2.65, 2.65].forEach((fx) => {
      const hole = new THREE.Path();
      hole.absarc(fx, 0, 1.0, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    });

    const boardMesh = createExtrudedMesh(shape, 0.12, 0, '#172821', 0.25, 0.72);
    this.boardStudyGroup.add(boardMesh);

    // Anillos de cobre en los huecos de ventilador
    [-2.65, 2.65].forEach((fx) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.0, 1.03, 64),
        new THREE.MeshStandardMaterial({ color: '#60715a', metalness: 0.4, roughness: 0.6, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(fx, 0.008, 0);
      this.boardStudyGroup.add(ring);
    });

    // Los 8 bloques funcionales que se elevan con progreso (0..1)
    BOARD_GROUPS.forEach((bg, idx) => {
      const g = new THREE.Group();
      g.position.set(bg.position[0], bg.position[1], bg.position[2]);
      g.userData = { boardGroupId: bg.id };

      const [w, h, d] = bg.size;
      const body = createRoundedBox([w, h, d], [0, 0, 0], '#18211f', 0.035, 0.4, 0.55);
      g.add(body);

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = idx < 2 ? '#a9b0ad' : '#303936';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = idx < 2 ? '#1e2825' : '#d2d8d4';
      ctx.textAlign = 'center';
      ctx.font = '700 44px monospace';
      ctx.fillText(bg.shortName, 256, 120);
      ctx.font = '500 18px monospace';
      ctx.fillText(`BLOQUE ${String(idx + 1).padStart(2, '0')} · TUF PCB`, 256, 168);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const topLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.82, d * 0.74),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.35 })
      );
      topLabel.rotation.x = -Math.PI / 2;
      topLabel.position.set(0, h / 2 + 0.015, 0);
      g.add(topLabel);

      g.traverse((c) => {
        c.userData.boardGroupId = bg.id;
      });

      this.boardPartGroups.set(bg.id, g);
      this.boardStudyGroup.add(g);

      // Línea guía vertical hacia la placa
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(bg.position[0], 0.04, bg.position[2]),
        new THREE.Vector3(bg.position[0], bg.position[1], bg.position[2])
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: bg.color,
        transparent: true,
        opacity: 0.45
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.boardLines.set(bg.id, line);
      this.boardStudyGroup.add(line);
    });
  }

  /**
   * Registra todas las mallas interactivas y guarda sus materiales originales
   */
  private registerMaterials(): void {
    this.assemblyGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.interactiveMeshes.push(child);
        this.originalMaterials.set(child, child.material);
      }
    });
  }

  /**
   * Actualiza posiciones, rotaciones y escalas de las 16 piezas según el estado actual:
   * - 0.00 a 0.65: Desmontaje vertical por capas (at + spread * explosion).
   * - 0.65 a 1.00: Transición continua a la bandeja Knolling 4x4 ("All parts / Todas las piezas").
   * - Modo aislamiento (isolatedId): Centra la pieza elegida en [0, 0.35, 0].
   */
  public updateAssemblyState(params: {
    explosion: number;
    enabledSystems: SystemId[];
    selectedId: string | null;
    isolatedId: string | null;
    boardMode: boolean;
    boardProgress: number;
    lidAngle?: number;
    viewportWidth: number;
    viewportHeight: number;
    delta: number;
    fanRPM: number;
  }): void {
    const {
      explosion,
      enabledSystems,
      isolatedId,
      boardMode,
      boardProgress,
      lidAngle,
      viewportWidth,
      viewportHeight,
      delta,
      fanRPM
    } = params;

    this.assemblyGroup.visible = !boardMode;
    this.boardStudyGroup.visible = boardMode;

    // Giro de los rotores Arc Flow
    const radPerSec = (fanRPM / 60) * Math.PI * 2 * 0.08;
    this.fanRotors.forEach((rotor) => {
      rotor.rotation.y += radPerSec * delta;
    });

    if (boardMode) {
      BOARD_GROUPS.forEach((bg) => {
        const g = this.boardPartGroups.get(bg.id);
        const line = this.boardLines.get(bg.id);
        if (!g) return;
        const tx = bg.position[0] + bg.spread[0] * boardProgress;
        const ty = bg.position[1] + bg.spread[1] * boardProgress;
        const tz = bg.position[2] + bg.spread[2] * boardProgress;
        g.position.set(tx, ty, tz);

        if (line) {
          line.visible = boardProgress > 0.02;
          const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
          posAttr.setXYZ(1, tx, ty, tz);
          posAttr.needsUpdate = true;
        }
      });
      return;
    }

    // Actualizar apertura de pantalla
    const targetLid = lidAngle !== undefined ? lidAngle : 1.945;
    if (this.displayLidGroup) {
      this.displayLidGroup.rotation.x = -targetLid;
    }

    const r = Math.max(0, Math.min(1, explosion));
    const isKnolling = r > 0.65 && !isolatedId;
    const p = isolatedId ? 0 : THREE.MathUtils.smoothstep(r, 0.65, 1.0);

    // Geometría de cuadrícula 4x4 en el plano Z=0 para cámara con FOV=36° (altura visible = 10 unidades)
    const cols = 4;
    const rows = 4;
    const aspect = viewportWidth / Math.max(1, viewportHeight);
    const cellW = (10 * aspect) / cols;
    const cellH = 10 / rows;

    const damp = 1 - Math.exp(-14 * Math.min(delta, 0.1));

    PARTS.forEach((part, idx) => {
      const wrapper = this.partGroups.get(part.id);
      if (!wrapper) return;

      const systemEnabled = enabledSystems.includes(part.system);
      const isVisible = systemEnabled && (isolatedId === null || isolatedId === part.id);
      wrapper.visible = isVisible;
      if (!isVisible) return;

      const isIsolated = isolatedId === part.id;

      // Posición en el desmontaje por capas (0 .. 0.65), normalizada para abrir todas las capas con holgura
      const layerT = Math.min(1, r / 0.62);
      const layeredPos = new THREE.Vector3(
        part.at[0] + part.spread[0] * layerT,
        part.at[1] + part.spread[1] * layerT,
        part.at[2] + part.spread[2] * layerT
      );

      let targetPos = layeredPos;

      if (isIsolated) {
        targetPos = new THREE.Vector3(0, 0.45, 0);
      } else if (isKnolling) {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const gridX = (col - (cols - 1) / 2) * cellW;
        // Desplazamos +0.24 hacia arriba dentro de la celda para dejar espacio limpio al título y explicación debajo
        const gridY = ((rows - 1) / 2 - row) * cellH + 0.24;
        const gridPos = new THREE.Vector3(gridX, gridY, 0);

        const posAt65 = new THREE.Vector3(
          part.at[0] + part.spread[0],
          part.at[1] + part.spread[1],
          part.at[2] + part.spread[2]
        );
        targetPos = posAt65.lerp(gridPos, p);
      }

      // Escala adaptativa en modo Knolling para que piezas grandes y pequeñas armonicen en su celda 4x4
      const fitScale = Math.min(
        (cellW * 0.72) / part.sizeSpan,
        (cellH * 0.48) / (part.id === 'display' ? 4.3 : part.sizeSpan * 0.7)
      );
      const targetScale = isIsolated ? 1.15 : 1 + (fitScale - 1) * p;

      wrapper.position.lerp(targetPos, isKnolling ? 0.35 : damp);
      wrapper.scale.setScalar(targetScale);
      wrapper.rotation.set(part.id === 'display' ? 0 : 1.08 * p, -0.12 * p, 0);

      if (part.id === 'display' && this.displayInnerGroup) {
        if (isIsolated) {
          this.displayInnerGroup.position.set(0, -1.2, -0.8);
        } else {
          this.displayInnerGroup.position.set(0, -1.95 * p, 0.7 * p);
        }
      }
    });
  }

  /**
   * Cambia el modo de visualización de materiales: Normal, Térmico (FLIR) o Rayos X
   */
  public setViewMode(mode: ViewMode): void {
    this.interactiveMeshes.forEach((mesh) => {
      const orig = this.originalMaterials.get(mesh);
      if (!orig) return;

      if (mode === 'normal') {
        mesh.material = orig;
      } else if (mode === 'thermal') {
        const cid = mesh.userData?.componentId || '';
        let color = 0x0b2545;
        let emissive = 0x000000;
        let intensity = 0.1;

        if (cid === 'cpu-ryzen' || cid === 'gpu-rtx') {
          color = 0xff2a00;
          emissive = 0xffaa00;
          intensity = 0.85;
        } else if (cid === 'heatsink' || cid === 'left-fan' || cid === 'right-fan') {
          color = 0xff7b00;
          emissive = 0xff4800;
          intensity = 0.45;
        } else if (cid === 'logic-board' || cid === 'ram-ddr5' || cid === 'ssd-nvme') {
          color = 0x7b2cbf;
          emissive = 0x3c096c;
          intensity = 0.25;
        }

        mesh.material = new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity: intensity,
          roughness: 0.4,
          metalness: 0.2
        });
      } else if (mode === 'xray') {
        const cid = mesh.userData?.componentId || '';
        const isCore = ['cpu-ryzen', 'gpu-rtx', 'heatsink', 'left-fan', 'right-fan', 'ram-ddr5', 'ssd-nvme'].includes(cid);
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: isCore ? 0x38bdf8 : 0x64748b,
          emissive: isCore ? 0x0284c7 : 0x0f172a,
          emissiveIntensity: isCore ? 0.35 : 0.08,
          transparent: true,
          opacity: isCore ? 0.65 : 0.18,
          roughness: 0.2,
          metalness: 0.1,
          depthWrite: false
        });
      }
    });
  }

  /**
   * Devuelve la posición 3D en el mundo del centro de una pieza para colocar su pin flotante
   */
  public getPartWorldPosition(partId: string): THREE.Vector3 | null {
    const g = this.partGroups.get(partId);
    if (!g || !g.visible) return null;
    const pos = new THREE.Vector3();
    g.getWorldPosition(pos);
    pos.y += 0.32;
    return pos;
  }

  public getBoardGroupWorldPosition(boardGroupId: string): THREE.Vector3 | null {
    const g = this.boardPartGroups.get(boardGroupId);
    if (!g || !this.boardStudyGroup.visible) return null;
    const pos = new THREE.Vector3();
    g.getWorldPosition(pos);
    pos.y += 0.22;
    return pos;
  }
}
