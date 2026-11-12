import React from 'react';
import { Play, Pause, Layers, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { AppTheme } from '../types/laptop';

interface TeardownControllerProps {
  disassemblyPercent: number;
  onPercentChange: (percent: number) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  activeCameraPreset: 'perspective' | 'top' | 'cooling' | 'front' | 'bottom';
  onSelectCameraPreset: (preset: 'perspective' | 'top' | 'cooling' | 'front' | 'bottom') => void;
  onResetCamera: () => void;
  theme?: AppTheme;
}

export const TeardownController: React.FC<TeardownControllerProps> = ({
  disassemblyPercent,
  onPercentChange,
  isAutoPlaying,
  onToggleAutoPlay,
  activeCameraPreset,
  onSelectCameraPreset,
  onResetCamera,
  theme = 'cyber',
}) => {
  const isLight = theme === 'studio';

  const cameraPresets: Array<{ id: 'perspective' | 'top' | 'cooling' | 'front' | 'bottom'; label: string }> = [
    { id: 'perspective', label: 'Perspective' },
    { id: 'top', label: 'Top' },
    { id: 'front', label: 'Front' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'cooling', label: 'Cooling' },
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-2xl pointer-events-auto flex flex-col items-center gap-3 select-none">
      {/* Floating Camera Presets Pill */}
      <div
        className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs backdrop-blur-xl shadow-lg transition-colors ${
          isLight
            ? 'bg-white/80 border-slate-200 text-slate-600'
            : 'bg-black/70 border-white/10 text-slate-300'
        }`}
      >
        {cameraPresets.map((preset) => {
          const isActive = activeCameraPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                soundManager.playLayerSwitch();
                onSelectCameraPreset(preset.id);
              }}
              className={`rounded-full px-3 py-1 font-medium text-xs transition-all ${
                isActive
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white/20 text-white shadow-sm'
                  : 'hover:text-ivory opacity-70 hover:opacity-100'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Main Teardown Controller Card (Inside MacBook style) */}
      <div
        className={`w-full rounded-2xl border p-4 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
          isLight
            ? 'bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
            : 'bg-black/85 border-white/10 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Left Icon + Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/5 text-slate-200'
              }`}
            >
              <Layers size={18} />
            </div>
            <div className="hidden sm:block">
              <h3 className="text-xs font-semibold tracking-tight">Take it apart</h3>
              <p className="text-[11px] opacity-50">One layer at a time.</p>
            </div>
          </div>

          {/* Center: Clean Range Slider */}
          <div className="flex-1 px-2">
            <div className="flex items-center justify-between text-[11px] font-mono opacity-60 mb-1.5">
              <span>Assembled</span>
              <span className="font-semibold opacity-100">{disassemblyPercent}%</span>
              <span>All parts ↗</span>
            </div>

            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={disassemblyPercent}
                onChange={handleSliderChange}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-300 dark:bg-white/20 accent-accent"
              />
            </div>

            {/* Subtle tick marks */}
            <div className="flex justify-between px-1 mt-1 opacity-20">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-1 w-[1px] bg-current" />
              ))}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleAutoPlay}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                isAutoPlaying
                  ? isLight
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-accent bg-accent text-black'
                  : isLight
                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
              }`}
              title={isAutoPlaying ? 'Pause teardown' : 'Play teardown'}
              aria-label={isAutoPlaying ? 'Pause teardown' : 'Play teardown'}
            >
              {isAutoPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>

            <button
              onClick={onResetCamera}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                isLight
                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
              }`}
              title="Reset camera view"
              aria-label="Reset camera view"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
