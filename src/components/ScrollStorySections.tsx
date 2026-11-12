import React from 'react';
import { DISASSEMBLY_PHASES } from '../data/laptopSpecs';
import { soundManager } from '../utils/soundEffects';
import { AppTheme } from '../types/laptop';
import {
  ArrowDown,
  Info
} from 'lucide-react';

interface ScrollStorySectionsProps {
  currentPhaseIndex: number;
  onSelectComponent: (componentId: string) => void;
  onJumpToPhase: (phaseIndex: number) => void;
  theme?: AppTheme;
}

export const ScrollStorySections: React.FC<ScrollStorySectionsProps> = ({
  currentPhaseIndex,
  onSelectComponent,
  onJumpToPhase,
  theme = 'cyber'
}) => {
  const isLight = theme === 'studio';
  const isBlueprint = theme === 'blueprint';

  return (
    <div className="relative z-20 pointer-events-none">
      {/* Indicador lateral de fases de desmontaje (Jump navigation) */}
      <nav
        className={`fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col space-y-2.5 p-3 rounded-xl backdrop-blur-md border shadow-2xl pointer-events-auto transition-colors duration-300 ${
          isLight
            ? 'bg-white/90 border-slate-200 shadow-[0_10px_35px_rgba(0,0,0,0.08)] text-slate-800'
            : isBlueprint
            ? 'bg-[#07152B]/90 border-[#00E5FF]/30 text-slate-100'
            : 'bg-[#0B0E14]/85 border-[#1E2736] text-slate-100'
        }`}
      >
        <div className="text-[10px] font-['Orbitron'] font-bold text-[#FFB800] tracking-widest px-1 pb-1 border-b border-black/10 dark:border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full animate-pulse" />
          FASES
        </div>
        {DISASSEMBLY_PHASES.map((phase, idx) => {
          const isActive = currentPhaseIndex === idx;
          return (
            <button
              key={phase.id}
              onClick={() => {
                soundManager.playMechanicalClick();
                onJumpToPhase(idx);
              }}
              className={`group flex items-center space-x-3 text-left focus:outline-none p-1 rounded-lg transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-[#141A24]/60'
              }`}
              title={phase.title}
            >
              <div
                className={`w-2 h-6 rounded-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-[#FFB800] h-8 shadow-[0_0_10px_#FFB800]'
                    : isLight
                    ? 'bg-slate-200 group-hover:bg-slate-300'
                    : 'bg-[#1E2636] group-hover:bg-[#2F3C54]'
                }`}
              />
              <div className="hidden xl:flex flex-col transition-opacity duration-300">
                <span
                  className={`text-[9px] font-['JetBrains_Mono'] ${
                    isActive
                      ? 'text-[#FFB800] font-bold'
                      : isLight
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {phase.code}
                </span>
                <span
                  className={`text-xs font-['Rajdhani'] font-semibold leading-tight max-w-[170px] truncate ${
                    isActive
                      ? isLight
                        ? 'text-slate-900 font-bold'
                        : 'text-white font-bold'
                      : isLight
                      ? 'text-slate-600 group-hover:text-slate-900'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {phase.title}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Contenedores de secciones con scroll espaciado para el disparador de GSAP */}
      {DISASSEMBLY_PHASES.map((phase, index) => {
        return (
          <section
            key={phase.id}
            id={`phase-section-${index}`}
            className="h-screen w-full flex items-end pb-8 md:pb-0 md:items-center px-3 md:pl-28 xl:pl-80 pr-3 lg:pr-96 pointer-events-none"
          >
            <div className="w-full max-w-lg pointer-events-auto">
              <div
                className={`backdrop-blur-xl border cut-corner-br p-4 md:p-8 shadow-2xl relative transition-all duration-300 ${
                  isLight
                    ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.1)]'
                    : isBlueprint
                    ? 'bg-[#0B1A30]/95 border-[#00E5FF]/40 text-slate-100 shadow-[0_25px_60px_rgba(0,229,255,0.12)]'
                    : 'bg-[#0B0F17]/94 border-[#252E3E] text-white shadow-2xl'
                }`}
              >
                {/* Indicador de código militar */}
                <div className="flex items-center justify-between mb-2 md:mb-3 border-b border-black/10 dark:border-white/10 pb-1.5 md:pb-2">
                  <span
                    className={`text-[10px] md:text-[11px] font-['JetBrains_Mono'] font-bold tracking-widest flex items-center gap-1.5 ${
                      isLight ? 'text-blue-600' : 'text-[#00E5FF]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-ping ${
                        isLight ? 'bg-blue-600' : 'bg-[#00E5FF]'
                      }`}
                    />
                    {phase.code}
                  </span>
                  <span
                    className={`text-[10px] md:text-[11px] font-['JetBrains_Mono'] ${
                      isLight ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    ETAPA {index + 1} DE {DISASSEMBLY_PHASES.length}
                  </span>
                </div>

                {/* Título de la etapa de desmontaje */}
                <h2
                  className={`text-xl md:text-3xl font-['Orbitron'] font-black mb-1.5 md:mb-2 leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {phase.title}
                </h2>

                {/* Resumen explicativo */}
                <p
                  className={`text-xs md:text-base font-['Rajdhani'] font-medium leading-relaxed mb-3.5 md:mb-5 line-clamp-3 md:line-clamp-none ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {phase.summary}
                </p>

                {/* Botón de inspección y detalles */}
                <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                  <button
                    onClick={() => {
                      soundManager.playMechanicalClick();
                      onSelectComponent(phase.targetComponent);
                    }}
                    className="flex items-center space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#FFB800] hover:bg-[#FFA500] text-black font-['Rajdhani'] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(255,184,0,0.25)]"
                  >
                    <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Ficha de Ingeniería</span>
                  </button>

                  {index === 0 && (
                    <div
                      className={`flex items-center space-x-1.5 text-[11px] md:text-xs font-['JetBrains_Mono'] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#FFB800]" />
                      <span>Desliza para desmontar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
