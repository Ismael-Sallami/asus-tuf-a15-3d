import React, { useState } from 'react';
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
  Radio,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 bg-[#0B0E14]/92 backdrop-blur-md border-b border-[#252D3D] px-3 md:px-8 flex items-center justify-between text-slate-100">
        {/* Zona izquierda: Logotipo TUF Gaming y Modelo */}
        <div className="flex items-center space-x-3">
          <svg className="w-7 h-7 md:w-8 md:h-8 text-[#FFB800] shrink-0" viewBox="0 0 40 40" fill="currentColor">
            <polygon points="4,8 14,8 18,17 12,27 4,27 9,17" />
            <polygon points="36,8 26,8 22,17 28,27 36,27 31,17" />
            <polygon points="20,4 24,12 20,24 16,12" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Orbitron'] font-black text-sm md:text-lg tracking-wider text-white whitespace-nowrap">
              ASUS TUF <span className="text-[#FFB800]">A15</span>
            </span>
            <span className="text-[9px] md:text-[10px] font-['JetBrains_Mono'] tracking-widest text-slate-400 -mt-0.5 md:-mt-1 truncate max-w-[140px] md:max-w-none">
              FA507NV // TEARDOWN
            </span>
          </div>

          <div className="hidden lg:block h-7 w-[1px] bg-[#252D3D]" />

          <div className="hidden lg:flex items-center space-x-1.5 bg-[#141A24] border border-[#2A3648] px-2.5 py-1 rounded text-[11px] font-['JetBrains_Mono'] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>MIL-STD-810H CERTIFIED</span>
          </div>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-[#121824] border border-[#00E5FF]/20 rounded text-[12px] font-['JetBrains_Mono'] text-[#00E5FF]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00E5FF]" />
            <span className="font-bold">{currentPhaseName}</span>
          </div>
        </div>

        {/* Zona derecha en Desktop */}
        <div className="hidden md:flex items-center space-x-2 md:space-x-4">
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
              <span>NORMAL</span>
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
              <span>TÉRMICO</span>
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
              <span>RAYOS X</span>
            </button>
          </div>

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
            <span>{isInspecting ? 'ORBITAL 360° ON' : 'INSPECCIÓN 360°'}</span>
          </button>

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

        {/* Botón Hamburguesa / Menú en Móvil */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={handleSoundClick}
            className={`p-1.5 rounded border transition-colors ${
              soundEnabled
                ? 'bg-[#141A24] border-[#FFB800]/40 text-[#FFB800]'
                : 'bg-[#10141C] border-[#252D3D] text-slate-500'
            }`}
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundManager.playMechanicalClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#141A24] border border-[#2A3648] text-[#FFB800] rounded text-xs font-['Rajdhani'] font-bold"
            title="Menú de modos y controles"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-[11px] font-['Orbitron']">MENÚ</span>
          </button>
        </div>
      </header>

      {/* Menú Desplegable Táctico para Móvil */}
      {mobileMenuOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-[#0B0E14]/98 backdrop-blur-xl border-b border-[#252D3D] p-4 flex flex-col space-y-3.5 shadow-2xl md:hidden">
          <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] border-b border-[#1E2638] pb-2">
            <span className="text-slate-400">FASE ACTUAL:</span>
            <span className="text-[#00E5FF] font-bold">{currentPhaseName}</span>
          </div>

          <div>
            <span className="text-[10px] font-['JetBrains_Mono'] text-slate-400 uppercase mb-1.5 block">
              Modo de Renderizado
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-[#10141C] p-1 rounded border border-[#252D3D]">
              <button
                onClick={() => {
                  handleViewChange('normal');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-['Rajdhani'] font-bold rounded flex items-center justify-center space-x-1 ${
                  viewMode === 'normal' ? 'bg-[#FFB800] text-black' : 'text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>NORMAL</span>
              </button>
              <button
                onClick={() => {
                  handleViewChange('thermal');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-['Rajdhani'] font-bold rounded flex items-center justify-center space-x-1 ${
                  viewMode === 'thermal' ? 'bg-[#EF4444] text-white' : 'text-slate-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>TÉRMICO</span>
              </button>
              <button
                onClick={() => {
                  handleViewChange('xray');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-['Rajdhani'] font-bold rounded flex items-center justify-center space-x-1 ${
                  viewMode === 'xray' ? 'bg-[#00E5FF] text-black' : 'text-slate-300'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>RAYOS X</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              handleInspectClick();
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2.5 rounded text-xs font-['Rajdhani'] font-bold border flex items-center justify-center space-x-2 ${
              isInspecting
                ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]'
                : 'bg-[#141A24] border-[#2A3648] text-slate-200'
            }`}
          >
            <Compass className={`w-4 h-4 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>{isInspecting ? 'ORBITAL 360° ACTIVO (TOCA PARA CERRAR)' : 'ACTIVAR INSPECCIÓN LIBRE 360°'}</span>
          </button>
        </div>
      )}
    </>
  );
};
