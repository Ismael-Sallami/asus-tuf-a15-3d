import React from 'react';
import { ViewMode, AppTheme } from '../types/laptop';
import { soundManager } from '../utils/soundEffects';
import { Volume2, VolumeX, Sun, Moon, Terminal, Play, Pause, Info } from 'lucide-react';

interface HeaderNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  onOpenSpecs: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  viewMode,
  onViewModeChange,
  soundEnabled,
  onToggleSound,
  theme,
  onThemeChange,
  isAutoPlaying,
  onToggleAutoPlay,
  onOpenSpecs,
}) => {
  const isLight = theme === 'studio';

  const handleThemeChange = (newTheme: AppTheme) => {
    soundManager.playLayerSwitch();
    onThemeChange(newTheme);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-16 transition-colors duration-300 px-6 flex items-center justify-between backdrop-blur-xl border-b select-none ${
        isLight
          ? 'bg-white/80 border-slate-200/80 text-slate-800'
          : 'bg-black/75 border-white/10 text-slate-200'
      }`}
    >
      {/* Left: Inside Object Explorer Brand */}
      <div className="flex items-center gap-3">
        {/* Minimal Stacked Layers Icon */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            isLight ? 'border-slate-300 bg-slate-100 text-slate-900' : 'border-white/15 bg-white/5 text-ivory'
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="flex items-baseline gap-2.5">
          <span className="font-display font-semibold text-base tracking-tight">inside.</span>
          <span className="text-[11px] font-mono tracking-wider opacity-50 uppercase hidden sm:inline">
            An Object Explorer &nbsp;/&nbsp; ASUS TUF Gaming A15
          </span>
        </div>
      </div>

      {/* Right: Actions, Theme Toggle & Teardown CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* View Mode: Normal vs Thermal vs X-Ray */}
        <div
          className={`hidden xl:flex items-center p-0.5 rounded-lg border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}
        >
          <button
            onClick={() => onViewModeChange('normal')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'normal'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/20 text-white'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => onViewModeChange('thermal')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'thermal'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            FLIR Thermal
          </button>
          <button
            onClick={() => onViewModeChange('xray')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'xray'
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            X-Ray
          </button>
        </div>

        {/* Theme Segmented Control */}
        <div
          className={`flex items-center p-0.5 rounded-lg border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}
        >
          <button
            onClick={() => handleThemeChange('studio')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              theme === 'studio'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/15 text-white'
                : 'opacity-60 hover:opacity-100'
            }`}
            title="Studio Light Mode"
          >
            <Sun size={13} />
            <span className="hidden md:inline">Studio</span>
          </button>

          <button
            onClick={() => handleThemeChange('cyber')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              theme === 'cyber'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/20 text-white'
                : 'opacity-60 hover:opacity-100'
            }`}
            title="Cyber Dark Mode"
          >
            <Moon size={13} />
            <span className="hidden md:inline">Dark</span>
          </button>

          <button
            onClick={() => handleThemeChange('blueprint')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
              theme === 'blueprint'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                : 'opacity-60 hover:opacity-100'
            }`}
            title="CAD Blueprint Mode"
          >
            <Terminal size={13} />
            <span className="hidden md:inline">CAD</span>
          </button>
        </div>

        {/* Specs Dialog Trigger */}
        <button
          onClick={onOpenSpecs}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            isLight
              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
          }`}
        >
          <Info size={14} className="opacity-60" />
          <span className="hidden sm:inline">Specs sheet</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
            isLight
              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
          }`}
          title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="opacity-50" />}
        </button>

        {/* Primary CTA: Watch Teardown 20s (Matching Inside MacBook) */}
        <button
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            isAutoPlaying
              ? 'bg-amber-500 text-black shadow-md font-semibold'
              : isLight
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
              : 'bg-white text-black hover:bg-white/90 shadow-md font-medium'
          }`}
        >
          {isAutoPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
          <span>{isAutoPlaying ? 'Pause' : 'Watch the teardown'}</span>
          <span className="font-mono text-[10px] opacity-70">20s</span>
        </button>
      </div>
    </header>
  );
};
