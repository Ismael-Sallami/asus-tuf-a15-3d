import React, { useState } from 'react';
import { Search, Check, Layers, Cpu, Wind, Zap, Monitor, Box } from 'lucide-react';
import { AppTheme } from '../types/laptop';

export interface SystemGroup {
  id: 'enclosure' | 'cooling' | 'computing' | 'power' | 'display';
  name: string;
  nameEs: string;
  count: number;
  color: string;
  icon: React.ElementType;
}

export interface AssemblyComponentItem {
  id: string;
  name: string;
  system: 'enclosure' | 'cooling' | 'computing' | 'power' | 'display';
  partCount: number;
  highlightCategory?: string;
}

const SYSTEMS: SystemGroup[] = [
  { id: 'enclosure', name: 'Enclosure', nameEs: 'Chasis y Carcasa', count: 6, color: '#94a3b8', icon: Box },
  { id: 'cooling', name: 'Cooling', nameEs: 'Refrigeración', count: 4, color: '#38bdf8', icon: Wind },
  { id: 'computing', name: 'Computing', nameEs: 'Silicio y Memoria', count: 4, color: '#4ade80', icon: Cpu },
  { id: 'power', name: 'Power', nameEs: 'Alimentación', count: 2, color: '#f59e0b', icon: Zap },
  { id: 'display', name: 'Display', nameEs: 'Pantalla', count: 2, color: '#a855f7', icon: Monitor },
];

const COMPONENTS: AssemblyComponentItem[] = [
  { id: 'c-cover', name: 'Top case & Keyboard (C-Cover)', system: 'enclosure', partCount: 1, highlightCategory: 'chassis' },
  { id: 'd-cover', name: 'Bottom cover & Honeycomb (D-Cover)', system: 'enclosure', partCount: 1, highlightCategory: 'chassis' },
  { id: 'arc-flow-fans', name: 'Dual Arc Flow Fans (84-blade)', system: 'cooling', partCount: 2, highlightCategory: 'cooling' },
  { id: 'heatpipes', name: 'Copper Heatpipe Thermal Block', system: 'cooling', partCount: 4, highlightCategory: 'cooling' },
  { id: 'cpu', name: 'AMD Ryzen 9 7940HS (Zen 4, 4nm)', system: 'computing', partCount: 1, highlightCategory: 'motherboard' },
  { id: 'gpu', name: 'NVIDIA GeForce RTX 4070 Laptop (140W)', system: 'computing', partCount: 1, highlightCategory: 'motherboard' },
  { id: 'ram', name: 'DDR5 4800MHz SO-DIMM Dual Channel', system: 'computing', partCount: 2, highlightCategory: 'motherboard' },
  { id: 'ssd', name: 'PCIe 4.0 NVMe M.2 2280 SSD', system: 'computing', partCount: 2, highlightCategory: 'motherboard' },
  { id: 'battery', name: '90Wh 4-Cell Li-Ion Battery Pack', system: 'power', partCount: 1, highlightCategory: 'battery' },
  { id: 'display-panel', name: '15.6" FHD 144Hz IPS Anti-Glare Panel', system: 'display', partCount: 1, highlightCategory: 'display' },
  { id: 'hinges', name: 'Reinforced Dual Zinc-Alloy Hinges', system: 'display', partCount: 2, highlightCategory: 'display' },
];

interface AssemblyExplorerProps {
  theme: AppTheme;
  systemVisibility: Record<string, boolean>;
  onToggleSystem: (system: 'enclosure' | 'cooling' | 'computing' | 'power' | 'display') => void;
  onSelectComponent: (componentId: string) => void;
}

export const AssemblyExplorer: React.FC<AssemblyExplorerProps> = ({
  theme,
  systemVisibility,
  onToggleSystem,
  onSelectComponent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredComponents = COMPONENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.system.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLight = theme === 'studio';

  return (
    <aside
      className={`fixed left-6 top-48 z-30 w-72 transition-all duration-300 font-sans select-none ${
        isLight
          ? 'bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.06)]'
          : 'bg-black/80 border-white/10 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
      } rounded-2xl border backdrop-blur-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-inherit px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">The assembly.</h2>
          <p className="text-xs text-cool-400 opacity-60">18 assemblies · 5 core systems</p>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-inherit text-xs opacity-60 hover:opacity-100 transition-opacity"
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <Layers size={14} />
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-270px)] overflow-y-auto">
          {/* SYSTEMS section */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider opacity-50 px-1 mb-2.5">
              <span>Systems</span>
              <span>Visibility</span>
            </div>
            <div className="space-y-1">
              {SYSTEMS.map((sys) => {
                const isVisible = systemVisibility[sys.id] !== false;
                return (
                  <div
                    key={sys.id}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                      isLight ? 'hover:bg-slate-100/80' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: sys.color }}
                      />
                      <span className="text-xs font-medium">{sys.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-40 font-mono">{sys.count}</span>
                      <button
                        type="button"
                        onClick={() => onToggleSystem(sys.id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                          isVisible
                            ? isLight
                              ? 'border-slate-800 bg-slate-800 text-white'
                              : 'border-accent bg-accent text-black'
                            : 'border-slate-400/40 bg-transparent opacity-40'
                        }`}
                        aria-label={`Toggle visibility of ${sys.name}`}
                      >
                        {isVisible && <Check size={11} strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COMPONENTS search and list */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider opacity-50 px-1 mb-2">
              <span>Components</span>
              <span className="font-mono text-[10px] rounded-full border border-inherit px-1.5 py-0.2">
                {filteredComponents.length}
              </span>
            </div>

            <div className="relative mb-2.5">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Find a component /"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-lg border border-inherit pl-8 pr-3 py-1.5 text-xs outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 focus:bg-white focus:border-slate-400'
                    : 'bg-white/5 focus:bg-white/10 focus:border-accent/40'
                }`}
              />
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {filteredComponents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectComponent(c.highlightCategory || c.id)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors group ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="truncate opacity-80 group-hover:opacity-100">
                    {c.name}
                  </span>
                  <span className="text-[10px] opacity-40 font-mono ml-2 shrink-0">
                    ×{c.partCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
