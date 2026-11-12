import React, { useState } from 'react';
import { ViewMode, AppTheme } from '../types/laptop';
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
  X,
  Sun,
  Moon,
  Terminal
} from 'lucide-react';

interface HeaderNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isInspecting: boolean;
  onToggleInspect: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentPhaseName: string;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  viewMode,
  onViewModeChange,
  isInspecting,
  onToggleInspect,
  soundEnabled,
  onToggleSound,
  currentPhaseName,
  theme,
  onThemeChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewChange = (mode: ViewMode) => {
    soundManager.playMechanicalClick();
    onViewModeChange(mode);
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    soundManager.playLayerSwitch();
    onThemeChange(newTheme);
  };

  const isLight = theme === 'studio';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-14 md:h-16 transition-colors duration-300 px-3 md:px-8 flex items-center justify-between backdrop-blur-md border-b ${
          isLight
            ? 'bg-white/85 border-slate-200/90 text-slate-800 shadow-sm'
            : theme === 'blueprint'
            ? 'bg-[#07152B]/90 border-[#00E5FF]/20 text-slate-100 shadow-lg'
            : 'bg-[#0B0E14]/92 border-[#252D3D] text-slate-100 shadow-lg'
        }`}
      >
        {/* Zona izquierda: Logotipo TUF Gaming y Modelo */}
        <div className="flex items-center space-x-3">
          <svg className="w-7 h-7 md:w-8 md:h-8 text-[#FFB800] shrink-0" viewBox="0 0 40 40" fill="currentColor">
            <polygon points="4,8 14,8 18,17 12,27 4,27 9,17" />
            <polygon points="36,8 26,8 22,17 28,27 36,27 31,17" />
            <polygon points="20,4 24,12 20,24 16,12" />
          </svg>
          <div className="flex flex-col">
            <span
              className={`font-['Orbitron'] font-black text-sm md:text-lg tracking-wider whitespace-nowrap ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              ASUS TUF <span className="text-[#FFB800]">A15</span>
            </span>
            <span
              className={`text-[9px] md:text-[10px] font-['JetBrains_Mono'] tracking-widest -mt-0.5 md:-mt-1 truncate max-w-[140px] md:max-w-none ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              FA507NV // TEARDOWN
            </span>
          </div>

          <div className="hidden lg:block h-7 w-[1px] bg-slate-400/20" />

          <div
            className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-['JetBrains_Mono'] border ${
              isLight
                ? 'bg-slate-100/90 border-slate-200 text-slate-700'
                : 'bg-[#141A24] border-[#2A3648] text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>MIL-STD-810H CERTIFIED</span>
          </div>

          <div
            className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded text-[12px] font-['JetBrains_Mono'] border ${
              isLight
                ? 'bg-blue-50/80 border-blue-200 text-blue-700'
                : 'bg-[#121824] border-[#00E5FF]/20 text-[#00E5FF]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00E5FF]" />
            <span className="font-bold">{currentPhaseName}</span>
          </div>
        </div>

        {/* Zona derecha en Desktop */}
        <div className="hidden md:flex items-center space-x-2 md:space-x-3">
          {/* Selector de Tema: Studio Light vs Cyber Dark vs CAD Blueprint */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#10141C] border-[#252D3D]'
            }`}
          >
            <button
              onClick={() => handleThemeChange('studio')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-all ${
                theme === 'studio'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tema Claro Minimalista de Estudio (Estilo Apple / Inside MacBook)"
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>STUDIO</span>
            </button>

            <button
              onClick={() => handleThemeChange('cyber')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-all ${
                theme === 'cyber'
                  ? 'bg-[#FFB800] text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tema Oscuro Cyber Militar TUF Gaming"
            >
              <Moon className="w-3 h-3 text-slate-300" />
              <span>CYBER</span>
            </button>

            <button
              onClick={() => handleThemeChange('blueprint')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-all ${
                theme === 'blueprint'
                  ? 'bg-[#00E5FF] text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tema Técnico CAD Blueprint de Ingeniería"
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>CAD</span>
            </button>
          </div>

          {/* Selector de Materiales PBR: Normal, Térmico, Rayos X */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#10141C] border-[#252D3D]'
            }`}
          >
            <button
              onClick={() => handleViewChange('normal')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-colors ${
                viewMode === 'normal'
                  ? 'bg-[#FFB800] text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista de materiales estándar PBR"
            >
              <Eye className="w-3 h-3" />
              <span>PBR</span>
            </button>

            <button
              onClick={() => handleViewChange('thermal')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-colors ${
                viewMode === 'thermal'
                  ? 'bg-[#EF4444] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Gradiente térmico infrarrojo (FLIR)"
            >
              <Flame className="w-3 h-3" />
              <span>FLIR</span>
            </button>

            <button
              onClick={() => handleViewChange('xray')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-['Rajdhani'] font-bold rounded transition-colors ${
                viewMode === 'xray'
                  ? 'bg-[#00E5FF] text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visión de rayos X translúcida"
            >
              <Scan className="w-3 h-3" />
              <span>X-RAY</span>
            </button>
          </div>

          {/* Botón de Inspección Libre 360° */}
          <button
            onClick={() => {
              soundManager.playMechanicalClick();
              onToggleInspect();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-['Rajdhani'] font-bold rounded-lg border transition-all ${
              isInspecting
                ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] shadow-[0_0_12px_rgba(255,184,0,0.25)]'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-400'
                : 'bg-[#141A24] border-[#2A3648] text-slate-300 hover:border-[#FFB800]/50'
            }`}
            title="Alternar entre inspección 360° u órbita de scroll"
          >
            <Compass className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>{isInspecting ? 'ORBITAL 360°' : 'INSPECCIÓN'}</span>
          </button>

          {/* Toggle de Audio Web Audio API */}
          <button
            onClick={() => onToggleSound()}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-[#141A24] border-[#FFB800]/40 text-[#FFB800]'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-[#10141C] border-[#252D3D] text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Silenciar efectos sonoros' : 'Activar efectos sonoros'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Menú Móvil */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => handleThemeChange(isLight ? 'cyber' : 'studio')}
            className="p-1.5 rounded border border-slate-700 text-slate-300"
            title="Alternar tema"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#FFB800]" />}
          </button>

          <button
            onClick={() => onToggleSound()}
            className="p-1.5 rounded border border-slate-700 text-slate-300"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FFB800]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundManager.playMechanicalClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-1.5 rounded border border-slate-700 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-[#0E131C]/98 border-b border-[#252D3D] p-4 flex flex-col space-y-3 md:hidden">
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-['Orbitron'] font-bold text-slate-400">TEMA</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  handleThemeChange('studio');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs font-bold rounded ${
                  theme === 'studio' ? 'bg-white text-slate-900' : 'bg-[#141A24] text-slate-300'
                }`}
              >
                STUDIO
              </button>
              <button
                onClick={() => {
                  handleThemeChange('cyber');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs font-bold rounded ${
                  theme === 'cyber' ? 'bg-[#FFB800] text-black' : 'bg-[#141A24] text-slate-300'
                }`}
              >
                CYBER
              </button>
              <button
                onClick={() => {
                  handleThemeChange('blueprint');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs font-bold rounded ${
                  theme === 'blueprint' ? 'bg-[#00E5FF] text-black' : 'bg-[#141A24] text-slate-300'
                }`}
              >
                CAD
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
