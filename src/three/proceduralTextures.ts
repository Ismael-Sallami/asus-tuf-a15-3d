import * as THREE from 'three';

/**
 * Generador procedural de texturas 2D en lienzo Canvas para Three.js
 * Proporciona mapas difusos, de relieve y serigrafías técnicas con nivel de detalle industrial.
 */

/**
 * Textura para la placa base multicapa (PCB) del ASUS TUF A15
 * Incluye pistas de cobre dorado, máscara de soldadura verde militar/negra, serigrafía técnica y zonas BGA.
 */
export function createMotherboardTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Fondo de sustrato FR4 negro mate / militar oscuro
  ctx.fillStyle = '#0c1214';
  ctx.fillRect(0, 0, width, height);

  // Patrón sutil de fibra de vidrio en la máscara
  ctx.fillStyle = '#0f1719';
  for (let x = 0; x < width; x += 8) {
    for (let y = 0; y < height; y += 8) {
      if ((x + y) % 16 === 0) {
        ctx.fillRect(x, y, 4, 4);
      }
    }
  }

  // Pistas de cobre dorado electrolítico (ENIG)
  ctx.strokeStyle = '#cda250';
  ctx.lineWidth = 1.5;

  const drawTrace = (points: [number, number][]) => {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
  };

  // Bus de memoria DDR5 hacia la CPU
  for (let i = 0; i < 24; i++) {
    const yOffset = 220 + i * 8;
    drawTrace([
      [280, yOffset],
      [360, yOffset],
      [410, yOffset - 30],
      [470, yOffset - 30]
    ]);
  }

  // Pistas del bus PCIe entre GPU y CPU
  ctx.strokeStyle = '#b8903c';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 28; i++) {
    const xOffset = 480 + i * 6;
    drawTrace([
      [xOffset, 520],
      [xOffset, 590],
      [xOffset + 40, 640],
      [xOffset + 40, 710]
    ]);
  }

  // Líneas de alimentación de fases VRM
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const y = 380 + i * 18;
    ctx.beginPath();
    ctx.moveTo(180, y);
    ctx.lineTo(320, y);
    ctx.stroke();
  }

  // Puntos de soldadura pasantes (Vias)
  ctx.fillStyle = '#e6c364';
  for (let i = 0; i < 450; i++) {
    const vx = 80 + Math.random() * 860;
    const vy = 80 + Math.random() * 860;
    ctx.beginPath();
    ctx.arc(vx, vy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Zócalo BGA de la CPU AMD Ryzen 7 (matriz central superior izquierda)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(330, 260, 160, 160);
  ctx.fillStyle = '#111827';
  ctx.fillRect(332, 262, 156, 156);

  // Zócalo BGA de la GPU NVIDIA RTX 4060 (matriz central inferior derecha)
  ctx.strokeRect(540, 360, 190, 190);
  ctx.fillStyle = '#111827';
  ctx.fillRect(542, 362, 186, 186);

  // Módulos de memoria GDDR6 perimetrales de la GPU
  ctx.fillStyle = '#18202f';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  const vramPositions: [number, number][] = [
    [540, 310], [600, 310], [660, 310],
    [540, 560], [600, 560], [660, 560],
    [480, 390], [480, 470]
  ];
  vramPositions.forEach(([vx, vy]) => {
    ctx.fillRect(vx, vy, 48, 38);
    ctx.strokeRect(vx, vy, 48, 38);
    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    ctx.fillText('GDDR6', vx + 8, vy + 22);
    ctx.fillStyle = '#18202f';
  });

  // Condensadores y resistencias SMD dispersos
  ctx.fillStyle = '#64748b';
  for (let i = 0; i < 300; i++) {
    const sx = 100 + Math.random() * 820;
    const sy = 100 + Math.random() * 820;
    ctx.fillRect(sx, sy, 8, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx, sy, 2, 4);
    ctx.fillRect(sx + 6, sy, 2, 4);
    ctx.fillStyle = '#64748b';
  }

  // Serigrafía blanca industrial (Silk Screen)
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('ASUS TUF GAMING PCB FA507 // REV 2.1', 80, 100);

  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('AMD SOCKET FP7 / NVIDIA AD107 ARCHITECTURE', 80, 130);
  ctx.fillText('DESIGNED IN TAIPEI // HIGH DENSITY MULTILAYER PCB', 80, 155);

  ctx.font = '10px monospace';
  ctx.fillText('JTAG1', 340, 245);
  ctx.fillText('DEBUG_PORT', 550, 345);
  ctx.fillText('VRAM_PWR_GND', 490, 580);
  ctx.fillText('FAN_LEFT_PWM', 140, 230);
  ctx.fillText('FAN_RIGHT_PWM', 840, 230);
  ctx.fillText('M2_PCIE_GEN4', 180, 800);
  ctx.fillText('BATTERY_CON1', 480, 870);

  // Logotipo militar estilizado de TUF Gaming en la esquina inferior izquierda
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 920);
  ctx.lineTo(130, 920);
  ctx.lineTo(140, 900);
  ctx.lineTo(150, 920);
  ctx.lineTo(180, 920);
  ctx.lineTo(165, 940);
  ctx.lineTo(140, 970);
  ctx.lineTo(115, 940);
  ctx.closePath();
  ctx.stroke();

  ctx.font = 'bold 16px "Orbitron", sans-serif';
  ctx.fillText('TUF GAMING', 195, 945);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

/**
 * Textura de rejilla hexagonal tipo panal de abeja (Honeycomb) para la tapa D-Cover inferior
 */
export function createHoneycombTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Color de base: polímero reforzado gris carbón militar
  ctx.fillStyle = '#171b21';
  ctx.fillRect(0, 0, size, size);

  // Patrón geométrico de panal de abeja (rejillas de ventilación TUF)
  const hexRadius = 14;
  const hexHeight = hexRadius * Math.sqrt(3);
  const side = hexRadius * 1.5;

  const drawHex = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  // Rejilla de panales perforados
  for (let row = -2; row < size / hexHeight + 4; row++) {
    for (let col = -2; col < size / side + 4; col++) {
      const cx = col * side;
      const cy = row * hexHeight + (col % 2 !== 0 ? hexHeight / 2 : 0);

      // Marco biselado de plástico
      ctx.strokeStyle = '#272e38';
      ctx.lineWidth = 2.5;
      drawHex(cx, cy, hexRadius);
      ctx.stroke();

      // Interior de la ventilación (perforación negra profunda con malla antipolvo detrás)
      ctx.fillStyle = '#060709';
      drawHex(cx, cy, hexRadius - 2.5);
      ctx.fill();

      // Micro-malla antipolvo interna
      ctx.fillStyle = '#111418';
      ctx.fillRect(cx - 3, cy - 3, 6, 6);
    }
  }

  // Franjas de soporte estructural macizas
  ctx.fillStyle = '#1f242c';
  ctx.fillRect(0, 0, size, 40);
  ctx.fillRect(0, size - 40, size, 40);
  ctx.fillRect(0, 0, 30, size);
  ctx.fillRect(size - 30, 0, 30, size);

  // Serigrafía de especificaciones y certificaciones
  ctx.fillStyle = '#4a5568';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('ASUSTeK COMPUTER INC. ALL RIGHTS RESERVED', 45, 25);
  ctx.fillText('MODEL: FA507 // INPUT: +20V = 12A, 240W', 45, size - 18);
  ctx.fillText('MIL-STD-810H CERTIFIED // AIR INTAKE GRILLE', 45, size - 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

/**
 * Textura de pantalla para el panel IPS 144Hz encendido
 * Muestra un arranque militar táctico Armoury Crate con HUD cyberpunk y telemetría visual.
 */
export function createScreenDisplayTexture(): THREE.CanvasTexture {
  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Fondo oscuro espacial profundo
  const grad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 900);
  grad.addColorStop(0, '#0a1017');
  grad.addColorStop(1, '#030508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Retícula cibernética / HUD militar
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.lineWidth = 1;
  const step = 60;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Círculos concéntricos de radar central
  ctx.strokeStyle = 'rgba(255, 184, 0, 0.25)';
  ctx.lineWidth = 1.5;
  [140, 280, 420].forEach(r => {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Emblema TUF Gaming en el centro
  ctx.save();
  ctx.translate(width / 2, height / 2 - 40);

  // Escudo geométrico TUF
  ctx.fillStyle = '#FFB800';
  ctx.shadowColor = '#FFB800';
  ctx.shadowBlur = 25;

  ctx.beginPath();
  // Ala izquierda
  ctx.moveTo(-120, -50);
  ctx.lineTo(-40, -50);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-60, 50);
  ctx.lineTo(-120, 50);
  ctx.lineTo(-90, 0);
  ctx.closePath();
  ctx.fill();

  // Ala derecha
  ctx.beginPath();
  ctx.moveTo(120, -50);
  ctx.lineTo(40, -50);
  ctx.lineTo(20, 0);
  ctx.lineTo(60, 50);
  ctx.lineTo(120, 50);
  ctx.lineTo(90, 0);
  ctx.closePath();
  ctx.fill();

  // Núcleo central
  ctx.beginPath();
  ctx.moveTo(0, -65);
  ctx.lineTo(18, -25);
  ctx.lineTo(0, 35);
  ctx.lineTo(-18, -25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Texto central
  ctx.shadowColor = '#FFB800';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 64px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ASUS TUF GAMING', width / 2, height / 2 + 100);

  ctx.fillStyle = '#00E5FF';
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 10;
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillText('// 144Hz IPS DISPLAY // G-SYNC ACTIVE // MUX SWITCH: dGPU', width / 2, height / 2 + 150);

  // Cajas de telemetría de esquinas
  // Superior izquierda
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.strokeRect(80, 80, 380, 150);
  ctx.fillStyle = 'rgba(11, 15, 23, 0.85)';
  ctx.fillRect(80, 80, 380, 150);
  ctx.fillStyle = '#00E5FF';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('[SYSTEM TELEMETRY]', 100, 115);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('CPU: AMD RYZEN 7 7735HS  [4.25 GHz]', 100, 145);
  ctx.fillText('GPU: NVIDIA RTX 4060     [140W TGP]', 100, 175);
  ctx.fillText('VRAM: 8GB GDDR6          [HIGH CLOCK]', 100, 205);

  // Superior derecha
  ctx.strokeRect(width - 460, 80, 380, 150);
  ctx.fillStyle = 'rgba(11, 15, 23, 0.85)';
  ctx.fillRect(width - 460, 80, 380, 150);
  ctx.fillStyle = '#FFB800';
  ctx.fillText('[THERMAL MATRIX]', width - 440, 115);
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('ARC FLOW FANS: 5,400 RPM [TURBO MODE]', width - 440, 145);
  ctx.fillText('HEAT PIPES: 4X SINTERED COPPER', width - 440, 175);
  ctx.fillText('COOLING EFFICIENCY: 98.4%', width - 440, 205);

  // Línea inferior de estado
  ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
  ctx.fillRect(80, height - 100, width - 160, 35);
  ctx.fillStyle = '#00E5FF';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ARMOURY CRATE v5.7 // MIL-STD-810H CERTIFIED CHASSIS // READY FOR COMBAT', width / 2, height - 76);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

/**
 * Textura de la batería Li-ion de 90Wh con advertencias, certificación y especificaciones
 */
export function createBatteryTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Plástico protector negro mate ignífugo
  ctx.fillStyle = '#14171d';
  ctx.fillRect(0, 0, width, height);

  // Líneas de separación de las 4 celdas internas
  ctx.strokeStyle = '#222834';
  ctx.lineWidth = 4;
  for (let i = 1; i <= 3; i++) {
    const x = (width / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, height - 20);
    ctx.stroke();
  }

  // Marco de etiqueta técnica en celda 2 y 3
  ctx.fillStyle = '#0a0c10';
  ctx.fillRect(280, 50, 464, 412);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(280, 50, 464, 412);

  // Franja de advertencia amarilla TUF
  ctx.fillStyle = '#FFB800';
  ctx.fillRect(295, 70, 434, 30);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText('ASUS RECHARGEABLE LI-ION BATTERY // 90Wh HIGH CAPACITY', 305, 91);

  // Especificaciones técnicas
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('MODEL NO: C41N2013 (4ICP5/58/78)', 305, 135);
  ctx.fillText('RATING: +15.4V === 5675mAh / 90Wh', 305, 160);
  ctx.fillText('LIMITED CHARGE VOLTAGE: 17.6V', 305, 185);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillText('CAUTION / ATTENTION / VORSICHT / PRECAUCIÓN:', 305, 230);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('- Do not disassemble, crush, puncture or expose to high temperatures.', 305, 255);
  ctx.fillText('- Do not short external contacts or dispose of in fire or water.', 305, 275);
  ctx.fillText('- Replace only with ASUS genuine replacement battery.', 305, 295);

  // Logotipos de certificación CE, FCC, Li-ion
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(305, 330, 45, 30);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('CE', 315, 352);

  ctx.strokeRect(365, 330, 55, 30);
  ctx.fillText('RoHS', 372, 352);

  ctx.font = '11px monospace';
  ctx.fillText('4ICP5/58/78-2', 440, 350);
  ctx.fillText('MADE IN CHINA / FABRIQUÉ EN CHINE', 305, 410);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Textura para el módulo de memoria RAM SO-DIMM DDR5
 */
export function createRamTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Sustrato verde oscuro DDR5
  ctx.fillStyle = '#0e2417';
  ctx.fillRect(0, 0, width, height);

  // Pistas de contacto doradas en la parte inferior (pines SO-DIMM)
  ctx.fillStyle = '#d4af37';
  for (let x = 15; x < width - 15; x += 4) {
    if (x > 240 && x < 265) continue; // Muesca física de posicionamiento de la ranura
    ctx.fillRect(x, height - 35, 2.5, 30);
  }

  // 4 chips de memoria DRAM BGA
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  const chipsX = [40, 150, 290, 400];
  chipsX.forEach(cx => {
    ctx.fillRect(cx, 45, 75, 80);
    ctx.strokeRect(cx, 45, 75, 80);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('MICRON', cx + 15, 75);
    ctx.fillText('D8BHH', cx + 18, 92);
    ctx.fillText('DDR5', cx + 22, 108);
    ctx.fillStyle = '#1e293b';
  });

  // PMIC central (circuito de gestión de energía en DDR5)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(235, 60, 42, 42);
  ctx.strokeRect(235, 60, 42, 42);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '7px monospace';
  ctx.fillText('PMIC', 242, 85);

  // Etiqueta serigrafiada del fabricante
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(110, 140, 290, 45);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText('8GB 1Rx16 PC5-4800B-SC0-1010-XT', 120, 158);
  ctx.font = '9px monospace';
  ctx.fillText('ASUS TUF CERTIFIED DDR5 // 1.1V VOLTAGE', 120, 174);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Textura para la unidad de estado sólido SSD M.2 2280 NVMe
 */
export function createSsdTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 160;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // PCB negro mate M.2
  ctx.fillStyle = '#0a0d12';
  ctx.fillRect(0, 0, width, height);

  // Pines dorados en el extremo izquierdo
  ctx.fillStyle = '#d4af37';
  for (let y = 15; y < height - 15; y += 4) {
    if (y > 45 && y < 58) continue; // Ranura Key M
    ctx.fillRect(5, y, 22, 2.5);
  }

  // Controlador NVMe PCIe 4.0
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(60, 35, 80, 85);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(60, 35, 80, 85);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText('PHISON', 75, 70);
  ctx.fillText('PS5018-E18', 68, 88);
  ctx.fillText('GEN4x4', 78, 104);

  // 2x Chips 3D NAND Flash
  [180, 320].forEach(nx => {
    ctx.fillStyle = '#18202d';
    ctx.fillRect(nx, 30, 110, 95);
    ctx.strokeRect(nx, 30, 110, 95);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('MICRON 176L', nx + 20, 68);
    ctx.fillText('3D TLC NAND', nx + 20, 85);
    ctx.fillText('512GB CELL', nx + 24, 102);
  });

  // Lámina disipadora térmica adhesiva de cobre/grafito
  ctx.fillStyle = 'rgba(184, 115, 51, 0.45)';
  ctx.fillRect(50, 10, width - 80, 15);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('TUF GAMING NVMe PCIe 4.0 1TB // HIGH SPEED READ 5000 MB/s', 60, 22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
