import React, { useEffect } from 'react';
import { ComponentDetail, AppTheme } from '../types/laptop';
import { soundManager } from '../utils/soundEffects';
import { X, Crosshair } from 'lucide-react';

interface ComponentModalProps {
  component: ComponentDetail | null;
  onClose: () => void;
  onFocusCamera: (componentId: string) => void;
  theme?: AppTheme;
}

export const ComponentModal: React.FC<ComponentModalProps> = ({
  component,
  onClose,
  onFocusCamera,
  theme = 'cyber',
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

  const isLight = theme === 'studio';

  const handleClose = () => {
    soundManager.playMechanicalClick();
    onClose();
  };

  const handleFocus = () => {
    soundManager.playMechanicalClick();
    onFocusCamera(component.id);
  };

  return (
    <aside
      className={`fixed top-20 right-6 z-40 w-84 max-w-[90vw] rounded-2xl border p-5 backdrop-blur-2xl shadow-2xl transition-all duration-300 font-sans select-none animate-fadeIn ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
          : 'bg-black/90 border-white/10 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-inherit">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: component.highlightColor || '#4ade80' }}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
              {component.category}
            </span>
          </div>
          <h3 className="font-semibold text-sm sm:text-base tracking-tight truncate">
            {component.name}
          </h3>
        </div>

        <button
          onClick={handleClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-inherit opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close component details"
        >
          <X size={15} />
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs leading-relaxed opacity-75">
        {component.description}
      </p>

      {/* Key Specifications */}
      {component.specs && component.specs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-inherit space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider opacity-50 mb-1">
            Technical Specifications
          </div>
          <div className="space-y-1.5">
            {component.specs.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="opacity-60">{s.label}</span>
                <span className="font-mono text-[11px] font-medium opacity-90">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Camera Button */}
      <div className="mt-5 pt-3 border-t border-inherit">
        <button
          onClick={handleFocus}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium border transition-colors ${
            isLight
              ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-100'
          }`}
        >
          <Crosshair size={14} className="opacity-70" />
          <span>Focus 3D camera on this part</span>
        </button>
      </div>
    </aside>
  );
};
