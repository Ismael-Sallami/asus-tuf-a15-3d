import React, { useState } from 'react';
import { soundManager } from '../utils/soundEffects';
import { ArrowUpRight } from 'lucide-react';

export interface HotspotData {
  x: number;
  y: number;
  visible: boolean;
  name: string;
  code: string;
  badge: string;
  metric: string;
  targetId: string;
}

interface HotspotsOverlayProps {
  hotspots: Record<string, HotspotData>;
  isVisible: boolean;
  onSelectComponent: (componentId: string) => void;
  activeComponentId: string | null;
  currentPhaseTarget?: string;
  activeCategory?: string | null;
}

export const HotspotsOverlay: React.FC<HotspotsOverlayProps> = ({
  hotspots,
  isVisible,
  onSelectComponent,
  activeComponentId,
  currentPhaseTarget,
  activeCategory
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {Object.entries(hotspots).map(([id, data]) => {
        if (!data.visible) return null;

        const isPhaseActive = currentPhaseTarget === data.targetId || currentPhaseTarget === id;
        const isSelected = activeComponentId === data.targetId;
        const isHovered = hoveredId === id;
        const isCategoryMatch = Boolean(
          activeCategory &&
          (activeCategory === id || activeCategory === data.targetId ||
            (activeCategory === 'motherboard' && ['cpu', 'gpu', 'ram', 'ssd'].includes(id)))
        );

        // La tarjeta se expande si está seleccionada, en hover, si coincide con la fase activa o si la categoría está aislada
        const showCard = isHovered || isSelected || isPhaseActive || isCategoryMatch;

        // Determinar si la tarjeta flota hacia la derecha o izquierda según la posición X
        const isRight = data.x < window.innerWidth / 2;
        const cardOffsetX = isRight ? 28 : -200;
        const cardOffsetY = -40;

        return (
          <div
            key={id}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              left: `${data.x}px`,
              top: `${data.y}px`
            }}
          >
            {/* Punto de anclaje 3D interactivo con radar ping */}
            <div
              className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto cursor-pointer p-2"
              onMouseEnter={() => {
                soundManager.playMechanicalClick();
                setHoveredId(id);
              }}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                soundManager.playMechanicalClick();
                soundManager.playFuturisticHum();
                onSelectComponent(data.targetId);
              }}
              title={`Clic para inspeccionar ${data.name}`}
            >
              <span className={`absolute w-7 h-7 rounded-full bg-[#00E5FF]/20 ${showCard ? 'animate-ping' : ''}`} />
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                  showCard
                    ? 'bg-[#FFB800] border-white scale-125 shadow-[0_0_14px_#FFB800]'
                    : 'bg-[#00E5FF] border-[#080A0D] shadow-[0_0_8px_#00E5FF] hover:scale-125'
                }`}
              />
            </div>

            {/* Línea conectora SVG animada */}
            {showCard && (
              <svg
                className="absolute pointer-events-none overflow-visible"
                style={{
                  left: 0,
                  top: 0
                }}
              >
                <line
                  x1="0"
                  y1="0"
                  x2={cardOffsetX > 0 ? cardOffsetX : cardOffsetX + 180}
                  y2={cardOffsetY + 18}
                  stroke={isSelected || isPhaseActive ? '#FFB800' : 'rgba(0, 229, 255, 0.65)'}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              </svg>
            )}

            {/* Tarjeta flotante glassmorphic con micro-datos de ingeniería */}
            {showCard && (
              <div
                className={`absolute pointer-events-auto rounded-lg border backdrop-blur-md p-2.5 transition-all duration-200 shadow-2xl w-48 ${
                  isSelected || isPhaseActive
                    ? 'bg-[#141B26]/95 border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.3)] scale-105'
                    : 'bg-[#0A0E17]/90 border-[#212C3D] hover:border-[#00E5FF] hover:bg-[#0E1522]/95'
                }`}
                style={{
                  left: `${cardOffsetX}px`,
                  top: `${cardOffsetY}px`
                }}
                onClick={() => {
                  soundManager.playMechanicalClick();
                  soundManager.playFuturisticHum();
                  onSelectComponent(data.targetId);
                }}
              >
                <div className="flex items-center justify-between gap-1 mb-1 border-b border-white/10 pb-1">
                  <span className="text-[9px] font-['JetBrains_Mono'] text-[#00E5FF] font-bold tracking-wider truncate">
                    {data.code}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
                <h4 className="text-xs font-['Orbitron'] font-bold text-white leading-tight mb-1 truncate">
                  {data.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-['Rajdhani'] text-slate-300">
                  <span className="text-slate-400 truncate">{data.badge}</span>
                  <span className="font-bold text-[#FFB800] shrink-0 font-['JetBrains_Mono']">
                    {data.metric}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
