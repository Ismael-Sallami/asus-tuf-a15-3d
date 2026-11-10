import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SceneManager } from './three/SceneManager';
import { HeaderNav } from './components/HeaderNav';
import { ArmouryCrateHUD } from './components/ArmouryCrateHUD';
import { ComponentModal } from './components/ComponentModal';
import { ScrollStorySections } from './components/ScrollStorySections';

import { ViewMode, ComponentDetail } from './types/laptop';
import { COMPONENT_DETAILS, DISASSEMBLY_PHASES } from './data/laptopSpecs';
import { soundManager } from './utils/soundEffects';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Estados de visualización y control
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDetail | null>(null);

  // Telemetría en vivo
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [disassemblyPercent, setDisassemblyPercent] = useState<number>(0);
  const [cpuTemp, setCpuTemp] = useState<number>(48);
  const [gpuTemp, setGpuTemp] = useState<number>(44);
  const [fanRPM, setFanRPM] = useState<number>(2400);

  // Inicialización del visor Three.js y configuración de ScrollTrigger
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Crear instancia del gestor de escena Three.js
    const manager = new SceneManager(canvasContainerRef.current, {
      onComponentSelect: (componentId) => {
        if (!componentId) return;
        soundManager.playMechanicalClick();
        soundManager.playFuturisticHum();
        const detail = resolveComponentDetail(componentId);
        if (detail) {
          setSelectedComponent(detail);
        }
      },
      onHoverChange: () => {
        // En modo normal, no forzar cambio global si no es clic
      }
    });

    sceneManagerRef.current = manager;

    // Configurar ScrollTrigger maestro enlazado al scroll vertical de la ventana
    const totalPhases = DISASSEMBLY_PHASES.length;
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-story-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress; // 0 a 1
        const percent = Math.round(progress * 100);
        setDisassemblyPercent(percent);

        // Actualizar despiece 3D en el modelo físico
        manager.setExplodedProgress(progress);

        // Determinar fase activa
        const rawPhase = progress * (totalPhases - 1);
        const phaseIdx = Math.min(totalPhases - 1, Math.floor(rawPhase));
        setCurrentPhaseIndex(phaseIdx);

        // Si no está en modo de inspección libre, mover cámara cinemática
        if (!manager.getInspectMode()) {
          const currentPhase = DISASSEMBLY_PHASES[phaseIdx];
          const nextPhase = DISASSEMBLY_PHASES[Math.min(totalPhases - 1, phaseIdx + 1)];
          const phaseProgress = rawPhase - phaseIdx;

          // Interpolación suave entre posiciones y objetivos de cámara
          const camX = currentPhase.cameraPosition[0] + (nextPhase.cameraPosition[0] - currentPhase.cameraPosition[0]) * phaseProgress;
          const camY = currentPhase.cameraPosition[1] + (nextPhase.cameraPosition[1] - currentPhase.cameraPosition[1]) * phaseProgress;
          const camZ = currentPhase.cameraPosition[2] + (nextPhase.cameraPosition[2] - currentPhase.cameraPosition[2]) * phaseProgress;

          const targetX = currentPhase.cameraTarget[0] + (nextPhase.cameraTarget[0] - currentPhase.cameraTarget[0]) * phaseProgress;
          const targetY = currentPhase.cameraTarget[1] + (nextPhase.cameraTarget[1] - currentPhase.cameraTarget[1]) * phaseProgress;
          const targetZ = currentPhase.cameraTarget[2] + (nextPhase.cameraTarget[2] - currentPhase.cameraTarget[2]) * phaseProgress;

          manager.setCameraPosition([camX, camY, camZ], [targetX, targetY, targetZ], 0.2);
        }

        // Variación dinámica de telemetría térmica simulada
        // A mayor apertura, aumenta la eficacia de refrigeración
        const dynamicCpu = Math.round(48 + Math.sin(progress * Math.PI) * 36);
        const dynamicGpu = Math.round(44 + Math.sin(progress * Math.PI) * 38);
        const dynamicRPM = Math.round(2400 + progress * 3200);

        setCpuTemp(dynamicCpu);
        setGpuTemp(dynamicGpu);
        setFanRPM(dynamicRPM);
        manager.setFanRPM(dynamicRPM);
      }
    });

    return () => {
      trigger.kill();
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Mapeo seguro de identificadores de componentes a detalles técnicos
  const resolveComponentDetail = (id: string): ComponentDetail | null => {
    if (COMPONENT_DETAILS[id]) return COMPONENT_DETAILS[id];
    if (id === 'exterior') return COMPONENT_DETAILS['chassis'];
    if (id === 'modules') return COMPONENT_DETAILS['ram'];
    return null;
  };

  // Cambio de modo de visualización: Normal, Térmico, Rayos X
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setViewMode(mode);
    }
  };

  // Alternar modo de inspección 360°
  const handleToggleInspect = () => {
    const nextState = !isInspecting;
    setIsInspecting(nextState);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setInspectMode(nextState);
    }
  };

  // Toggle de audio
  const handleToggleSound = () => {
    const active = soundManager.toggleSound();
    setSoundEnabled(active);
  };

  // Ajuste manual de perfil de ventilador desde el HUD
  const handleFanSpeedPresetChange = (rpm: number) => {
    setFanRPM(rpm);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setFanRPM(rpm);
    }
  };

  // Selección de componente desde lista o botones
  const handleSelectComponent = (componentId: string) => {
    const detail = resolveComponentDetail(componentId);
    if (detail) {
      setSelectedComponent(detail);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.highlightComponent(detail.id);
      }
    }
  };

  // Enfocar cámara 3D sobre la pieza seleccionada
  const handleFocusCamera = (componentId: string) => {
    if (!sceneManagerRef.current) return;

    // Buscar una posición conveniente para el componente
    const targetMap: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
      cooling: { pos: [-14, 18, 14], target: [0, 2, -1] },
      motherboard: { pos: [0, 16, 12], target: [0, 0, -1] },
      ram: { pos: [-2, 10, 8], target: [-0.2, 0.4, -0.5] },
      ssd: { pos: [-10, 12, 10], target: [-4.6, 0.3, 0.2] },
      battery: { pos: [0, 12, 18], target: [0, 0, 2.7] },
      display: { pos: [0, 10, 22], target: [0, 4, 0] },
      keyboard: { pos: [0, 20, 10], target: [0, 0, 0] },
      chassis: { pos: [14, -6, 16], target: [0, -1, 0] }
    };

    const config = targetMap[componentId] || { pos: [18, 14, 26], target: [0, 0, 0] };
    sceneManagerRef.current.setCameraPosition(config.pos, config.target, 1.2);
    setSelectedComponent(null);
  };

  // Salto directo a una fase de desmontaje
  const handleJumpToPhase = (phaseIndex: number) => {
    const targetSection = document.getElementById(`phase-section-${phaseIndex}`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentPhaseTitle = DISASSEMBLY_PHASES[currentPhaseIndex]?.title || 'ASUS TUF A15';

  return (
    <div className="relative min-h-screen bg-[#080A0D] text-slate-100 font-['Rajdhani'] selection:bg-[#FFB800] selection:text-black">
      {/* Barra de Navegación Superior Fija */}
      <HeaderNav
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isInspecting={isInspecting}
        onToggleInspect={handleToggleInspect}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentPhaseName={currentPhaseTitle}
      />

      {/* Contenedor del Viewport 3D Three.js Fijo de Fondo */}
      <div
        ref={canvasContainerRef}
        className="fixed inset-0 z-0 w-full h-full pointer-events-auto"
      />

      {/* Panel Lateral de Telemetría Armoury Crate HUD */}
      <ArmouryCrateHUD
        cpuTemp={cpuTemp}
        gpuTemp={gpuTemp}
        fanRPM={fanRPM}
        disassemblyPercent={disassemblyPercent}
        onFanSpeedPresetChange={handleFanSpeedPresetChange}
        onSelectComponent={handleSelectComponent}
        selectedComponentId={selectedComponent?.id || null}
      />

      {/* Modal Desplegable de Especificaciones Técnicas Militares */}
      <ComponentModal
        component={selectedComponent}
        onClose={() => {
          setSelectedComponent(null);
          if (sceneManagerRef.current) {
            sceneManagerRef.current.highlightComponent(null);
          }
        }}
        onFocusCamera={handleFocusCamera}
      />

      {/* Contenedor de Secciones Narrativas con ScrollTrigger */}
      <main id="scroll-story-container" className="relative z-10">
        <ScrollStorySections
          currentPhaseIndex={currentPhaseIndex}
          onSelectComponent={handleSelectComponent}
          onJumpToPhase={handleJumpToPhase}
        />
      </main>

      {/* Pie de página sutil con estado de ingeniería y atajos */}
      <footer className="fixed bottom-3 left-6 z-30 hidden sm:flex items-center space-x-3 text-[11px] font-['JetBrains_Mono'] text-slate-400 bg-[#0B0E14]/80 backdrop-blur px-3 py-1.5 rounded border border-[#1E2736]">
        <div className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
        <span>THREE.JS R170 // ACES FILMIC // WEB AUDIO API</span>
        <span className="text-[#2A364A]">|</span>
        <span className="text-slate-300">CLIC SOBRE PIEZAS PARA VER INGENIERÍA</span>
      </footer>
    </div>
  );
};
