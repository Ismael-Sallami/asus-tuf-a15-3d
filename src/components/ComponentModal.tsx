import React, { useEffect } from 'react';
import { ComponentDetail } from '../types/laptop';
import { soundManager } from '../utils/soundEffects';
import {
  X,
  Crosshair,
  Cpu,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

interface ComponentModalProps {
  component: ComponentDetail | null;
  onClose: () => void;
  onFocusCamera: (componentId: string) => void;
}

export const ComponentModal: React.FC<ComponentModalProps> = ({
  component,
  onClose,
  onFocusCamera
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && component) {
        soundManager.playMechanicalClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [component, onClose]);

  if (!component) return null;

  const handleClose = () => {
    soundManager.playMechanicalClick();
    onClose();
  };

  const handleFocus = () => {
    soundManager.playMechanicalClick();
    soundManager.playFuturisticHum();
    onFocusCamera(component.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Caja modal con corte militar y halo sutil */}
      <div className="relative w-full max-w-2xl bg-[#0E131C] border border-[#2A3446] cut-corner-br shadow-[0_0_40px_rgba(0,0,0,0.8)] text-slate-200 overflow-hidden">
        {/* Franja superior con acento de color del componente */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: component.highlightColor || '#FFB800' }}
        />

        {/* Cabecera militar */}
        <div className="p-5 border-b border-[#1E2738] flex items-start justify-between bg-[#121824]">
          <div className="flex items-start space-x-3">
            <div
              className="p-2.5 rounded border mt-0.5"
              style={{
                borderColor: `${component.highlightColor || '#FFB800'}44`,
                backgroundColor: `${component.highlightColor || '#FFB800'}15`
              }}
            >
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-['JetBrains_Mono'] tracking-widest text-slate-400 uppercase bg-[#0B0E14] px-2 py-0.5 rounded border border-[#252F42]">
                  SPEC-ID // {component.id.toUpperCase()}
                </span>
                <span
                  className="text-[10px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded uppercase"
                  style={{
                    color: component.highlightColor || '#FFB800',
                    backgroundColor: `${component.highlightColor || '#FFB800'}22`
                  }}
                >
                  {component.category}
                </span>
              </div>
              <h2 className="text-xl font-['Orbitron'] font-black text-white mt-1">
                {component.name}
              </h2>
              <p className="text-xs font-['Rajdhani'] font-semibold text-slate-400 tracking-wider">
                {component.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1A2234] border border-transparent hover:border-[#2E3B50] transition-colors"
            title="Cerrar ventana [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del contenido */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Título de sección y descripción */}
          <div>
            <h3 className="text-sm font-['Orbitron'] font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FFB800]" />
              {component.title}
            </h3>
            <p className="text-sm font-['Rajdhani'] text-slate-300 leading-relaxed text-justify">
              {component.description}
            </p>
          </div>

          {/* Matriz técnica de especificaciones */}
          <div>
            <h4 className="text-xs font-['JetBrains_Mono'] text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00E5FF]" /> Parámetros y Tolerancias Técnicas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#0B0E14] p-3 rounded border border-[#1C2433]">
              {component.specs.map((spec, index) => (
                <div
                  key={index}
                  className="flex flex-col p-2 bg-[#121824] rounded border border-[#1A2232]"
                >
                  <span className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                    {spec.label}
                  </span>
                  <span className="text-xs font-['Rajdhani'] font-bold text-white mt-0.5">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sello de conformidad de grado militar */}
          <div className="bg-[#121A28] border border-[#1E2E44] p-3 rounded flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#FFB800] shrink-0" />
            <p className="text-slate-300 font-['Rajdhani']">
              Componente verificado bajo las normas de resistencia mecánica y térmica <span className="text-white font-bold">MIL-STD-810H</span> (resistencia a vibraciones balísticas, impactos y temperaturas extremas de -32°C a 49°C).
            </p>
          </div>
        </div>

        {/* Barra inferior de acciones */}
        <div className="p-4 bg-[#121824] border-t border-[#1E2738] flex items-center justify-between">
          <button
            onClick={handleFocus}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFB800] hover:bg-[#FFA500] text-black font-['Rajdhani'] font-bold text-xs rounded transition-colors shadow-[0_0_15px_rgba(255,184,0,0.3)]"
          >
            <Crosshair className="w-4 h-4" />
            <span>ENFOCAR VISTA 3D</span>
          </button>

          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#1A2234] hover:bg-[#222E46] text-slate-300 font-['Rajdhani'] font-semibold text-xs rounded border border-[#2E3C54] transition-colors"
          >
            Cerrar ficha
          </button>
        </div>
      </div>
    </div>
  );
};
