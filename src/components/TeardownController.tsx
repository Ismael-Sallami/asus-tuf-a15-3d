import React from 'react';
import { soundManager } from '../utils/soundEffects';
import { AppTheme } from '../types/laptop';
import {
  Play,
  Pause,
  Layers,
  Camera,
  MapPin
} from 'lucide-react';

interface TeardownControllerProps {
  disassemblyPercent: number;
  onPercentChange: (percent: number) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  activeCameraPreset: string;
  onSelectCameraPreset: (preset: 'perspective' | 'top' | 'cooling' | 'front' | 'bottom') => void;
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  showHotspots: boolean;
  onToggleHotspots: () => void;
  theme?: AppTheme;
}

export const TeardownController: React.FC<TeardownControllerProps> = ({
  disassemblyPercent,
  onPercentChange,
  isAutoPlaying,
  onToggleAutoPlay,
  activeCameraPreset,
  onSelectCameraPreset,
  activeCategory,
  onSelectCategory,
  showHotspots,
  onToggleHotspots,
  theme = 'cyber'
}) => {
  const isLight = theme === 'studio';
  const isBlueprint = theme === 'blueprint';

  const cameraPresets = [
    { id: 'perspective', label: 'Perspectiva' },
    { id: 'top', label: 'Cenital' },
    { id: 'cooling', label: 'Refrigeración' },
    { id: 'front', label: 'Frontal' },
    { id: 'bottom', label: 'Chasis' }
  ];

  const layerCategories = [
    { id: null, label: 'Todas' },
    { id: 'cooling', label: 'Refrigeración' },
    { id: 'motherboard', label: 'Silicio & Placa' },
    { id: 'battery', label: 'Batería 90Wh' },
    { id: 'chassis', label: 'Chasis Base' }
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onPercentChange(val);
    soundManager.playServoSound(val / 100);
    if (val === 0 || val === 100) {
      soundManager.playMagneticSnap();
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-3xl pointer-events-auto transition-all duration-300">
      <div
        className={`backdrop-blur-xl border rounded-2xl p-3 md:p-4 shadow-2xl transition-colors duration-300 ${
          isLight
            ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
            : isBlueprint
            ? 'bg-[#07152B]/95 border-[#00E5FF]/30 text-slate-100 shadow-[0_20px_50px_rgba(0,229,255,0.15)]'
            : 'bg-[#0B0E14]/90 border-[#232B3B] text-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.65)]'
        }`}
      >
        {/* Barra superior de Presets y Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-black/10 dark:border-white/10">
          {/* Ángulos de Cámara estilo Inside MacBook */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <span
              className={`text-[10px] font-['Orbitron'] font-bold flex items-center gap-1 shrink-0 mr-1 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Camera className="w-3 h-3 text-[#FFB800]" />
              <span className="hidden sm:inline">VISTA:</span>
            </span>
            {cameraPresets.map((preset) => {
              const isActive = activeCameraPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    soundManager.playLayerSwitch();
                    onSelectCameraPreset(preset.id as any);
                  }}
                  className={`text-[11px] font-['Rajdhani'] font-bold px-2.5 py-1 rounded-md transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#FFB800] text-black shadow-[0_0_10px_rgba(255,184,0,0.35)]'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      : 'bg-[#121721] text-slate-400 hover:text-white hover:bg-[#1A2230]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Toggle de Marcadores 3D */}
          <button
            onClick={() => {
              soundManager.playMechanicalClick();
              onToggleHotspots();
            }}
            className={`flex items-center gap-1.5 text-[11px] font-['Rajdhani'] font-bold px-2.5 py-1 rounded-md border transition-all shrink-0 ${
              showHotspots
                ? isLight
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                : 'bg-[#121721] border-[#20293A] text-slate-400 hover:text-slate-200'
            }`}
            title="Mostrar u ocultar puntos de anclaje técnicos en 3D"
          >
            <MapPin className="w-3 h-3" />
            <span>Marcadores 3D</span>
          </button>
        </div>

        {/* Fila del Control Deslizante de Despiece (Take it Apart) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Botón de Autoplay / Walkthrough 20s */}
          <button
            onClick={() => {
              soundManager.playMechanicalClick();
              onToggleAutoPlay();
            }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Orbitron'] font-black uppercase tracking-wider transition-all shrink-0 w-full sm:w-auto shadow-lg ${
              isAutoPlaying
                ? 'bg-[#FF4500] text-white animate-pulse shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                : 'bg-gradient-to-r from-[#FFB800] to-[#FFA000] text-black hover:brightness-110 shadow-[0_0_15px_rgba(255,184,0,0.3)]'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Despiece 20s</span>
              </>
            )}
          </button>

          {/* Barra deslizante continua */}
          <div className="flex-1 w-full flex flex-col justify-center">
            <div
              className={`flex items-center justify-between text-[10px] font-['JetBrains_Mono'] mb-1 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>ENSAMBLADO (0%)</span>
              <span className="text-[#FFB800] font-bold text-xs font-['Orbitron']">
                {disassemblyPercent}% DESPIECE
              </span>
              <span>DESACOPLADO (100%)</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={disassemblyPercent}
                onChange={handleSliderChange}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#FFB800] border focus:outline-none focus:ring-1 focus:ring-[#FFB800] ${
                  isLight
                    ? 'bg-slate-200 border-slate-300'
                    : 'bg-[#141A24] border-[#252E3E]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Aislamiento de capas (Subsystem Filter) */}
        <div className="hidden md:flex items-center gap-1.5 mt-2.5 pt-2 border-t border-black/10 dark:border-white/10">
          <span
            className={`text-[10px] font-['Orbitron'] font-bold flex items-center gap-1 shrink-0 mr-1 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3 text-[#00E5FF]" />
            <span>AISLAR CAPA:</span>
          </span>
          {layerCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  soundManager.playLayerSwitch();
                  onSelectCategory(cat.id);
                }}
                className={`text-[10px] font-['Rajdhani'] font-bold px-2 py-0.5 rounded transition-all ${
                  isActive
                    ? 'bg-[#00E5FF] text-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    : 'bg-[#10151E] text-slate-400 hover:text-slate-200 hover:bg-[#18202C]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
