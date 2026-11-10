import React, { useState } from 'react';
import { soundManager } from '../utils/soundEffects';
import {
  Activity,
  Cpu,
  Gauge,
  Zap,
  Sliders,
  Layers
} from 'lucide-react';

interface ArmouryCrateHUDProps {
  cpuTemp: number;
  gpuTemp: number;
  fanRPM: number;
  disassemblyPercent: number;
  onFanSpeedPresetChange: (rpm: number) => void;
  onSelectComponent: (componentId: string) => void;
  selectedComponentId: string | null;
}

export const ArmouryCrateHUD: React.FC<ArmouryCrateHUDProps> = ({
  cpuTemp,
  gpuTemp,
  fanRPM,
  disassemblyPercent,
  onFanSpeedPresetChange,
  onSelectComponent,
  selectedComponentId
}) => {
  const [activeProfile, setActiveProfile] = useState<'silent' | 'performance' | 'turbo'>('turbo');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleProfileChange = (profile: 'silent' | 'performance' | 'turbo') => {
    setActiveProfile(profile);
    soundManager.playMechanicalClick();
    if (profile === 'silent') {
      onFanSpeedPresetChange(2100);
      soundManager.playTurbineSpin(0.3);
    } else if (profile === 'performance') {
      onFanSpeedPresetChange(4200);
      soundManager.playTurbineSpin(0.6);
    } else {
      onFanSpeedPresetChange(5800);
      soundManager.playTurbineSpin(1.0);
    }
  };

  const handleComponentClick = (id: string) => {
    soundManager.playMechanicalClick();
    onSelectComponent(id);
  };

  // Cálculo del arco radial del tacómetro de ventiladores (0 a 6000 RPM)
  const maxRPM = 6000;
  const clampedRPM = Math.min(maxRPM, Math.max(0, fanRPM));
  const strokeDashoffset = 251.2 - (251.2 * clampedRPM) / maxRPM;

  const componentList = [
    { id: 'cooling', label: 'Arc Flow Fans™', tag: 'COOLING' },
    { id: 'motherboard', label: 'Ryzen 7 + RTX 4060', tag: 'SILICON' },
    { id: 'ram', label: '16GB DDR5 4800MHz', tag: 'MEMORY' },
    { id: 'ssd', label: '1TB PCIe 4.0 NVMe', tag: 'STORAGE' },
    { id: 'battery', label: 'Batería 90Wh Li-ion', tag: 'POWER' },
    { id: 'display', label: 'Panel IPS 144Hz', tag: 'DISPLAY' },
    { id: 'keyboard', label: 'Teclado Aura WASD', tag: 'DECK' },
    { id: 'chassis', label: 'Chasis Base Panal', tag: 'BASE' }
  ];

  return (
    <aside
      className={`fixed top-20 right-4 z-40 transition-all duration-300 ${
        isCollapsed ? 'translate-x-[calc(100%-42px)]' : 'translate-x-0'
      }`}
    >
      <div className="flex items-start">
        {/* Pestaña retráctil */}
        <button
          onClick={() => {
            soundManager.playMechanicalClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="bg-[#121824] hover:bg-[#1A2234] border-l border-y border-[#252D3D] text-[#FFB800] p-2.5 rounded-l-md shadow-lg flex flex-col items-center justify-center space-y-2 mt-4"
          title={isCollapsed ? 'Desplegar Armoury Crate HUD' : 'Plegar HUD'}
        >
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-['Orbitron'] font-bold tracking-widest [writing-mode:vertical-lr] rotate-180">
            {isCollapsed ? 'TELEMETRY' : 'MINIMIZE'}
          </span>
        </button>

        {/* Contenedor principal estilo Armoury Crate */}
        <div className="w-80 bg-[#0E131C]/92 backdrop-blur-md border border-[#252D3D] cut-corner-br shadow-2xl p-4 text-slate-200">
          {/* Cabecera del HUD */}
          <div className="flex items-center justify-between border-b border-[#202736] pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-[#FFB800] rotate-45 shadow-[0_0_8px_#FFB800]" />
              <h3 className="font-['Orbitron'] font-black text-xs tracking-wider text-white">
                ARMOURY CRATE // TELEMETRÍA
              </h3>
            </div>
            <div className="text-[11px] font-['JetBrains_Mono'] text-[#00E5FF] bg-[#121B28] px-2 py-0.5 rounded border border-[#00E5FF]/20">
              LIVE SENSORS
            </div>
          </div>

          {/* Tacómetro Radial de Turbinas y Temperaturas */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Tacómetro de RPM */}
            <div className="bg-[#121824] p-3 rounded border border-[#1E2736] flex flex-col items-center justify-center relative">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Círculo base */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1E2838"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Arco activo reactivo a las RPM */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#FFB800"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Gauge className="w-3.5 h-3.5 text-[#FFB800] mb-0.5" />
                  <span className="font-['Orbitron'] font-bold text-sm text-white">
                    {clampedRPM}
                  </span>
                  <span className="text-[9px] font-['JetBrains_Mono'] text-slate-400">RPM</span>
                </div>
              </div>
              <span className="text-[10px] font-['Rajdhani'] font-bold text-slate-300 mt-1 uppercase">
                Arc Flow Fans™
              </span>
            </div>

            {/* Temperaturas de silicio y potencia TGP */}
            <div className="bg-[#121824] p-3 rounded border border-[#1E2736] flex flex-col justify-between">
              {/* CPU */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#00E5FF]" /> CPU
                  </span>
                  <span className={`font-bold ${cpuTemp > 80 ? 'text-[#EF4444]' : 'text-slate-200'}`}>
                    {cpuTemp}°C
                  </span>
                </div>
                <div className="w-full bg-[#1A2230] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FFB800] transition-all duration-300"
                    style={{ width: `${Math.min(100, (cpuTemp / 100) * 100)}%` }}
                  />
                </div>
              </div>

              {/* GPU */}
              <div className="my-1.5">
                <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#FFB800]" /> GPU RTX
                  </span>
                  <span className={`font-bold ${gpuTemp > 75 ? 'text-[#EF4444]' : 'text-slate-200'}`}>
                    {gpuTemp}°C
                  </span>
                </div>
                <div className="w-full bg-[#1A2230] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-[#EF4444] transition-all duration-300"
                    style={{ width: `${Math.min(100, (gpuTemp / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {/* TGP */}
              <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] bg-[#0D121A] p-1 rounded border border-[#1D2533]">
                <span className="text-slate-400">MAX TGP:</span>
                <span className="text-[#FFB800] font-bold">140W DYN BOOST</span>
              </div>
            </div>
          </div>

          {/* Selector de perfiles de rendimiento */}
          <div className="mb-4">
            <div className="text-[10px] font-['JetBrains_Mono'] text-slate-400 mb-1.5 uppercase flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#FFB800]" /> Perfil Térmico
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#121824] p-1 rounded border border-[#1E2736]">
              {(['silent', 'performance', 'turbo'] as const).map(profile => (
                <button
                  key={profile}
                  onClick={() => handleProfileChange(profile)}
                  className={`py-1 text-[11px] font-['Rajdhani'] font-bold rounded uppercase transition-colors ${
                    activeProfile === profile
                      ? 'bg-[#FFB800] text-black shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {profile === 'silent' ? 'Silencio' : profile === 'performance' ? 'Rendimiento' : 'Turbo'}
                </button>
              ))}
            </div>
          </div>

          {/* Progreso de desmontaje cinemático */}
          <div className="mb-4 bg-[#121824] p-2.5 rounded border border-[#1E2736]">
            <div className="flex justify-between text-[11px] font-['JetBrains_Mono'] mb-1">
              <span className="text-slate-400">DESPIECE MECÁNICO</span>
              <span className="text-[#00E5FF] font-bold">{disassemblyPercent}%</span>
            </div>
            <div className="w-full bg-[#18202E] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FFB800] via-[#00E5FF] to-[#3B82F6] transition-all duration-200"
                style={{ width: `${disassemblyPercent}%` }}
              />
            </div>
          </div>

          {/* Acceso Rápido a Componentes / Capas */}
          <div>
            <div className="text-[10px] font-['JetBrains_Mono'] text-slate-400 mb-1.5 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#00E5FF]" /> Capas de Arquitectura
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {componentList.map(item => {
                const isSelected = selectedComponentId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleComponentClick(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-[#FFB800]/20 border-[#FFB800] text-white shadow-[0_0_10px_rgba(255,184,0,0.2)]'
                        : 'bg-[#121824]/60 border-[#1B2332] text-slate-300 hover:bg-[#1A2234] hover:border-[#2A3648]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-[#FFB800]' : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-['Rajdhani'] font-semibold">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-['JetBrains_Mono'] text-slate-400 bg-[#0C1017] px-1.5 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
