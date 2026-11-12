import { SystemDefinition, PartDefinition, BoardGroupDefinition, ComponentDetail } from '../types/laptop';

export const SYSTEMS: SystemDefinition[] = [
  {
    id: 'enclosure',
    label: 'Chasis y Controles',
    color: '#94a3b8',
    description: 'Estructura blindada MIL-STD-810H, controles táctiles y cámaras acústicas.'
  },
  {
    id: 'power',
    label: 'Energía',
    color: '#e7bc73',
    description: 'Almacena energía de alta densidad y suministra corriente regulada.'
  },
  {
    id: 'cooling',
    label: 'Refrigeración',
    color: '#67b7dc',
    description: 'Extrae el calor de los núcleos de silicio hacia los cuatro radiadores traseros.'
  },
  {
    id: 'computing',
    label: 'Cómputo y Placa',
    color: '#7ab88f',
    description: 'Procesa gráficos y datos e interconecta memorias y puertos de alta velocidad.'
  },
  {
    id: 'display',
    label: 'Pantalla',
    color: '#a997d4',
    description: 'Transforma la señal de la GPU dedicada en imagen fluida a 144Hz con G-SYNC.'
  }
];

/**
 * 16 ensamblajes modulares del ASUS TUF Gaming A15 (FA507NV).
 * - De 0% a 65% de desmontaje: se separan verticalmente por capas (at + spread * t).
 * - De 65% a 100% de desmontaje: se ordenan en una bandeja Knolling 4x4 frente a la cámara,
 *   mostrando cada pieza 3D con su título y explicación directa debajo.
 */
export const PARTS: PartDefinition[] = [
  {
    id: 'top-case',
    name: 'Carcasa superior (C-Cover)',
    shortDesc: 'Chasis estructural unibody con faldón perimetral sellado y reposamuñecas.',
    system: 'enclosure',
    description: 'El armazón estructural principal del portátil.',
    detail: 'Soporta el teclado, el touchpad y sella herméticamente los componentes internos. Construido en aleación de aluminio Mecha Gray y policarbonato reforzado bajo normativa militar MIL-STD-810H frente a caídas y vibraciones.',
    material: 'Aluminio anodizado y polímero estructural de alta densidad',
    location: 'Base superior principal, rodeando el teclado y el área de apoyo.',
    at: [0, 0.19, 0],
    spread: [0, 2.55, -0.35],
    sizeSpan: 6.3,
    specs: [
      { label: 'Dimensiones', value: '35.4 × 25.1 × 2.24 cm' },
      { label: 'Certificación', value: 'MIL-STD-810H (Caída / Vibración)' }
    ]
  },
  {
    id: 'bottom-cover',
    name: 'Tapa inferior (D-Cover)',
    shortDesc: 'Base protectora con rejilla térmica en panal de abeja y tornillería cautiva.',
    system: 'enclosure',
    description: 'Cierra la cara inferior y canaliza la entrada de aire frío.',
    detail: 'Protege la placa base y la batería incorporando aberturas hexagonales en panal de abeja justo bajo los ventiladores Arc Flow. Incluye patas de goma antideslizantes y un tornillo de apertura rápida Pop-open.',
    material: 'Polímero compuesto texturizado con insertos de latón y goma',
    location: 'Cara inferior completa de la base del equipo.',
    at: [0, 0.008, 0],
    spread: [0, -1.45, 0],
    sizeSpan: 6.3,
    specs: [
      { label: 'Rejilla', value: 'Panal de abeja de alta admisión' },
      { label: 'Anclaje', value: '11 tornillos Phillips + 1 cautivo' }
    ]
  },
  {
    id: 'display',
    name: 'Pantalla IPS 144Hz',
    shortDesc: 'Panel FHD de 15.6" con 100% sRGB, G-SYNC y cubierta de aluminio grabada.',
    system: 'display',
    description: 'El módulo de visualización y tapa superior de aluminio.',
    detail: 'Integra el panel IPS antirreflejos de 15.6 pulgadas a 144Hz con sincronización adaptativa NVIDIA G-SYNC, marcos ultrafinos NanoEdge (80% proporción pantalla-cuerpo) y cámara HD 720p con matriz de micrófonos.',
    material: 'Cristal óptico, capas difusoras IPS y tapa de aluminio cepillado',
    location: 'Anclada al borde posterior mediante el par de bisagras de par constante.',
    at: [0, 0.25, -2.06],
    spread: [0, 3.1, -1.45],
    sizeSpan: 6.3,
    specs: [
      { label: 'Resolución / Tasa', value: '1920 × 1080 FHD @ 144Hz' },
      { label: 'Espacio de color', value: '100% sRGB · NVIDIA G-SYNC' }
    ]
  },
  {
    id: 'keyboard',
    name: 'Teclado RGB y WASD',
    shortDesc: 'Matriz chiclet retroiluminada con teclas WASD translúcidas y Overstroke.',
    system: 'enclosure',
    description: 'Convierte cada pulsación mecánica en órdenes de baja latencia.',
    detail: 'Teclado de disposición de escritorio con bloque numérico independiente, recorrido de 1.7 mm, tecnología Overstroke para actuación anticipada y switches calibrados para soportar más de 20 millones de pulsaciones.',
    material: 'Keycaps de ABS de doble inyección, WASD de policarbonato claro y membrana RGB',
    location: 'Cavidad central empotrada sobre la carcasa superior.',
    at: [0, 0.20, -0.72],
    spread: [0, 2.1, -0.1],
    sizeSpan: 5.6,
    specs: [
      { label: 'Recorrido', value: '1.7 mm con tecnología Overstroke' },
      { label: 'Durabilidad', value: '20 millones de pulsaciones' }
    ]
  },
  {
    id: 'trackpad',
    name: 'Touchpad de precisión',
    shortDesc: 'Superficie multitáctil un 26% más amplia con muestreo a 240Hz.',
    system: 'enclosure',
    description: 'Superficie capacitiva de cristal Mylar para gestos y puntero.',
    detail: 'Detecta gestos multitáctiles de hasta cuatro dedos y presión mecánica sin holgura. Su superficie creció un 26% respecto a la generación previa e incluye marcadores estéticos de estilo militar.',
    material: 'Recubrimiento Mylar de baja fricción y PCB sensor capacitivo',
    location: 'Zona frontal central, flanqueado por los reposamuñecas.',
    at: [0, 0.198, 1.29],
    spread: [0, 2.05, 0.35],
    sizeSpan: 2.7,
    specs: [
      { label: 'Superficie', value: '129 × 84 mm (+26% área)' },
      { label: 'Muestreo', value: '240 Hz sin latencia perceptible' }
    ]
  },
  {
    id: 'logic-board',
    name: 'Placa base (PCB)',
    shortDesc: 'Circuito impreso de 8 capas con regulación VRM Digi+ de 12+2 fases.',
    system: 'computing',
    description: 'Interconecta todos los subsistemas electrónicos del portátil.',
    detail: 'Aloja el procesador, la GPU dedicada, los reguladores de voltaje DrMOS de 12+2 fases, el chip MUX Switch físico y las ranuras de expansión SO-DIMM y M.2 mediante pistas de cobre de 2 oz.',
    material: 'Fibra de vidrio FR-4 de 8 capas, cobre electrolítico y componentes SMD',
    location: 'Mitad posterior del interior, flanqueada por los dos ventiladores Arc Flow.',
    at: [0, 0.08, -0.88],
    spread: [0, 0.45, 0],
    sizeSpan: 6.0,
    specs: [
      { label: 'VRM', value: '12+2 fases DrMOS con bobinas de aleación' },
      { label: 'Conmutador', value: 'MUX Switch físico + Advanced Optimus' }
    ]
  },
  {
    id: 'cpu-ryzen',
    name: 'AMD Ryzen 9 7940HS',
    shortDesc: 'SoC de 8 núcleos Zen 4 (4 nm TSMC) hasta 5.2 GHz con motor Ryzen AI.',
    system: 'computing',
    description: 'El procesador central de cómputo de alto rendimiento.',
    detail: 'Fabricado en litografía de 4 nm de TSMC, integra 8 núcleos y 16 hilos Zen 4 con 24 MB de caché combinada, gráficos integrados Radeon 780M (RDNA 3) y acelerador neuronal dedicado XDNA.',
    material: 'Silicio monocristalino en sustrato orgánico BGA soldado',
    location: 'Sector central-izquierdo de la placa base, bajo el bloque de cobre.',
    at: [-0.65, 0.125, -0.88],
    spread: [-0.35, 1.15, 0],
    sizeSpan: 1.35,
    specs: [
      { label: 'Núcleos / Litografía', value: '8C / 16T · TSMC 4nm FinFET' },
      { label: 'Frecuencia / TDP', value: 'Hasta 5.2 GHz · 35W–54W' }
    ]
  },
  {
    id: 'gpu-rtx',
    name: 'NVIDIA GeForce RTX 4070',
    shortDesc: 'GPU dedicada Ada Lovelace (AD106) a 140W TGP con 8 GB GDDR6.',
    system: 'computing',
    description: 'El motor gráfico dedicado para renderizado 3D e inteligencia artificial.',
    detail: 'Chip AD106 con 4608 núcleos CUDA, núcleos RT de 3ª generación y Tensor de 4ª generación (DLSS 3 Frame Generation). Rodeado por cuatro encapsulados de memoria GDDR6 a 16 Gbps.',
    material: 'Encapsulado de silicio BGA con matriz perimetral de chips GDDR6',
    location: 'Sector central-derecho de la placa base, junto a las fases VRM gráficas.',
    at: [0.65, 0.125, -0.88],
    spread: [0.35, 1.15, 0],
    sizeSpan: 1.45,
    specs: [
      { label: 'Arquitectura / CUDA', value: 'Ada Lovelace · 4608 núcleos' },
      { label: 'Potencia / VRAM', value: '140W Max TGP · 8 GB GDDR6' }
    ]
  },
  {
    id: 'left-fan',
    name: 'Ventilador Arc Flow Izq.',
    shortDesc: 'Turbina de 84 aspas de polímero LCP (0.1 mm) que refrigera el bloque CPU.',
    system: 'cooling',
    description: 'Impulsa el caudal de aire a través de los radiadores del lado izquierdo.',
    detail: 'Sus 84 aspas de polímero de cristal líquido (LCP) varían de grosor hasta apenas 0.1 mm en la punta para reducir la turbulencia e incrementar el flujo de aire un 13% sin superar los 48 dBA en modo Rendimiento.',
    material: 'Impulsor de polímero de cristal líquido (LCP) y carcasa metálica',
    location: 'Esquina posterior izquierda, acoplado a las salidas térmicas traseras y laterales.',
    at: [-2.02, 0.085, -0.98],
    spread: [-0.45, 0.85, 0.15],
    sizeSpan: 1.85,
    specs: [
      { label: 'Aspas', value: '84 álabes de perfil aerodinámico (0.1 mm)' },
      { label: 'Sistema antipolvo', value: 'Túnel centrífugo Anti-Dust 2.0' }
    ]
  },
  {
    id: 'right-fan',
    name: 'Ventilador Arc Flow Der.',
    shortDesc: 'Turbina gemela de 84 aspas LCP dedicada a evacuar el calor de la RTX 4070.',
    system: 'cooling',
    description: 'Impulsa el caudal de aire por los radiadores del bloque gráfico derecho.',
    detail: 'Trabaja de forma sincronizada pero independiente respecto al ventilador izquierdo, regulando sus RPM mediante curvas PWM según la carga térmica combinada de los 140W TGP de la GPU y los módulos GDDR6.',
    material: 'Impulsor de polímero de cristal líquido (LCP) y motor brushless trifásico',
    location: 'Esquina posterior derecha, junto a los radiadores de cobre del flanco derecho.',
    at: [2.02, 0.085, -0.98],
    spread: [0.45, 0.85, 0.15],
    sizeSpan: 1.85,
    specs: [
      { label: 'Régimen de giro', value: '0 RPM (Silent) hasta 5800 RPM' },
      { label: 'Caudal extra', value: '+13% respecto a generación previa' }
    ]
  },
  {
    id: 'heatsink',
    name: '5 Caloductos de Cobre',
    shortDesc: 'Red térmica de 5 heatpipes de cobre sinterizado y 4 radiadores (247 aletas).',
    system: 'cooling',
    description: 'Transfiere el calor desde la CPU, GPU y VRM hacia el flujo de aire.',
    detail: 'Cinco tubos de calor de cobre puro con fluido de cambio de fase interno absorben la energía térmica de los platos fríos sobre Ryzen 9, RTX 4070, VRAM y fases VRM y la reparten hacia cuatro bloques de aletas ultrafinas.',
    material: 'Cobre electrolítico C1100 sinterizado con acabado antioxidante negro',
    location: 'Se extiende transversalmente sobre la placa base uniendo los chips con los ventiladores.',
    at: [0, 0.115, -0.98],
    spread: [0, 1.55, -0.1],
    sizeSpan: 5.3,
    specs: [
      { label: 'Caloductos', value: '5 heatpipes de cobre de sección plana' },
      { label: 'Radiadores', value: '4 salidas con 247 aletas de 0.1 mm' }
    ]
  },
  {
    id: 'ram-ddr5',
    name: 'Memoria DDR5-4800',
    shortDesc: 'Doble módulo SO-DIMM en doble canal (hasta 64 GB) con blindaje EMI.',
    system: 'computing',
    description: 'Memoria principal de trabajo de alta velocidad y baja latencia.',
    detail: 'A diferencia de los equipos con memoria soldada, el TUF A15 incorpora dos zócalos SO-DIMM accesibles que operan en cuádruple subcanal de 32 bits con circuito integrado de gestión de energía (PMIC) en cada módulo.',
    material: 'PCB multicapa, chips DRAM DDR5 y contactos bañados en oro',
    location: 'Zona central de la placa base, justo debajo del bloque térmico.',
    at: [0, 0.095, -0.05],
    spread: [0, 0.9, 0.25],
    sizeSpan: 2.1,
    specs: [
      { label: 'Configuración', value: '2× SO-DIMM DDR5-4800 MHz (Dual Channel)' },
      { label: 'Ampliación', value: 'Hasta 64 GB reemplazables por el usuario' }
    ]
  },
  {
    id: 'ssd-nvme',
    name: 'SSD NVMe PCIe 4.0',
    shortDesc: 'Unidad M.2 2280 de hasta 7000 MB/s con lámina disipadora de cobre.',
    system: 'computing',
    description: 'Almacenamiento flash no volátil de velocidad extrema.',
    detail: 'Conectado directamente a las líneas PCIe 4.0 x4 del procesador Ryzen 9. El chasis incluye una segunda ranura M.2 2280 libre compatible con PCIe 4.0 para ampliar el almacenamiento en minutos.',
    material: 'Sustrato M.2 2280, memorias 3D TLC NAND, controlador DRAM y lámina de cobre',
    location: 'Flanco izquierdo interior, junto a la batería y la tarjeta inalámbrica.',
    at: [-2.15, 0.09, 0.15],
    spread: [-0.45, 0.85, 0.25],
    sizeSpan: 2.0,
    specs: [
      { label: 'Interfaz', value: '2× ranuras M.2 NVMe PCIe 4.0 x4' },
      { label: 'Ancho de banda', value: 'Hasta 7000 MB/s lectura secuencial' }
    ]
  },
  {
    id: 'battery',
    name: 'Batería de 90Wh (4 celdas)',
    shortDesc: 'Polímero de litio de 90Wh con hasta 12.5h de autonomía y carga rápida.',
    system: 'power',
    description: 'Almacena energía química para uso portátil prolongado.',
    detail: 'Ocupa todo el tercio frontal del chasis con cuatro celdas de polímero de litio (4S1P, 15.4V, 5845 mAh). Soporta carga rápida por USB-C Power Delivery de 100W o adaptador de 240W (0 a 50% en 30 minutos).',
    material: 'Celdas de polímero de iones de litio con circuito de protección BMS',
    location: 'Tramo frontal completo del interior, bajo el reposamuñecas y el touchpad.',
    at: [0, 0.075, 1.18],
    spread: [0, -0.65, 0.3],
    sizeSpan: 5.2,
    specs: [
      { label: 'Capacidad', value: '90 Wh · 4 celdas Li-Po (15.4V)' },
      { label: 'Carga rápida', value: '50% en 30 min · USB-C PD 100W' }
    ]
  },
  {
    id: 'speakers',
    name: 'Altavoces Dolby Atmos',
    shortDesc: 'Pareja acústica lateral de doble cámara con audio Hi-Res y AI Noise-Canceling.',
    system: 'enclosure',
    description: 'Transductores electroacústicos estéreo con orientación inferior y lateral.',
    detail: 'Dos cámaras de resonancia suspendidas sobre amortiguadores de silicona para evitar transmitir vibraciones al chasis. Generan un 1.8x más de volumen y 2.7x graves más profundos con espacialización Dolby Atmos.',
    material: 'Caja acústica sellada de ABS, imanes de neodimio y diafragmas de polímero',
    location: 'Bordes laterales frontales izquierdo y derecho, flanqueando la batería.',
    at: [0, 0.085, 1.05],
    spread: [0, -0.35, 0.45],
    sizeSpan: 5.8,
    specs: [
      { label: 'Certificación', value: 'Dolby Atmos · Hi-Res Audio' },
      { label: 'Acústica', value: '1.8x volumen · 2.7x graves profundos' }
    ]
  },
  {
    id: 'io-hinges',
    name: 'Puertos I/O y Bisagras',
    shortDesc: 'Conectores USB4 (40 Gbps), HDMI 2.1, RJ45 Gigabit y bisagras de acero.',
    system: 'computing',
    description: 'Interfaces de alta velocidad con el exterior y articulación mecánica.',
    detail: 'Agrupa en el flanco izquierdo el conector de corriente de 240W, RJ45 Gigabit Ethernet, HDMI 2.1 FRL, USB4 Type-C (40 Gbps) y USB-C 3.2 Gen 2 con DisplayPort 1.4 y G-SYNC, junto a las bisagras de acero templado.',
    material: 'Acero inoxidable mecanizado CNC y conectores blindados en níquel-oro',
    location: 'Perímetro lateral izquierdo/derecho y esquinas posteriores del chasis.',
    at: [0, 0.09, -0.8],
    spread: [0, 0.2, -0.35],
    sizeSpan: 6.1,
    specs: [
      { label: 'Puertos de vídeo', value: 'USB4 (40 Gbps) + USB-C DP 1.4 + HDMI 2.1' },
      { label: 'Red física', value: 'RJ45 LAN 10/100/1000 Mbps integrada' }
    ]
  }
];

/**
 * 8 grupos funcionales para el modo "Explorar placa base" (estudio de circuito en 3D)
 */
export const BOARD_GROUPS: BoardGroupDefinition[] = [
  {
    id: 'board-soc',
    name: 'Procesador AMD Ryzen 9 7940HS',
    shortName: 'RYZEN 9',
    description: '8 núcleos Zen 4, gráficos Radeon 780M y motor neuronal Ryzen AI en un solo die de 4 nm.',
    location: 'Región central-izquierda del PCB',
    detail: 'Alcanza hasta 5.2 GHz en ráfaga con un consumo regulado de 35W a 54W. Se comunica directamente con los módulos DDR5 y las dos ranuras SSD PCIe 4.0.',
    color: '#e3b987',
    position: [-0.85, 0.16, -0.1],
    size: [1.35, 0.14, 1.3],
    spread: [-0.45, 1.35, -0.1],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-gpu',
    name: 'GPU NVIDIA GeForce RTX 4070',
    shortName: 'RTX 4070',
    description: 'Silicio dedicado AD106 con 4608 núcleos CUDA y bus de 128 bits hacia 8 GB GDDR6.',
    location: 'Región central-derecha del PCB',
    detail: 'Opera hasta a 140W TGP con Dynamic Boost. Cuatro chips de memoria GDDR6 rodean el encapsulado principal bajo el mismo plato frío de cobre.',
    color: '#7ab88f',
    position: [0.85, 0.16, -0.1],
    size: [1.45, 0.14, 1.35],
    spread: [0.55, 1.35, -0.1],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-ram',
    name: 'Doble canal DDR5-4800 SO-DIMM',
    shortName: 'DDR5 RAM',
    description: 'Dos ranuras SO-DIMM proporcionan memoria de alta velocidad con circuito PMIC propio.',
    location: 'Zona inferior central de la placa base',
    detail: 'Permite ampliar hasta 64 GB DDR5 operando en cuádruple subcanal de 32 bits, reduciendo el voltaje a 1.1V y mejorando el ancho de banda un 50% frente a DDR4.',
    color: '#91c5d3',
    position: [0, 0.13, 1.1],
    size: [1.8, 0.11, 0.55],
    spread: [0, 1.05, 1.15],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-ssd',
    name: 'Almacenamiento NVMe PCIe 4.0 x4',
    shortName: 'NVMe SSD',
    description: 'Dos zócalos M.2 2280 conectados por líneas PCIe Gen 4 directas al procesador.',
    location: 'Extremo izquierdo de la placa base',
    detail: 'Soporta velocidades de hasta 7000 MB/s y configuraciones RAID 0, permitiendo cargar escenas 3D y modelos pesados de forma instantánea.',
    color: '#b8b79e',
    position: [-2.75, 0.13, 0.9],
    size: [1.25, 0.12, 0.5],
    spread: [-1.25, 0.85, 0.95],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-vrm',
    name: 'Regulación VRM Digi+ (12+2 fases)',
    shortName: 'VRM POWER',
    description: 'Etapas de potencia DrMOS, bobinas de aleación y condensadores de tantalio.',
    location: 'Perímetro superior de los núcleos CPU y GPU',
    detail: 'Transforma los 20V del adaptador de 240W en voltajes precisos de ~0.8V–1.3V capaces de suministrar más de 180 amperios combinados sin rizado eléctrico.',
    color: '#caad72',
    position: [0, 0.13, -1.25],
    size: [2.4, 0.12, 0.45],
    spread: [0, 0.75, -1.15],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-mux',
    name: 'Conmutador MUX Switch + Advanced Optimus',
    shortName: 'MUX CHIP',
    description: 'Enrutador físico que conecta la RTX 4070 directamente al panel IPS 144Hz.',
    location: 'Entre la GPU y el conector eDP de pantalla',
    detail: 'Evita el cuello de botella de pasar los fotogramas por la gráfica integrada del procesador, reduciendo la latencia y aumentando el rendimiento en juegos entre un 5% y un 10%.',
    color: '#c9aebd',
    position: [2.65, 0.13, -1.15],
    size: [1.1, 0.12, 0.45],
    spread: [1.3, 0.9, -1.0],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-wifi',
    name: 'Controladores USB4, HDMI 2.1 y Wi-Fi 6E',
    shortName: 'I/O & WIFI',
    description: 'Interfaces de alta frecuencia para enlaces de 40 Gbps y radio tribanda (6 GHz).',
    location: 'Bordes laterales del circuito impreso',
    detail: 'Gestiona las salidas DisplayPort 1.4, USB4 de 40 Gbps, Ethernet Gigabit RJ45 y el módulo inalámbrico Wi-Fi 6E (802.11ax) con Bluetooth 5.3.',
    color: '#a7bd9d',
    position: [-2.75, 0.13, -1.15],
    size: [1.15, 0.12, 0.45],
    spread: [-1.3, 0.9, -1.0],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  },
  {
    id: 'board-traces',
    name: 'Buses de cobre de alta velocidad',
    shortName: 'PISTAS PCB',
    description: 'Pistas diferenciales de impedancia controlada a través de las 8 capas del PCB.',
    location: 'Capa interna expuesta a lo largo de la placa',
    detail: 'Rutas con blindaje electromagnético y longitudes igualadas al milímetro para sincronizar las señales de memoria DDR5 y líneas PCIe 4.0 sin diafonía.',
    color: '#c5a36b',
    position: [2.65, 0.09, 0.9],
    size: [1.3, 0.03, 0.5],
    spread: [1.2, 0.5, 0.95],
    source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/'
  }
];

export function getPartById(id: string | null | undefined): PartDefinition | undefined {
  if (!id) return undefined;
  return PARTS.find((p) => p.id === id);
}

/**
 * Devuelve la explicación en vivo de lo que está ocurriendo según el porcentaje de desmontaje (0-100%)
 */
export function getLiveStageInfo(percent: number): {
  stepLabel: string;
  title: string;
  description: string;
  highlightPartId: string | null;
} {
  if (percent <= 3) {
    return {
      stepLabel: 'ESTADO · 0% ENSAMBLADO',
      title: 'Chasis sellado a ras sin holguras',
      description: 'Los 16 ensamblajes internos descansan sellados bajo el teclado y la tapa inferior. Desliza el control para separar las capas o llegar al 100% y ver todas las piezas desplegadas con su explicación.',
      highlightPartId: null
    };
  }
  if (percent <= 18) {
    return {
      stepLabel: 'DESMONTAJE · CAPA 1 DE 5',
      title: 'Apertura de Tapa Inferior (D-Cover) y Batería 90Wh',
      description: 'Se retiran los 11 tornillos inferiores liberando la base con rejilla en panal de abeja y dejando al descubierto la batería de 4 celdas (90Wh) y las cámaras acústicas Dolby Atmos.',
      highlightPartId: 'bottom-cover'
    };
  }
  if (percent <= 34) {
    return {
      stepLabel: 'DESMONTAJE · CAPA 2 DE 5',
      title: 'Extracción de Teclado RGB, Touchpad y Carcasa C-Cover',
      description: 'Se eleva el conjunto superior de aluminio Mecha Gray junto al teclado Overstroke (con teclas WASD translúcidas) y el touchpad ampliado un 26%.',
      highlightPartId: 'top-case'
    };
  }
  if (percent <= 50) {
    return {
      stepLabel: 'DESMONTAJE · CAPA 3 DE 5',
      title: 'Desacople de Ventiladores Arc Flow y 5 Caloductos de Cobre',
      description: 'Se separa el sistema térmico integral: dos turbinas LCP de 84 aspas (0.1 mm) y cinco heatpipes de cobre sinterizado que evacúan hasta 194W combinados.',
      highlightPartId: 'heatsink'
    };
  }
  if (percent <= 66) {
    return {
      stepLabel: 'DESMONTAJE · CAPA 4 DE 5',
      title: 'Aislamiento de Placa Base, Ryzen 9, RTX 4070, DDR5 y SSD',
      description: 'Quedan expuestos los núcleos de silicio AMD Ryzen 9 7940HS (4 nm) y NVIDIA RTX 4070 (140W), junto a los módulos SO-DIMM DDR5 y el SSD NVMe PCIe 4.0.',
      highlightPartId: 'logic-board'
    };
  }
  if (percent < 94) {
    return {
      stepLabel: 'TRANSICIÓN · ORDENANDO INVENTARIO 3D',
      title: 'Despliegue hacia la Bandeja de Piezas (Knolling)',
      description: 'Las 16 piezas rotan y se alinean geométricamente frente a la cámara. Al llegar al 100% verás cada componente individual con su explicación técnica debajo.',
      highlightPartId: null
    };
  }
  return {
    stepLabel: 'INVENTARIO COMPLETO · 16 PIEZAS',
    title: 'Todas las piezas desplegadas con su función',
    description: 'Cada uno de los 16 ensamblajes del ASUS TUF Gaming A15 está alineado en cuadrícula. Pulsa sobre cualquier pieza para inspeccionarla en detalle o aislarla en 3D.',
    highlightPartId: null
  };
}

// Mapa legacy de compatibilidad
export const COMPONENT_DETAILS: Record<string, ComponentDetail> = Object.fromEntries(
  PARTS.map((p) => [
    p.id,
    {
      id: p.id,
      name: p.name,
      category: 'motherboard',
      title: p.name,
      subtitle: p.description,
      description: p.detail,
      specs: p.specs || [
        { label: 'Posición', value: p.location },
        { label: 'Material', value: p.material }
      ]
    }
  ])
);
