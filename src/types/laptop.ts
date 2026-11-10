/**
 * Tipos e interfaces para el despiece interactivo del ASUS TUF Gaming A15
 */

export interface ComponentDetail {
  id: string;
  name: string;
  category: 'exterior' | 'display' | 'cooling' | 'motherboard' | 'memory' | 'power' | 'chassis';
  title: string;
  subtitle: string;
  description: string;
  specs: { label: string; value: string }[];
  highlightColor?: string;
}

export interface DisassemblyPhase {
  id: number;
  title: string;
  code: string;
  summary: string;
  targetComponent: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  explodedProgress: number; // 0 a 1
}

export type ViewMode = 'normal' | 'xray' | 'thermal';

export interface TelemetryState {
  fps: number;
  cpuTemp: number;
  gpuTemp: number;
  fanSpeedRPM: number;
  disassemblyPercent: number;
  currentPhase: number;
  isInspecting: boolean;
  selectedComponent: ComponentDetail | null;
  viewMode: ViewMode;
  audioEnabled: boolean;
}
