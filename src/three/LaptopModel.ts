import * as THREE from 'three';
import { ViewMode } from '../types/laptop';
import {
  createMotherboardTexture,
  createHoneycombTexture,
  createScreenDisplayTexture,
  createBatteryTexture,
  createRamTexture,
  createSsdTexture
} from './proceduralTextures';

/**
 * Modelo 3D paramétrico y modular de alta fidelidad para el ASUS TUF Gaming A15 (FA507).
 * Estructurado en capas independientes para permitir el despiece interactivo (exploded view),
 * modos de inspección térmica, visión de rayos X y animación de turbinas con flujo de partículas.
 */
export class LaptopModel {
  public group: THREE.Group;

  // Grupos por capas físicas del portátil
  public dCoverGroup: THREE.Group;
  public batteryGroup: THREE.Group;
  public speakersGroup: THREE.Group;
  public motherboardGroup: THREE.Group;
  public ramModulesGroup: THREE.Group;
  public ssdGroup: THREE.Group;
  public wifiCardGroup: THREE.Group;
  public coolingGroup: THREE.Group;
  public cCoverGroup: THREE.Group;
  public screenGroup: THREE.Group;
  public hingesGroup: THREE.Group;

  // Turbinas giratorias Arc Flow
  private leftFanRotor: THREE.Group;
  private rightFanRotor: THREE.Group;

  // Partículas de flujo térmico
  private airflowParticles: THREE.Points;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private particleTypes: Float32Array; // 0 = aire frío entrante, 1 = aire caliente saliente

  // Gestión de materiales y modos visuales
  private currentViewMode: ViewMode = 'normal';
  private interactiveMeshes: THREE.Mesh[] = [];
  private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map();
  private highlightedComponentId: string | null = null;

  // Gráficos y texturas procedimentales cacheadas
  private motherboardTexture: THREE.CanvasTexture;
  private honeycombTexture: THREE.CanvasTexture;
  private screenDisplayTexture: THREE.CanvasTexture;
  private batteryTexture: THREE.CanvasTexture;
  private ramTexture: THREE.CanvasTexture;
  private ssdTexture: THREE.CanvasTexture;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'ASUS_TUF_A15_ROOT';

    // Inicializar texturas procedurales 2D
    this.motherboardTexture = createMotherboardTexture();
    this.honeycombTexture = createHoneycombTexture();
    this.screenDisplayTexture = createScreenDisplayTexture();
    this.batteryTexture = createBatteryTexture();
    this.ramTexture = createRamTexture();
    this.ssdTexture = createSsdTexture();

    // Crear grupos individuales
    this.dCoverGroup = new THREE.Group();
    this.batteryGroup = new THREE.Group();
    this.speakersGroup = new THREE.Group();
    this.motherboardGroup = new THREE.Group();
    this.ramModulesGroup = new THREE.Group();
    this.ssdGroup = new THREE.Group();
    this.wifiCardGroup = new THREE.Group();
    this.coolingGroup = new THREE.Group();
    this.cCoverGroup = new THREE.Group();
    this.screenGroup = new THREE.Group();
    this.hingesGroup = new THREE.Group();

    this.leftFanRotor = new THREE.Group();
    this.rightFanRotor = new THREE.Group();

    // Configurar metadatos identificativos para el Raycaster
    this.dCoverGroup.name = 'component_chassis';
    this.dCoverGroup.userData = { componentId: 'chassis' };

    this.batteryGroup.name = 'component_battery';
    this.batteryGroup.userData = { componentId: 'battery' };

    this.motherboardGroup.name = 'component_motherboard';
    this.motherboardGroup.userData = { componentId: 'motherboard' };

    this.ramModulesGroup.name = 'component_ram';
    this.ramModulesGroup.userData = { componentId: 'ram' };

    this.ssdGroup.name = 'component_ssd';
    this.ssdGroup.userData = { componentId: 'ssd' };

    this.coolingGroup.name = 'component_cooling';
    this.coolingGroup.userData = { componentId: 'cooling' };

    this.cCoverGroup.name = 'component_keyboard';
    this.cCoverGroup.userData = { componentId: 'keyboard' };

    this.screenGroup.name = 'component_display';
    this.screenGroup.userData = { componentId: 'display' };

    // Ensamblar la geometría de cada subsistema
    this.buildDCover();
    this.buildBattery();
    this.buildSpeakers();
    this.buildMotherboard();
    this.buildRamModules();
    this.buildSsdAndWifi();
    this.buildCoolingSystem();
    this.buildCCoverAndKeyboard();
    this.buildScreenAndHinges();
    const airflow = this.buildAirflowParticles();
    this.airflowParticles = airflow.particles;
    this.particlePositions = airflow.positions;
    this.particleVelocities = airflow.velocities;
    this.particleTypes = airflow.types;

    // Agregar subgrupos al grupo principal
    this.group.add(this.dCoverGroup);
    this.group.add(this.batteryGroup);
    this.group.add(this.speakersGroup);
    this.group.add(this.motherboardGroup);
    this.group.add(this.ramModulesGroup);
    this.group.add(this.ssdGroup);
    this.group.add(this.wifiCardGroup);
    this.group.add(this.coolingGroup);
    this.group.add(this.airflowParticles);
    this.group.add(this.cCoverGroup);
    this.group.add(this.hingesGroup);
    this.group.add(this.screenGroup);

    // Registrar mallas para detección de clics y guardar materiales base
    this.registerInteractiveMeshes(this.group);
  }

  /**
   * Recorre la jerarquía para almacenar los materiales originales y permitir raycasting
   */
  private registerInteractiveMeshes(root: THREE.Object3D): void {
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.interactiveMeshes.push(child);
        this.originalMaterials.set(child, child.material);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  public getInteractiveMeshes(): THREE.Mesh[] {
    return this.interactiveMeshes;
  }

  /**
   * 1. Tapa inferior D-Cover con rejillas de panal de abeja, patas de goma y tornillos
   */
  private buildDCover(): void {
    const width = 14;
    const depth = 9.6;
    const height = 0.45;

    // Bandeja base con chaflanes militares
    const baseGeo = new THREE.BoxGeometry(width, height, depth);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      metalness: 0.35,
      roughness: 0.65,
      map: this.honeycombTexture
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -height / 2;
    this.dCoverGroup.add(baseMesh);

    // 4 Patas de goma antideslizantes de alta amortiguación
    const footGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.12, 16);
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.95,
      metalness: 0.05
    });

    const footOffsets: [number, number][] = [
      [-6.0, -4.0],
      [6.0, -4.0],
      [-5.8, 3.8],
      [5.8, 3.8]
    ];

    footOffsets.forEach(([fx, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, -height - 0.06, fz);
      this.dCoverGroup.add(foot);
    });

    // Pata central de soporte adicional para evitar el flexado en escritorios
    const centerFootGeo = new THREE.BoxGeometry(2.5, 0.1, 0.4);
    const centerFoot = new THREE.Mesh(centerFootGeo, footMat);
    centerFoot.position.set(0, -height - 0.05, 0.5);
    this.dCoverGroup.add(centerFoot);

    // Tornillo pop-up cautivo de fácil extracción en la esquina inferior derecha
    const screwGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
    const screwMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });
    const popupScrew = new THREE.Mesh(screwGeo, screwMat);
    popupScrew.position.set(6.2, -height - 0.02, 4.0);
    this.dCoverGroup.add(popupScrew);

    this.dCoverGroup.position.set(0, -0.2, 0);
  }

  /**
   * 2. Batería Li-ion de 90Wh con 4 celdas planas, conector multipin y cableado
   */
  private buildBattery(): void {
    const batteryWidth = 12.0;
    const batteryDepth = 3.6;
    const batteryHeight = 0.35;

    // Celda masiva de 90Wh
    const batteryGeo = new THREE.BoxGeometry(batteryWidth, batteryHeight, batteryDepth);
    const batteryMat = new THREE.MeshStandardMaterial({
      color: 0x12151b,
      metalness: 0.2,
      roughness: 0.5,
      map: this.batteryTexture
    });
    const batteryMesh = new THREE.Mesh(batteryGeo, batteryMat);
    batteryMesh.position.set(0, 0, 2.7);
    this.batteryGroup.add(batteryMesh);

    // Conector multipin y cable flexible hacia la placa base
    const connectorGeo = new THREE.BoxGeometry(1.4, 0.2, 0.4);
    const connectorMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.4,
      roughness: 0.5
    });
    const connector = new THREE.Mesh(connectorGeo, connectorMat);
    connector.position.set(0, 0.1, 0.7);
    this.batteryGroup.add(connector);

    // Cables trenzados de alimentación (rojo, negro, blanco, azul)
    const cableColors = [0xef4444, 0x111827, 0x111827, 0x3b82f6];
    cableColors.forEach((color, i) => {
      const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const cableMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.rotation.x = Math.PI / 2;
      cable.position.set(-0.45 + i * 0.3, 0.1, 1.05);
      this.batteryGroup.add(cable);
    });

    this.batteryGroup.position.set(0, 0.05, 0);
  }

  /**
   * 3. Altavoces estéreo gemelos de 2W con cámaras de resonancia
   */
  private buildSpeakers(): void {
    const speakerGeo = new THREE.BoxGeometry(1.6, 0.35, 1.2);
    const speakerMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.4,
      roughness: 0.6
    });

    const coneGeo = new THREE.CylinderGeometry(0.35, 0.2, 0.1, 16);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xc49b3c,
      metalness: 0.8,
      roughness: 0.3
    });

    // Altavoz izquierdo
    const leftSpeaker = new THREE.Mesh(speakerGeo, speakerMat);
    leftSpeaker.position.set(-6.1, 0, 3.2);
    const leftCone = new THREE.Mesh(coneGeo, coneMat);
    leftCone.position.set(-6.1, -0.15, 3.2);
    this.speakersGroup.add(leftSpeaker, leftCone);

    // Altavoz derecho
    const rightSpeaker = new THREE.Mesh(speakerGeo, speakerMat);
    rightSpeaker.position.set(6.1, 0, 3.2);
    const rightCone = new THREE.Mesh(coneGeo, coneMat);
    rightCone.position.set(6.1, -0.15, 3.2);
    this.speakersGroup.add(rightSpeaker, rightCone);

    this.speakersGroup.position.set(0, 0.05, 0);
  }

  /**
   * 4. Placa base multicapa (PCB) con die AMD Ryzen 7, NVIDIA RTX 4060, VRAM y puertos I/O
   */
  private buildMotherboard(): void {
    const pcbWidth = 13.6;
    const pcbDepth = 5.2;
    const pcbHeight = 0.12;

    // Placa PCB con textura procedural ENIG dorada
    const pcbGeo = new THREE.BoxGeometry(pcbWidth, pcbHeight, pcbDepth);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      roughness: 0.45,
      metalness: 0.3,
      map: this.motherboardTexture
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.set(0, 0, -1.8);
    this.motherboardGroup.add(pcbMesh);

    // Socket y procesador AMD Ryzen 7 7735HS
    const cpuSubstrateGeo = new THREE.BoxGeometry(2.1, 0.08, 2.1);
    const cpuSubstrateMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      metalness: 0.5,
      roughness: 0.4
    });
    const cpuSubstrate = new THREE.Mesh(cpuSubstrateGeo, cpuSubstrateMat);
    cpuSubstrate.position.set(-2.6, pcbHeight / 2 + 0.04, -1.8);

    const cpuDieGeo = new THREE.BoxGeometry(1.2, 0.06, 1.4);
    const cpuDieMat = new THREE.MeshStandardMaterial({
      color: 0x8892b0,
      metalness: 0.95,
      roughness: 0.1
    });
    const cpuDie = new THREE.Mesh(cpuDieGeo, cpuDieMat);
    cpuDie.position.set(-2.6, pcbHeight / 2 + 0.09, -1.8);
    this.motherboardGroup.add(cpuSubstrate, cpuDie);

    // Chipset / Die NVIDIA GeForce RTX 4060 Laptop (AD107)
    const gpuSubstrateGeo = new THREE.BoxGeometry(2.5, 0.08, 2.5);
    const gpuSubstrateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.6,
      roughness: 0.4
    });
    const gpuSubstrate = new THREE.Mesh(gpuSubstrateGeo, gpuSubstrateMat);
    gpuSubstrate.position.set(2.2, pcbHeight / 2 + 0.04, -1.8);

    const gpuDieGeo = new THREE.BoxGeometry(1.5, 0.06, 1.5);
    const gpuDieMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.98,
      roughness: 0.08
    });
    const gpuDie = new THREE.Mesh(gpuDieGeo, gpuDieMat);
    gpuDie.position.set(2.2, pcbHeight / 2 + 0.09, -1.8);
    this.motherboardGroup.add(gpuSubstrate, gpuDie);

    // 8x Chips de VRAM GDDR6 alrededor de la GPU
    const vramGeo = new THREE.BoxGeometry(0.5, 0.05, 0.4);
    const vramMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.4,
      roughness: 0.6
    });

    const vramOffsets: [number, number][] = [
      [1.3, -2.7], [2.2, -2.7], [3.1, -2.7],
      [1.3, -0.9], [2.2, -0.9], [3.1, -0.9],
      [0.7, -1.5], [0.7, -2.1]
    ];

    vramOffsets.forEach(([vx, vz]) => {
      const vram = new THREE.Mesh(vramGeo, vramMat);
      vram.position.set(vx, pcbHeight / 2 + 0.04, vz);
      this.motherboardGroup.add(vram);
    });

    // Puertos I/O laterales
    // Lateral izquierdo: RJ-45, HDMI 2.1, 2x USB-C, Conector de audio 3.5mm
    const ioLeftGeo = new THREE.BoxGeometry(0.5, 0.35, 3.4);
    const ioMetalMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });
    const ioLeft = new THREE.Mesh(ioLeftGeo, ioMetalMat);
    ioLeft.position.set(-6.8, 0.12, -1.8);
    this.motherboardGroup.add(ioLeft);

    // Lateral derecho: 1x USB 3.2 Gen 1 Tipo-A
    const ioRightGeo = new THREE.BoxGeometry(0.4, 0.3, 0.8);
    const ioRight = new THREE.Mesh(ioRightGeo, ioMetalMat);
    ioRight.position.set(6.8, 0.12, -1.8);
    this.motherboardGroup.add(ioRight);

    this.motherboardGroup.position.set(0, 0.12, 0);
  }

  /**
   * 5. Módulos de memoria RAM DDR5 SO-DIMM (2 ranuras en doble canal)
   */
  private buildRamModules(): void {
    const ramWidth = 2.8;
    const ramDepth = 1.3;
    const ramHeight = 0.06;

    const ramGeo = new THREE.BoxGeometry(ramWidth, ramHeight, ramDepth);
    const ramMat = new THREE.MeshStandardMaterial({
      color: 0x143423,
      metalness: 0.4,
      roughness: 0.5,
      map: this.ramTexture
    });

    // Módulo SO-DIMM inferior (Slot 1)
    const ram1 = new THREE.Mesh(ramGeo, ramMat);
    ram1.position.set(-0.2, 0.3, -0.5);
    ram1.rotation.y = 0;
    this.ramModulesGroup.add(ram1);

    // Módulo SO-DIMM superior (Slot 2)
    const ram2 = new THREE.Mesh(ramGeo, ramMat);
    ram2.position.set(-0.2, 0.44, -0.5);
    this.ramModulesGroup.add(ram2);

    // Clips metálicos de sujeción lateral de zócalo SO-DIMM
    const clipGeo = new THREE.BoxGeometry(0.12, 0.2, 0.3);
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.15
    });

    const clipLeft = new THREE.Mesh(clipGeo, clipMat);
    clipLeft.position.set(-1.6, 0.35, -0.5);
    const clipRight = new THREE.Mesh(clipGeo, clipMat);
    clipRight.position.set(1.2, 0.35, -0.5);
    this.ramModulesGroup.add(clipLeft, clipRight);

    this.ramModulesGroup.position.set(0, 0, 0);
  }

  /**
   * 6. Almacenamiento SSD M.2 2280 PCIe 4.0 y tarjeta Wi-Fi 6E
   */
  private buildSsdAndWifi(): void {
    // Ranura 1: SSD 1TB instalado con lámina de grafito
    const ssdWidth = 3.6;
    const ssdDepth = 1.0;
    const ssdHeight = 0.08;

    const ssdGeo = new THREE.BoxGeometry(ssdWidth, ssdHeight, ssdDepth);
    const ssdMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.5,
      roughness: 0.4,
      map: this.ssdTexture
    });
    const ssdMesh = new THREE.Mesh(ssdGeo, ssdMat);
    ssdMesh.position.set(-4.6, 0.28, 0.2);
    this.ssdGroup.add(ssdMesh);

    // Tornillo Phillips de fijación SSD
    const screwGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const screw = new THREE.Mesh(screwGeo, screwMat);
    screw.position.set(-6.3, 0.32, 0.2);
    this.ssdGroup.add(screw);

    // Ranura 2 libre para expansión M.2 NVMe secundaria
    const slot2Geo = new THREE.BoxGeometry(3.6, 0.04, 1.0);
    const slot2Mat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.8,
      wireframe: true
    });
    const slot2Mesh = new THREE.Mesh(slot2Geo, slot2Mat);
    slot2Mesh.position.set(4.6, 0.22, 0.2);
    this.ssdGroup.add(slot2Mesh);

    // Tarjeta Wi-Fi 6E M.2 2230
    const wifiGeo = new THREE.BoxGeometry(1.4, 0.06, 1.2);
    const wifiMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.3,
      roughness: 0.5
    });
    const wifiMesh = new THREE.Mesh(wifiGeo, wifiMat);
    wifiMesh.position.set(-4.6, 0.25, -1.2);
    this.wifiCardGroup.add(wifiMesh);

    // Cables coaxiales de antena de alta frecuencia (Blanco y Negro)
    const curveWhite = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.4, 0.28, -1.2),
      new THREE.Vector3(-5.2, 0.32, -1.6),
      new THREE.Vector3(-6.2, 0.32, -3.2),
      new THREE.Vector3(-6.5, 0.32, -4.5)
    ]);
    const tubeWhiteGeo = new THREE.TubeGeometry(curveWhite, 20, 0.025, 8, false);
    const tubeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
    const tubeWhite = new THREE.Mesh(tubeWhiteGeo, tubeWhiteMat);

    const curveBlack = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.8, 0.28, -1.2),
      new THREE.Vector3(-5.4, 0.3, -1.8),
      new THREE.Vector3(-6.0, 0.3, -3.5),
      new THREE.Vector3(-6.3, 0.3, -4.5)
    ]);
    const tubeBlackGeo = new THREE.TubeGeometry(curveBlack, 20, 0.025, 8, false);
    const tubeBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const tubeBlack = new THREE.Mesh(tubeBlackGeo, tubeBlackMat);

    this.wifiCardGroup.add(tubeWhite, tubeBlack);
  }

  /**
   * 7. Sistema térmico integral Arc Flow: caloductos de cobre puro sinterizado, radiadores y ventiladores
   */
  private buildCoolingSystem(): void {
    // Ventilador izquierdo (CPU) y derecho (GPU)
    this.buildArcFlowFan(this.leftFanRotor, -4.8, -3.2);
    this.buildArcFlowFan(this.rightFanRotor, 4.8, -3.2);

    // 4 Radiadores de aletas disipadoras de calor (2 traseros, 2 laterales)
    const finMat = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.95,
      roughness: 0.2
    });

    // Radiadores traseros
    const rearFinGeo = new THREE.BoxGeometry(2.4, 0.45, 0.6);
    const rearLeftFin = new THREE.Mesh(rearFinGeo, finMat);
    rearLeftFin.position.set(-4.8, 0.32, -4.5);
    const rearRightFin = new THREE.Mesh(rearFinGeo, finMat);
    rearRightFin.position.set(4.8, 0.32, -4.5);
    this.coolingGroup.add(rearLeftFin, rearRightFin);

    // Radiadores laterales
    const sideFinGeo = new THREE.BoxGeometry(0.5, 0.45, 1.8);
    const sideLeftFin = new THREE.Mesh(sideFinGeo, finMat);
    sideLeftFin.position.set(-6.7, 0.32, -3.4);
    const sideRightFin = new THREE.Mesh(sideFinGeo, finMat);
    sideRightFin.position.set(6.7, 0.32, -3.4);
    this.coolingGroup.add(sideLeftFin, sideRightFin);

    // 4 Caloductos de cobre sinterizado puro curvados en 3D
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.95,
      roughness: 0.15
    });

    // Caloducto 1: CPU a radiador trasero izquierdo
    const pipe1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.6, 0.28, -1.8),
      new THREE.Vector3(-3.4, 0.34, -2.5),
      new THREE.Vector3(-4.2, 0.38, -3.5),
      new THREE.Vector3(-4.8, 0.38, -4.4)
    ]);
    const pipe1 = new THREE.Mesh(new THREE.TubeGeometry(pipe1Curve, 32, 0.13, 12, false), copperMat);

    // Caloducto 2: CPU compartido a radiador lateral izquierdo
    const pipe2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.4, 0.28, -1.6),
      new THREE.Vector3(-3.8, 0.36, -2.0),
      new THREE.Vector3(-5.5, 0.36, -2.8),
      new THREE.Vector3(-6.5, 0.36, -3.4)
    ]);
    const pipe2 = new THREE.Mesh(new THREE.TubeGeometry(pipe2Curve, 32, 0.12, 12, false), copperMat);

    // Caloducto 3: GPU masivo a radiador trasero derecho
    const pipe3Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.2, 0.28, -1.8),
      new THREE.Vector3(3.2, 0.35, -2.6),
      new THREE.Vector3(4.2, 0.38, -3.6),
      new THREE.Vector3(4.8, 0.38, -4.4)
    ]);
    const pipe3 = new THREE.Mesh(new THREE.TubeGeometry(pipe3Curve, 32, 0.15, 12, false), copperMat);

    // Caloducto 4: GPU a radiador lateral derecho y VRM
    const pipe4Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.0, 0.28, -1.5),
      new THREE.Vector3(3.6, 0.36, -1.8),
      new THREE.Vector3(5.4, 0.36, -2.6),
      new THREE.Vector3(6.5, 0.36, -3.3)
    ]);
    const pipe4 = new THREE.Mesh(new THREE.TubeGeometry(pipe4Curve, 32, 0.12, 12, false), copperMat);

    // Caloducto 5 puente central (Thermal Bridge) que une CPU y GPU para equilibrar cargas
    const pipeBridgeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 0.30, -1.8),
      new THREE.Vector3(0.0, 0.32, -2.1),
      new THREE.Vector3(1.8, 0.30, -1.8)
    ]);
    const pipeBridge = new THREE.Mesh(new THREE.TubeGeometry(pipeBridgeCurve, 24, 0.10, 12, false), copperMat);

    // Bloques difusores de cobre sobre CPU y GPU
    const coldPlateMat = new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      metalness: 0.9,
      roughness: 0.2
    });
    const cpuPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.6), coldPlateMat);
    cpuPlate.position.set(-2.6, 0.22, -1.8);

    const gpuPlate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 2.0), coldPlateMat);
    gpuPlate.position.set(2.2, 0.22, -1.8);

    this.coolingGroup.add(pipe1, pipe2, pipe3, pipe4, pipeBridge, cpuPlate, gpuPlate);
    this.coolingGroup.add(this.leftFanRotor);
    this.coolingGroup.add(this.rightFanRotor);

    this.coolingGroup.position.set(0, 0.05, 0);
  }

  /**
   * Construye un ventilador Arc Flow Fan™ con 84 aspas curvadas ultrafinas
   */
  private buildArcFlowFan(rotorGroup: THREE.Group, x: number, z: number): void {
    rotorGroup.position.set(x, 0.32, z);

    // Chasis exterior del ventilador (carcasa de polímero de cristal líquido LCP)
    const housingGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.4, 32, 1, true);
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x111620,
      metalness: 0.4,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.position.set(x, 0.32, z);
    this.coolingGroup.add(housing);

    // Núcleo del motor central con rodamiento fluidodinámico (FDB)
    const hubGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.32, 24);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.7,
      roughness: 0.3
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    rotorGroup.add(hub);

    // Tapa central decorativa de cobre/aluminio con logotipo
    const hubCapGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16);
    const hubCapMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2
    });
    const hubCap = new THREE.Mesh(hubCapGeo, hubCapMat);
    hubCap.position.y = 0.17;
    rotorGroup.add(hubCap);

    // Generar las 84 aspas curvadas con grosor variable (0.1 mm en puntas)
    const bladeCount = 84;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.04, 0.7);
    bladeShape.lineTo(0.015, 0.9);
    bladeShape.lineTo(-0.015, 0.88);
    bladeShape.lineTo(-0.03, 0.65);
    bladeShape.closePath();

    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: false
    };
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    bladeGeo.center();

    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      metalness: 0.4,
      roughness: 0.4
    });

    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = Math.cos(angle) * 0.95;
      blade.position.z = Math.sin(angle) * 0.95;
      blade.rotation.y = -angle + 0.4; // Inclinación aerodinámica de succión
      rotorGroup.add(blade);
    }
  }

  /**
   * 8. Chasis superior C-Cover con teclado chiclet RGB, teclas WASD transparentes y touchpad ampliado
   */
  private buildCCoverAndKeyboard(): void {
    const width = 14.0;
    const depth = 9.6;
    const height = 0.3;

    // Deck superior en policarbonato reforzado Mecha Gray
    const deckGeo = new THREE.BoxGeometry(width, height, depth);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      metalness: 0.3,
      roughness: 0.65
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    this.cCoverGroup.add(deckMesh);

    // Pozo empotrado para el teclado chiclet
    const keyWellGeo = new THREE.BoxGeometry(11.8, 0.08, 4.8);
    const keyWellMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f14,
      roughness: 0.8,
      metalness: 0.2
    });
    const keyWell = new THREE.Mesh(keyWellGeo, keyWellMat);
    keyWell.position.set(0, height / 2 + 0.02, -1.2);
    this.cCoverGroup.add(keyWell);

    // Matriz de teclas individuales del teclado chiclet
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x141821,
      metalness: 0.2,
      roughness: 0.7
    });

    // Teclas WASD transparentes con material físico refractivo de alta gama
    const wasdMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 0.95,
      transparent: true,
      roughness: 0.15,
      ior: 1.52,
      thickness: 0.2,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.35
    });

    const keyRows = 6;
    const keyCols = 15;
    const keyW = 0.62;
    const keyD = 0.58;
    const keyH = 0.08;

    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const kx = -5.1 + c * 0.73;
        const kz = -3.1 + r * 0.73;

        // Detección de teclas WASD
        const isW = (r === 1 && c === 2);
        const isA = (r === 2 && c === 1);
        const isS = (r === 2 && c === 2);
        const isD = (r === 2 && c === 3);
        const isWASD = isW || isA || isS || isD;

        const kGeo = new THREE.BoxGeometry(keyW, keyH, keyD);
        const keyMesh = new THREE.Mesh(kGeo, isWASD ? wasdMat : keyMat);
        keyMesh.position.set(kx, height / 2 + 0.06, kz);
        this.cCoverGroup.add(keyMesh);
      }
    }

    // Touchpad ampliado (+26% área) con logotipo TUF grabado
    const padGeo = new THREE.BoxGeometry(4.6, 0.04, 3.0);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x171c26,
      metalness: 0.45,
      roughness: 0.4
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(-0.3, height / 2 + 0.02, 2.6);
    this.cCoverGroup.add(padMesh);

    // 4 LEDs de estado en forma de cruceta TUF en la parte superior del deck
    const ledGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffb800 });
    for (let i = 0; i < 4; i++) {
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0.2 * (i - 1.5), height / 2 + 0.03, -4.2);
      this.cCoverGroup.add(led);
    }

    // Botón de encendido poligonal militar con LED indicador ámbar
    const pwrGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 6);
    const pwrMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2
    });
    const pwrButton = new THREE.Mesh(pwrGeo, pwrMat);
    pwrButton.position.set(5.8, height / 2 + 0.03, -4.1);
    this.cCoverGroup.add(pwrButton);

    this.cCoverGroup.position.set(0, 0.35, 0);
  }

  /**
   * 9. Bisagras y Pantalla completa (A-Cover, B-Cover bisel fino, Panel 144Hz y Webcam)
   */
  private buildScreenAndHinges(): void {
    // 2 Bisagras cilíndricas mecánicas reforzadas
    const hingeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
    const hingeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.2
    });

    const leftHinge = new THREE.Mesh(hingeGeo, hingeMat);
    leftHinge.rotation.z = Math.PI / 2;
    leftHinge.position.set(-4.6, 0.45, -4.6);

    const rightHinge = new THREE.Mesh(hingeGeo, hingeMat);
    rightHinge.rotation.z = Math.PI / 2;
    rightHinge.position.set(4.6, 0.45, -4.6);
    this.hingesGroup.add(leftHinge, rightHinge);

    // Estructura de pantalla (pivotando desde el eje de las bisagras en Z = -4.6, Y = 0.45)
    this.screenGroup.position.set(0, 0.45, -4.6);

    const screenWidth = 14.0;
    const screenHeight = 9.4;
    const screenThickness = 0.25;

    // A-Cover: Tapa exterior de aluminio Mecha Gray con acabado militar
    const aCoverGeo = new THREE.BoxGeometry(screenWidth, screenHeight, screenThickness);
    const aCoverMat = new THREE.MeshStandardMaterial({
      color: 0x222834,
      metalness: 0.7,
      roughness: 0.35
    });
    const aCoverMesh = new THREE.Mesh(aCoverGeo, aCoverMat);
    aCoverMesh.position.set(0, screenHeight / 2, -screenThickness / 2);
    this.screenGroup.add(aCoverMesh);

    // Emblema TUF Gaming en relieve láser en la tapa exterior
    const logoGeo = new THREE.BoxGeometry(1.6, 1.4, 0.06);
    const logoMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15
    });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, screenHeight / 2, -screenThickness - 0.02);
    this.screenGroup.add(logoMesh);

    // B-Cover: Marco biselado de plástico mate ultra-delgado (Micro-edge)
    const bCoverGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 0.05);
    const bCoverMat = new THREE.MeshStandardMaterial({
      color: 0x0b0e14,
      roughness: 0.9,
      metalness: 0.1
    });
    const bCoverMesh = new THREE.Mesh(bCoverGeo, bCoverMat);
    bCoverMesh.position.set(0, screenHeight / 2, 0.05);
    this.screenGroup.add(bCoverMesh);

    // Panel IPS 144Hz encendido con textura Cyberpunk HUD y mapa de emisión activa
    const displayPanelGeo = new THREE.PlaneGeometry(13.2, 7.8);
    const displayPanelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.screenDisplayTexture,
      emissive: 0xffffff,
      emissiveMap: this.screenDisplayTexture,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1
    });
    const displayMesh = new THREE.Mesh(displayPanelGeo, displayPanelMat);
    displayMesh.position.set(0, screenHeight / 2 - 0.1, 0.08);
    this.screenGroup.add(displayMesh);

    // Webcam HD 720p y micrófono digital dual en el marco superior
    const camGeo = new THREE.CircleGeometry(0.06, 16);
    const camMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(0, screenHeight - 0.25, 0.085);
    this.screenGroup.add(camMesh);

    // Posición inicial: pantalla abierta a 115 grados de combate gaming
    this.screenGroup.rotation.x = 0.35;
  }

  /**
   * 10. Sistema de partículas de flujo de aire térmico (corrientes fría y caliente)
   */
  private buildAirflowParticles(): {
    particles: THREE.Points;
    positions: Float32Array;
    velocities: Float32Array;
    types: Float32Array;
  } {
    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const types = new Float32Array(particleCount);

    const coldColor = new THREE.Color(0x00e5ff); // Cian aire frío
    const hotColor = new THREE.Color(0xff4500);  // Naranja/rojo aire caliente

    for (let i = 0; i < particleCount; i++) {
      const isHot = i > particleCount * 0.45;
      types[i] = isHot ? 1 : 0;

      if (!isHot) {
        // Aire frío entrando por la parte inferior hacia los ventiladores
        const fanX = Math.random() > 0.5 ? -4.8 : 4.8;
        positions[i * 3] = fanX + (Math.random() - 0.5) * 2.2;
        positions[i * 3 + 1] = -1.5 - Math.random() * 1.5;
        positions[i * 3 + 2] = -3.2 + (Math.random() - 0.5) * 2.2;

        velocities[i * 3] = (Math.random() - 0.5) * 0.2;
        velocities[i * 3 + 1] = 0.8 + Math.random() * 0.8; // Hacia arriba
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

        colors[i * 3] = coldColor.r;
        colors[i * 3 + 1] = coldColor.g;
        colors[i * 3 + 2] = coldColor.b;
      } else {
        // Aire caliente expulsado por la parte trasera y laterales
        const isRear = Math.random() > 0.35;
        if (isRear) {
          const fanX = Math.random() > 0.5 ? -4.8 : 4.8;
          positions[i * 3] = fanX + (Math.random() - 0.5) * 2.0;
          positions[i * 3 + 1] = 0.35 + (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 2] = -4.4;

          velocities[i * 3] = (Math.random() - 0.5) * 0.4;
          velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
          velocities[i * 3 + 2] = -1.8 - Math.random() * 1.6; // Hacia atrás
        } else {
          // Expulsión lateral
          const isLeft = Math.random() > 0.5;
          positions[i * 3] = isLeft ? -6.6 : 6.6;
          positions[i * 3 + 1] = 0.35 + (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 2] = -3.4 + (Math.random() - 0.5) * 1.2;

          velocities[i * 3] = (isLeft ? -1 : 1) * (1.6 + Math.random() * 1.2);
          velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }

        colors[i * 3] = hotColor.r;
        colors[i * 3 + 1] = hotColor.g;
        colors[i * 3 + 2] = hotColor.b;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    return { particles, positions, velocities, types };
  }

  /**
   * Separa suavemente las capas del portátil en función del progreso de desmontaje (0 a 1)
   */
  public setExplodedProgress(t: number): void {
    const clampedT = Math.max(0, Math.min(1, t));

    // Capa 1: Chasis inferior D-Cover desciende verticalmente
    this.dCoverGroup.position.y = -0.2 - clampedT * 3.8;
    this.dCoverGroup.position.z = clampedT * 0.6;

    // Capa 2: Batería y altavoces se desacoplan hacia adelante y abajo
    this.batteryGroup.position.y = 0.05 - clampedT * 2.2;
    this.batteryGroup.position.z = clampedT * 2.8;

    this.speakersGroup.position.y = 0.05 - clampedT * 2.0;
    this.speakersGroup.position.z = clampedT * 2.5;

    // Capa 3: Placa base se mantiene como núcleo de referencia espacial
    this.motherboardGroup.position.y = 0.12;

    // Capa 4: Módulos RAM SO-DIMM se desacoplan flotando y rotando a 25 grados
    this.ramModulesGroup.position.y = clampedT * 1.8;
    this.ramModulesGroup.position.z = clampedT * 1.2;
    this.ramModulesGroup.rotation.x = clampedT * 0.45; // Ángulo de inserción SO-DIMM

    // Capa 5: Módulo SSD y Wi-Fi se elevan en diagonal
    this.ssdGroup.position.y = clampedT * 2.1;
    this.ssdGroup.position.x = -clampedT * 1.0;
    this.wifiCardGroup.position.y = clampedT * 1.9;

    // Capa 6: Sistema de refrigeración Arc Flow se eleva
    this.coolingGroup.position.y = 0.05 + clampedT * 3.2;
    this.coolingGroup.position.z = -clampedT * 1.2;

    // Capa 7: Chasis superior C-Cover y teclado ascienden
    this.cCoverGroup.position.y = 0.35 + clampedT * 4.6;
    this.cCoverGroup.position.z = clampedT * 0.4;

    // Capa 8: Pantalla se abre completamente y se separa del chasis
    // En fase 0 está abierta 115 grados (0.35 rad sobre eje horizontal), al desmontar se desacopla hacia arriba y atrás
    this.screenGroup.position.y = 0.45 + clampedT * 6.2;
    this.screenGroup.position.z = -4.6 - clampedT * 3.4;
    this.screenGroup.rotation.x = 0.35 + clampedT * 0.6;
  }

  /**
   * Cambia el modo de renderizado de los materiales: Normal, Térmico (FLIR) o Rayos X cibernéticos
   */
  public setViewMode(mode: ViewMode): void {
    this.currentViewMode = mode;

    this.interactiveMeshes.forEach((mesh) => {
      const orig = this.originalMaterials.get(mesh);
      if (!orig) return;

      if (mode === 'normal') {
        mesh.material = orig;
      } else if (mode === 'thermal') {
        // Asignación de mapa térmico de falso color infrarrojo
        const parentId = mesh.parent?.userData?.componentId || mesh.userData?.componentId;
        let thermalColor = 0x051b3b; // Azul frío de base
        let emissiveColor = 0x000000;
        let emissiveIntensity = 0;

        if (parentId === 'motherboard') {
          thermalColor = 0xd90429; // Rojo muy caliente en silicio
          emissiveColor = 0xef233c;
          emissiveIntensity = 0.8;
        } else if (parentId === 'cooling') {
          thermalColor = 0xf59e0b; // Naranja disipación en caloductos
          emissiveColor = 0xf59e0b;
          emissiveIntensity = 0.6;
        } else if (parentId === 'battery') {
          thermalColor = 0x0284c7; // Azul moderado
        } else if (parentId === 'display') {
          thermalColor = 0x3b82f6; // Azul eléctrico
        }

        mesh.material = new THREE.MeshStandardMaterial({
          color: thermalColor,
          emissive: emissiveColor,
          emissiveIntensity: emissiveIntensity,
          roughness: 0.35,
          metalness: 0.2
        });
      } else if (mode === 'xray') {
        // Material holográfico de rayos X translúcido
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: 0x00e5ff,
          emissive: 0x005577,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.22,
          roughness: 0.1,
          metalness: 0.1,
          wireframe: false,
          depthWrite: false
        });
      }
    });

    // Reaplicar resaltado si había alguno activo
    if (this.highlightedComponentId) {
      this.highlightComponent(this.highlightedComponentId);
    }
  }

  /**
   * Resalta visualmente un subsistema concreto emitiendo un brillo dorado TUF
   */
  public highlightComponent(id: string | null): void {
    this.highlightedComponentId = id;

    if (!id) {
      // Restaurar modo actual
      this.setViewMode(this.currentViewMode);
      return;
    }

    this.interactiveMeshes.forEach((mesh) => {
      const parentId = mesh.parent?.userData?.componentId || mesh.userData?.componentId;
      const isTarget = parentId === id;

      if (isTarget) {
        if (mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial) {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.emissive = new THREE.Color(0xffb800);
          mat.emissiveIntensity = 0.9;
          mesh.material = mat;
        }
      } else {
        if (mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial) {
          const mat = mesh.material.clone() as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.05;
          mesh.material = mat;
        }
      }
    });
  }

  /**
   * Bucle de actualización por frame: hace girar los ventiladores y mueve el flujo de partículas
   */
  public update(delta: number, fanRPM: number): void {
    // Giro de turbinas Arc Flow en sentidos opuestos para minimizar resonancias aerodinámicas
    const rotationSpeed = (fanRPM / 60) * Math.PI * 2 * delta;
    this.leftFanRotor.rotation.y += rotationSpeed;
    this.rightFanRotor.rotation.y -= rotationSpeed;

    // Actualización de partículas de aire térmico
    const posAttr = this.airflowParticles.geometry.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const isHot = this.particleTypes[i] === 1;

      if (!isHot) {
        // Partículas frías subiendo
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * delta * (fanRPM / 2500);

        // Reset cuando llegan a la altura de succión
        if (this.particlePositions[i * 3 + 1] > 0.3) {
          this.particlePositions[i * 3 + 1] = -2.5;
        }
      } else {
        // Partículas calientes expulsadas
        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * delta * (fanRPM / 2500);
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * delta;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * delta * (fanRPM / 2500);

        // Reset si se alejan demasiado
        const distZ = Math.abs(this.particlePositions[i * 3 + 2] - (-4.4));
        const distX = Math.abs(this.particlePositions[i * 3]);
        if (distZ > 5.0 || distX > 10.0) {
          this.particlePositions[i * 3] = (Math.random() > 0.5 ? -4.8 : 4.8) + (Math.random() - 0.5) * 1.5;
          this.particlePositions[i * 3 + 1] = 0.35;
          this.particlePositions[i * 3 + 2] = -4.4;
        }
      }
    }

    posAttr.needsUpdate = true;
  }
}
