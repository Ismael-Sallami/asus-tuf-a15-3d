import React from 'react';
import { ViewMode } from '../types/laptop';
import { soundManager } from '../utils/soundEffects';
import {
  ShieldCheck,
  Volume2,
  VolumeX,
  Eye,
  Flame,
  Scan,
  Compass,
  Radio
} from 'lucide-react';

interface HeaderNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isInspecting: boolean;
  onToggleInspect: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentPhaseName: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  viewMode,
  onViewModeChange,
  isInspecting,
  onToggleInspect,
  soundEnabled,
  onToggleSound,
  currentPhaseName
}) => {
  const handleViewChange = (mode: ViewMode) => {
    soundManager.playMechanicalClick();
    onViewModeChange(mode);
  };

  const handleInspectClick = () => {
    soundManager.playMechanicalClick();
    onToggleInspect();
  };

  const handleSoundClick = () => {
    onToggleSound();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#252D3D] px-4 md:px-8 flex items-center justify-between text-slate-100">
      {/* Zona izquierda: Logotipo TUF Gaming y Modelo FA507 */}
      <div className="flex items-center space-x-4">
        {/* Logotipo vectorial TUF Gaming */}
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-[#FFB800]" viewBox="0 0 40 40" fill="currentColor">
            {/* Escudo TUF Gaming */}
            <polygon points="4,8 14,8 18,17 12,27 4,27 9,17" />
            <polygon points="36,8 26,8 22,17 28,27 36,27 31,17" />
            <polygon points="20,4 24,12 20,24 16,12" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Orbitron'] font-black text-lg tracking-wider text-white flex items-center gap-1.5">
              ASUS TUF <span className="text-[#FFB800]">A15</span>
            </span>
            <span className="text-[10px] font-['JetBrains_Mono'] tracking-widest text-slate-400 -mt-1">
              FA507NV-LP023W // TEARDOWN
            </span>
          </div>
        </div>

        {/* Separador vertical */}
        <div className="hidden lg:block h-7 w-[1px] bg-[#252D3D]" />

        {/* Certificación Militar MIL-STD-810H */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#141A24] border border-[#2A3648] px-2.5 py-1 rounded text-[11px] font-['JetBrains_Mono'] text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
          <span>MIL-STD-810H CERTIFIED</span>
        </div>

        {/* Estado de fase actual de desmontaje */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-[#121824] border border-[#00E5FF]/20 rounded text-[12px] font-['JetBrains_Mono'] text-[#00E5FF]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#00E5FF]" />
          <span className="font-bold">{currentPhaseName}</span>
        </div>
      </div>

      {/* Zona central / derecha: Selectores de modo y controles interactivos */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Selector de modo de vista: Normal, Térmico, Rayos X */}
        <div className="flex items-center bg-[#10141C] p-1 rounded border border-[#252D3D]">
          <button
            onClick={() => handleViewChange('normal')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-colors ${
              viewMode === 'normal'
                ? 'bg-[#FFB800] text-black shadow-[0_0_12px_rgba(255,184,0,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de materiales estándar PBR"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NORMAL</span>
          </button>

          <button
            onClick={() => handleViewChange('thermal')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-colors ${
              viewMode === 'thermal'
                ? 'bg-[#EF4444] text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Gradiente térmico infrarrojo (FLIR)"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TÉRMICO</span>
          </button>

          <button
            onClick={() => handleViewChange('xray')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-colors ${
              viewMode === 'xray'
                ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Visión de rayos X translúcida"
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RAYOS X</span>
          </button>
        </div>

        {/* Botón de Modo Inspección Libre 360° */}
        <button
          onClick={handleInspectClick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-['Rajdhani'] font-bold rounded border transition-all ${
            isInspecting
              ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.25)]'
              : 'bg-[#141A24] border-[#2A3648] text-slate-300 hover:border-[#FFB800]/50'
          }`}
          title="Alternar entre control libre 360° o seguimiento cinemático de scroll"
        >
          <Compass className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isInspecting ? 'ORBITAL 360° ON' : 'INSPECCIÓN 360°'}</span>
        </button>

        {/* Toggle de efectos de sonido sintetizados */}
        <button
          onClick={handleSoundClick}
          className={`p-2 rounded border transition-colors ${
            soundEnabled
              ? 'bg-[#141A24] border-[#FFB800]/40 text-[#FFB800]'
              : 'bg-[#10141C] border-[#252D3D] text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Silenciar efectos sonoros' : 'Activar efectos sonoros'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
