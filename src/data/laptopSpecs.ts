import { ComponentDetail, DisassemblyPhase } from '../types/laptop';

export const LAPTOP_SPECS = {
  model: "ASUS TUF Gaming A15 (FA507)",
  series: "The Ultimate Force (TUF)",
  militaryStandard: "MIL-STD-810H Certified",
  cpu: "AMD Ryzen™ 7 7735HS (8C/16T, hasta 4.75 GHz, 16MB L3 Cache)",
  gpu: "NVIDIA® GeForce RTX™ 4060 Laptop GPU (8GB GDDR6, 140W TGP con Dynamic Boost)",
  ram: "16 GB DDR5-4800 MHz (SO-DIMM Dual Channel, expandible hasta 64 GB)",
  storage: "1 TB PCIe® 4.0 NVMe™ M.2 SSD + Slot M.2 secundario libre",
  display: '15.6" Full HD (1920x1080) IPS, 144Hz, 100% sRGB, G-Sync, MUX Switch + NVIDIA Advanced Optimus',
  cooling: "Dual Arc Flow Fans™ (84 aspas curvadas), 4 caloductos de cobre y 4 salidas de aire",
  battery: "90 Wh 4 celdas Li-ion de alta densidad con carga rápida (50% en 30 minutos)",
  keyboard: "Teclado chiclet retroiluminado RGB Aura Sync, teclas WASD transparentes y recorrido de 1.7 mm",
  audio: "2x altavoces con Dolby Atmos y cancelación de ruido bidireccional por IA"
};

export const DISASSEMBLY_PHASES: DisassemblyPhase[] = [
  {
    id: 0,
    title: "Chasis Exterior Sellado",
    code: "PHASE-01 // READY",
    summary: "Armadura de grado militar MIL-STD-810H con acabado Gris Jaeger y logotipo TUF en relieve láser.",
    targetComponent: "exterior",
    cameraPosition: [18, 14, 26],
    cameraTarget: [0, 0, 0],
    explodedProgress: 0.0
  },
  {
    id: 1,
    title: "Apertura del Panel 144Hz",
    code: "PHASE-02 // DISPLAY DEPLOY",
    summary: "Bisagras mecánicas de alta resistencia y pantalla IPS de 144Hz con Adaptive-Sync y micro-marcos.",
    targetComponent: "display",
    cameraPosition: [0, 12, 28],
    cameraTarget: [0, 2, 0],
    explodedProgress: 0.15
  },
  {
    id: 2,
    title: "Desacople de Cubierta C y Teclado Aura",
    code: "PHASE-03 // DECK SEPARATION",
    summary: "Elevación del chasis superior con teclas WASD transparentes, panel táctil 26% más amplio y blindaje térmico.",
    targetComponent: "keyboard",
    cameraPosition: [14, 20, 20],
    cameraTarget: [0, 3, 0],
    explodedProgress: 0.35
  },
  {
    id: 3,
    title: "Módulo Térmico Arc Flow Fans",
    code: "PHASE-04 // THERMAL DECOUPLING",
    summary: "2 ventiladores de 84 aspas ultrafinas de grosor variable (0.1 mm) y 4 caloductos de cobre puro sinterizado.",
    targetComponent: "cooling",
    cameraPosition: [-16, 22, 16],
    cameraTarget: [0, 2, -1],
    explodedProgress: 0.55
  },
  {
    id: 4,
    title: "Módulos Expansibles y Batería 90Wh",
    code: "PHASE-05 // MODULAR EXTRACTION",
    summary: "Extracción flotante de módulos RAM SO-DIMM DDR5, unidad SSD PCIe 4.0 y celda de batería masiva de 90 Wh.",
    targetComponent: "modules",
    cameraPosition: [16, 18, 14],
    cameraTarget: [0, 1, 1],
    explodedProgress: 0.75
  },
  {
    id: 5,
    title: "Placa Base Silicio & Chasis Panal",
    code: "PHASE-06 // CORE SILICON & BASE",
    summary: "Separación total de la placa base con die RTX 4060 y Ryzen 7, mostrando la base con ventilación en panal.",
    targetComponent: "motherboard",
    cameraPosition: [22, 16, 20],
    cameraTarget: [0, 1, 0],
    explodedProgress: 1.0
  }
];

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  display: {
    id: "display",
    name: "Pantalla IPS 15.6\" 144Hz G-Sync",
    category: "display",
    title: "Panel Gaming de Alta Velocidad",
    subtitle: "100% sRGB // Adaptive-Sync // MUX Switch",
    description: "Panel de bisel estrecho con tasa de refresco de 144Hz sincronizada con la GPU mediante Adaptive-Sync para eliminar el tearing y minimizar el stuttering. Incorpora el micro-switch MUX que permite conectar la GPU dedicada directamente a la pantalla aumentando los fotogramas por segundo entre un 5% y un 10%.",
    specs: [
      { label: "Diagonal", value: "15.6 pulgadas (16:9)" },
      { label: "Resolución", value: "Full HD (1920 x 1080)" },
      { label: "Tasa de refresco", value: "144 Hz" },
      { label: "Gama cromática", value: "100% sRGB" },
      { label: "Tecnología", value: "IPS con filtro antirreflejos" }
    ],
    highlightColor: "#00E5FF"
  },
  keyboard: {
    id: "keyboard",
    name: "Teclado Aura Sync con Teclas WASD Transparentes",
    category: "exterior",
    title: "Matriz Táctil de Grado Militar",
    subtitle: "Overstroke // 20 millones de pulsaciones",
    description: "Diseñado para resistir sesiones intensivas de combate virtual. Las teclas WASD transparentes ofrecen referencia visual instantánea, mientras que la tecnología Overstroke activa cada pulsación más arriba en el recorrido de 1.7 mm para una capacidad de respuesta superior.",
    specs: [
      { label: "Recorrido de tecla", value: "1.7 mm" },
      { label: "Durabilidad", value: "20 Millones de pulsaciones" },
      { label: "Retroiluminación", value: "Aura RGB 1 zona personalizable" },
      { label: "Teclas especiales", value: "WASD ahumadas transparentes" },
      { label: "Touchpad", value: "+26% superficie con grabado TUF" }
    ],
    highlightColor: "#FFB800"
  },
  cooling: {
    id: "cooling",
    name: "Refrigeración Integral Arc Flow Fans™",
    category: "cooling",
    title: "Disipación Térmica de Alto Rendimiento",
    subtitle: "84 Aspas de Grosor Variable // Túneles Antipolvo",
    description: "Cada ventilador Arc Flow cuenta con 84 aspas que varían en grosor desde la base hasta la punta para maximizar el flujo de aire reduciendo las turbulencias y el ruido (por debajo de 48 dB a plena carga). Cuatro caloductos de cobre y cuatro disipadores con aletas de 0.1 mm canalizan el calor fuera del chasis con rapidez.",
    specs: [
      { label: "Aspas por ventilador", value: "84 aspas curvadas" },
      { label: "Grosor mínimo de aspa", value: "0.1 mm en la punta" },
      { label: "Caloductos", value: "4 tubos de cobre sinterizado" },
      { label: "Aletas disipadoras", value: "4 bloques con 247 aletas" },
      { label: "Tecnología antipolvo", value: "Canales de auto-limpieza 2.0" }
    ],
    highlightColor: "#FF4500"
  },
  motherboard: {
    id: "motherboard",
    name: "Placa Base Multicapa & Núcleos Silicio",
    category: "motherboard",
    title: "Plataforma AMD Ryzen 7 + NVIDIA RTX 4060",
    subtitle: "TGP 140W // VRM Digital // GDDR6 Dedicada",
    description: "El corazón de la máquina integra el procesador AMD Ryzen 7 7735HS de arquitectura Zen 3+ (8 núcleos y 16 hilos) junto al chip gráfico NVIDIA GeForce RTX 4060 Laptop con 8 GB de memoria GDDR6 de alta velocidad y TGP de 140W gracias a Dynamic Boost.",
    specs: [
      { label: "Procesador", value: "AMD Ryzen 7 7735HS (hasta 4.75GHz)" },
      { label: "GPU", value: "NVIDIA GeForce RTX 4060 Laptop (8GB)" },
      { label: "TGP Máximo", value: "140W con Dynamic Boost" },
      { label: "Arquitectura GPU", value: "Ada Lovelace con DLSS 3" },
      { label: "Fases VRM", value: "Diseño de potencia blindado" }
    ],
    highlightColor: "#76B900"
  },
  ram: {
    id: "ram",
    name: "Memoria RAM DDR5-4800 MHz SO-DIMM",
    category: "memory",
    title: "Ancho de Banda de Última Generación",
    subtitle: "Doble Canal // Hasta 64 GB de Expansión",
    description: "Módulos de memoria DDR5 de 4800 MHz que entregan un 50% más de velocidad de transferencia de datos frente a la generación DDR4 anterior, optimizando tiempos de carga, renderizado multitarea y streaming en simultáneo.",
    specs: [
      { label: "Capacidad de fábrica", value: "16 GB (2x 8GB SO-DIMM)" },
      { label: "Velocidad de reloj", value: "4800 MT/s" },
      { label: "Tecnología", value: "DDR5 Dual Channel On-die ECC" },
      { label: "Capacidad máxima", value: "Hasta 64 GB soportados" }
    ],
    highlightColor: "#FFB800"
  },
  ssd: {
    id: "ssd",
    name: "Almacenamiento SSD PCIe 4.0 NVMe M.2",
    category: "memory",
    title: "Velocidades de Lectura Ultrarrápidas",
    subtitle: "Lectura hasta 5000 MB/s // Slot Secundario Disponible",
    description: "Unidad de estado sólido NVMe bajo protocolo PCIe Gen 4x4 que reduce los tiempos de inicio de Windows y acelera la carga de mapas en juegos pesados. Dispone de una segunda ranura M.2 PCIe 4.0 accesible para ampliar el almacenamiento con total facilidad.",
    specs: [
      { label: "Capacidad", value: "1 TB M.2 2280" },
      { label: "Interfaz", value: "PCIe 4.0 x4 NVMe" },
      { label: "Ranuras M.2", value: "2 ranuras totales (1 libre)" },
      { label: "Disipación", value: "Lámina térmica de grafito/cobre" }
    ],
    highlightColor: "#00E5FF"
  },
  battery: {
    id: "battery",
    name: "Batería de Alta Capacidad 90 Wh",
    category: "power",
    title: "Autonomía Prolongada de 4 Celdas",
    subtitle: "Carga Rápida 100W Type-C // Hasta 12h de Vídeo",
    description: "Batería de polímero de litio de 90 vatios-hora integrada en el tercio frontal para balancear el centro de gravedad. Compatible con tecnología de recarga rápida que alcanza el 50% de capacidad en apenas 30 minutos a través de su cargador original o vía USB-C Power Delivery.",
    specs: [
      { label: "Capacidad", value: "90 Wh (4 celdas Li-ion)" },
      { label: "Voltaje", value: "15.4 V" },
      { label: "Carga rápida", value: "50% en 30 minutos" },
      { label: "Soporte Type-C", value: "USB Power Delivery hasta 100W" }
    ],
    highlightColor: "#FFB800"
  },
  chassis: {
    id: "chassis",
    name: "Chasis Inferior con Diseño de Panal",
    category: "chassis",
    title: "Estructura Rígida Anti-Flexión",
    subtitle: "Rejilla Hexagonal // Pies de Tracción Engomados",
    description: "La cubierta D presenta un patrón de panal de abeja (Honeycomb) que refuerza la rigidez estructural evitando torsiones al apoyar el equipo, a la vez que maximiza el área de admisión de aire fresco hacia los ventiladores gemelos.",
    specs: [
      { label: "Diseño base", value: "Estructura panal hexagonal (Honeycomb)" },
      { label: "Certificación", value: "MIL-STD-810H (caídas, vibración, humedad)" },
      { label: "Pies de apoyo", value: "Goma de alta adherencia acústica" },
      { label: "Tornillos", value: "Tornillo Pop-up especial en la esquina" }
    ],
    highlightColor: "#8C9BAE"
  }
};
