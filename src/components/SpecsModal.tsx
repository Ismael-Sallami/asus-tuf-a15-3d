import React, { useEffect } from 'react';
import { X, Cpu, Zap, Wind, Monitor, HardDrive, Shield } from 'lucide-react';
import { LAPTOP_SPECS } from '../data/laptopSpecs';
import { AppTheme } from '../types/laptop';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({
  isOpen,
  onClose,
  theme = 'cyber',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLight = theme === 'studio';

  const specsList = [
    { icon: Cpu, label: 'Processor', value: LAPTOP_SPECS.cpu },
    { icon: Zap, label: 'Graphics', value: LAPTOP_SPECS.gpu },
    { icon: Wind, label: 'Cooling', value: LAPTOP_SPECS.cooling },
    { icon: Monitor, label: 'Display', value: LAPTOP_SPECS.display },
    { icon: HardDrive, label: 'Memory & Storage', value: `${LAPTOP_SPECS.ram} · ${LAPTOP_SPECS.storage}` },
    { icon: Shield, label: 'Battery & Chassis', value: `${LAPTOP_SPECS.battery} · ${LAPTOP_SPECS.militaryStandard}` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl rounded-2xl border p-6 backdrop-blur-2xl shadow-2xl transition-all ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800'
            : 'bg-black/90 border-white/10 text-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div>
            <h2 className="font-semibold text-lg tracking-tight">ASUS TUF Gaming A15</h2>
            <p className="text-xs opacity-50 font-mono">FA507NV // Engineering Architecture</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-inherit opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          {specsList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3.5 rounded-xl p-3 border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-inherit opacity-70">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-50">
                    {item.label}
                  </div>
                  <div className="text-xs mt-0.5 leading-relaxed font-medium">
                    {item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
