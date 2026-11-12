import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { AppTheme } from '../types/laptop';

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
  disassemblyPercent: number;
  onSelectComponent: (componentId: string) => void;
  activeComponentId: string | null;
  theme?: AppTheme;
}

export const HotspotsOverlay: React.FC<HotspotsOverlayProps> = ({
  hotspots,
  isVisible,
  disassemblyPercent,
  onSelectComponent,
  activeComponentId,
  theme = 'cyber',
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Ocultar marcadores cuando la máquina está ensamblada (percent < 10) para evitar saturación sobre el teclado
  if (!isVisible || disassemblyPercent < 10) return null;

  const isLight = theme === 'studio';

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {Object.entries(hotspots).map(([id, data]) => {
        if (!data.visible) return null;

        const isSelected = activeComponentId === data.targetId;
        const isHovered = hoveredId === id;
        const showTag = isHovered || isSelected;

        return (
          <div
            key={id}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              left: `${data.x}px`,
              top: `${data.y}px`,
            }}
          >
            {/* Minimal Apple-style Anchor Pin */}
            <div
              className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto cursor-pointer p-2"
              onMouseEnter={() => {
                soundManager.playMechanicalClick();
                setHoveredId(id);
              }}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                soundManager.playMechanicalClick();
                onSelectComponent(data.targetId);
              }}
              title={data.name}
            >
              <span
                className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                  showTag
                    ? isLight
                      ? 'bg-slate-900 border-white scale-125 shadow-[0_0_10px_rgba(0,0,0,0.3)]'
                      : 'bg-accent border-white scale-125 shadow-[0_0_12px_rgba(74,222,128,0.5)]'
                    : isLight
                    ? 'bg-white/90 border-slate-700/60 shadow-sm hover:scale-125'
                    : 'bg-black/80 border-white/60 shadow-sm hover:scale-125'
                }`}
              />
            </div>

            {/* Clean Frosted Tag on Hover or Selection */}
            {showTag && (
              <div
                className={`absolute left-4 -top-3 pointer-events-auto cursor-pointer rounded-xl border px-3 py-2 text-xs shadow-xl backdrop-blur-xl transition-all duration-200 z-30 min-w-[160px] ${
                  isLight
                    ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
                    : 'bg-black/90 border-white/15 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                }`}
                onClick={() => onSelectComponent(data.targetId)}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-xs truncate">{data.name}</span>
                  <ArrowUpRight size={13} className="shrink-0 opacity-40" />
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">{data.badge}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
