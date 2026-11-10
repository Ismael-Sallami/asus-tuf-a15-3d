import React from 'react';
import { DISASSEMBLY_PHASES } from '../data/laptopSpecs';
import { soundManager } from '../utils/soundEffects';
import {
  ArrowDown,
  Info
} from 'lucide-react';

interface ScrollStorySectionsProps {
  currentPhaseIndex: number;
  onSelectComponent: (componentId: string) => void;
  onJumpToPhase: (phaseIndex: number) => void;
}

export const ScrollStorySections: React.FC<ScrollStorySectionsProps> = ({
  currentPhaseIndex,
  onSelectComponent,
  onJumpToPhase
}) => {
  return (
    <div className="relative z-20 pointer-events-none">
      {/* Indicador lateral de fases de desmontaje (Jump navigation) */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col space-y-2.5 p-3 rounded-lg bg-[#0B0E14]/85 backdrop-blur-md border border-[#1E2736] shadow-2xl pointer-events-auto">
        <div className="text-[10px] font-['Orbitron'] font-bold text-[#FFB800] tracking-widest px-1 pb-1 border-b border-[#1E2736]/60 flex items-center gap-1.5">
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
              className="group flex items-center space-x-3 text-left focus:outline-none p-1 rounded hover:bg-[#141A24]/60 transition-colors"
              title={phase.title}
            >
              <div
                className={`w-2 h-6 rounded-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-[#FFB800] h-8 shadow-[0_0_10px_#FFB800]'
                    : 'bg-[#1E2636] group-hover:bg-[#2F3C54]'
                }`}
              />
              <div className="hidden xl:flex flex-col transition-opacity duration-300">
                <span
                  className={`text-[9px] font-['JetBrains_Mono'] ${
                    isActive ? 'text-[#FFB800] font-bold' : 'text-slate-500'
                  }`}
                >
                  {phase.code}
                </span>
                <span
                  className={`text-xs font-['Rajdhani'] font-semibold leading-tight max-w-[170px] truncate ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
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
            className="h-screen w-full flex items-center px-6 md:pl-28 xl:pl-80 pr-6 lg:pr-96 pointer-events-none"
          >
            <div className="max-w-lg pointer-events-auto">
              <div className="bg-[#0B0F17]/90 backdrop-blur-md border border-[#252E3E] cut-corner-br p-6 md:p-8 shadow-2xl relative">
                {/* Indicador de código militar */}
                <div className="flex items-center justify-between mb-3 border-b border-[#1A2230] pb-2">
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[#00E5FF] font-bold tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-ping" />
                    {phase.code}
                  </span>
                  <span className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                    ETAPA {index + 1} DE {DISASSEMBLY_PHASES.length}
                  </span>
                </div>

                {/* Título de la etapa de desmontaje */}
                <h2 className="text-2xl md:text-3xl font-['Orbitron'] font-black text-white mb-2 leading-tight">
                  {phase.title}
                </h2>

                {/* Resumen explicativo */}
                <p className="text-sm md:text-base font-['Rajdhani'] text-slate-300 font-medium leading-relaxed mb-5">
                  {phase.summary}
                </p>

                {/* Botón de inspección y detalles */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      soundManager.playMechanicalClick();
                      onSelectComponent(phase.targetComponent);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#FFB800] hover:bg-[#FFA500] text-black font-['Rajdhani'] font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-[0_0_15px_rgba(255,184,0,0.25)]"
                  >
                    <Info className="w-4 h-4" />
                    <span>Ficha de Ingeniería</span>
                  </button>

                  {index === 0 && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-['JetBrains_Mono']">
                      <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#FFB800]" />
                      <span>Desliza para iniciar el desmontaje</span>
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
