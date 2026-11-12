/**
 * Tipos e interfaces para el explorador 3D interactivo del ASUS TUF Gaming A15 (FA507NV)
 */

export type SystemId = 'enclosure' | 'power' | 'cooling' | 'computing' | 'display';

export interface SystemDefinition {
  id: SystemId;
  label: string;
  color: string;
  description: string;
}

export interface PartDefinition {
  id: string;
  name: string;
  shortDesc: string;
  system: SystemId;
  description: string;
  detail: string;
  material: string;
  location: string;
  at: [number, number, number];
  spread: [number, number, number];
  sizeSpan: number;
  specs?: { label: string; value: string }[];
}

export interface BoardGroupDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  location: string;
  detail: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number];
  spread: [number, number, number];
  source: string;
}

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

export type ViewMode = 'normal' | 'xray' | 'thermal';
export type AppTheme = 'studio' | 'cyber' | 'blueprint';
export type CameraPreset = 'perspective' | 'top' | 'front' | 'bottom' | 'left' | 'right';
