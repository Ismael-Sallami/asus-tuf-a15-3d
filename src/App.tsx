import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

import { SceneManager } from './three/SceneManager';
import { HeaderNav } from './components/HeaderNav';
import { AssemblyExplorer } from './components/AssemblyExplorer';
import { ComponentModal } from './components/ComponentModal';
import { SpecsModal } from './components/SpecsModal';
import { HotspotsOverlay, HotspotData } from './components/HotspotsOverlay';
import { TeardownController } from './components/TeardownController';

import { ViewMode, ComponentDetail, AppTheme } from './types/laptop';
import { COMPONENT_DETAILS } from './data/laptopSpecs';
import { soundManager } from './utils/soundEffects';

export const App: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Estados visuales y de control
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [theme, setTheme] = useState<AppTheme>('studio'); // Inicia en Studio Light (estilo Inside MacBook)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDetail | null>(null);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);

  // Despiece 0% a 100%
  const [disassemblyPercent, setDisassemblyPercent] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayTweenRef = useRef<gsap.core.Tween | null>(null);

  // Hotspots 3D y vista de cámara
  const [hotspots, setHotspots] = useState<Record<string, HotspotData>>({});
  const [activeCameraPreset, setActiveCameraPreset] = useState<'perspective' | 'top' | 'cooling' | 'front' | 'bottom'>('perspective');

  // Visibilidad por sistema mayor
  const [systemVisibility, setSystemVisibility] = useState<Record<string, boolean>>({
    enclosure: true,
    cooling: true,
    computing: true,
    power: true,
    display: true,
  });

  // Bucle de proyección 3D a 2D para hotspots
  useEffect(() => {
    let animId: number;
    const updateHotspotsLoop = () => {
      if (sceneManagerRef.current && disassemblyPercent >= 10) {
        const coords = sceneManagerRef.current.getHotspotsScreenPositions();
        setHotspots(coords);
      }
      animId = requestAnimationFrame(updateHotspotsLoop);
    };
    animId = requestAnimationFrame(updateHotspotsLoop);
    return () => cancelAnimationFrame(animId);
  }, [disassemblyPercent]);

  // Inicialización de la escena Three.js
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const manager = new SceneManager(canvasContainerRef.current, {
      onComponentSelect: (componentId) => {
        if (!componentId) return;
        soundManager.playMechanicalClick();
        const detail = COMPONENT_DETAILS[componentId] || null;
        if (detail) {
          setSelectedComponent(detail);
        }
      },
    });

    sceneManagerRef.current = manager;
    manager.setTheme('studio');

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Actualización del progreso de despiece en el motor 3D
  const handlePercentChange = useCallback((percent: number) => {
    if (autoPlayTweenRef.current) {
      autoPlayTweenRef.current.kill();
      autoPlayTweenRef.current = null;
      setIsAutoPlaying(false);
    }
    setDisassemblyPercent(percent);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setExplodedProgress(percent / 100);
    }
  }, []);

  // Autoplay / recorrido de desmontaje de 20s
  const handleToggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      if (autoPlayTweenRef.current) {
        autoPlayTweenRef.current.kill();
        autoPlayTweenRef.current = null;
      }
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      const targetPercent = disassemblyPercent >= 98 ? 0 : 100;
      const distance = Math.abs(targetPercent - disassemblyPercent);
      const duration = Math.max(4, (distance / 100) * 18);

      const obj = { val: disassemblyPercent };
      autoPlayTweenRef.current = gsap.to(obj, {
        val: targetPercent,
        duration,
        ease: 'power1.inOut',
        onUpdate: () => {
          const p = Math.round(obj.val);
          setDisassemblyPercent(p);
          if (sceneManagerRef.current) {
            sceneManagerRef.current.setExplodedProgress(p / 100);
          }
        },
        onComplete: () => {
          setIsAutoPlaying(false);
          autoPlayTweenRef.current = null;
        },
      });
    }
  }, [isAutoPlaying, disassemblyPercent]);

  // Cambio de tema: Studio Light, Cyber Dark o Blueprint CAD
  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setTheme(newTheme);
    }
  };

  // Cambio de modo de vista: Normal, Térmico (FLIR) o Rayos X
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setViewMode(mode);
    }
  };

  // Alternar visibilidad de un sistema mayor
  const handleToggleSystem = (system: 'enclosure' | 'cooling' | 'computing' | 'power' | 'display') => {
    setSystemVisibility((prev) => {
      const nextVal = !prev[system];
      if (sceneManagerRef.current) {
        sceneManagerRef.current.setSystemVisibility(system, nextVal);
      }
      return { ...prev, [system]: nextVal };
    });
  };

  // Selección de componente desde la barra lateral o hotspot
  const handleSelectComponent = (componentId: string) => {
    const detail = COMPONENT_DETAILS[componentId] || null;
    setSelectedComponent(detail);

    // Ajustar cámara para encuadrar la pieza
    if (sceneManagerRef.current) {
      const targetMap: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
        cooling: { pos: [-14, 18, 14], target: [0, 2, -1] },
        motherboard: { pos: [0, 16, 12], target: [0, 0, -1] },
        ram: { pos: [-2, 10, 8], target: [-0.2, 0.4, -0.5] },
        ssd: { pos: [-10, 12, 10], target: [-4.6, 0.3, 0.2] },
        battery: { pos: [0, 12, 18], target: [0, 0, 2.7] },
        display: { pos: [0, 10, 22], target: [0, 4, 0] },
        chassis: { pos: [14, -6, 16], target: [0, -1, 0] },
      };
      const cfg = targetMap[componentId] || { pos: [18, 14, 26], target: [0, 0, 0] };
      sceneManagerRef.current.setCameraPosition(cfg.pos, cfg.target, 1.0);
    }
  };

  // Presets de cámara
  const handleSelectCameraPreset = (preset: 'perspective' | 'top' | 'cooling' | 'front' | 'bottom') => {
    setActiveCameraPreset(preset);
    if (!sceneManagerRef.current) return;

    switch (preset) {
      case 'perspective':
        sceneManagerRef.current.setCameraPosition([18, 14, 26], [0, 0, 0], 1.0);
        break;
      case 'top':
        sceneManagerRef.current.setCameraPosition([0, 36, 0.1], [0, 0, 0], 1.0);
        break;
      case 'front':
        sceneManagerRef.current.setCameraPosition([0, 6, 32], [0, 2, 0], 1.0);
        break;
      case 'bottom':
        sceneManagerRef.current.setCameraPosition([0, -32, 0.1], [0, 0, 0], 1.0);
        break;
      case 'cooling':
        sceneManagerRef.current.setCameraPosition([-16, 22, 16], [0, 2, -1], 1.0);
        break;
    }
  };

  const handleResetCamera = () => {
    handleSelectCameraPreset('perspective');
  };

  const isLight = theme === 'studio';

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden font-sans select-none transition-colors duration-500 ${
        isLight ? 'bg-[#F5F5F7] text-slate-800' : 'bg-[#0B0E14] text-slate-100'
      }`}
    >
      {/* Canvas 3D a pantalla completa */}
      <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Navegación superior estilo Inside MacBook */}
      <HeaderNav
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = soundManager.toggleSound();
          setSoundEnabled(next);
        }}
        theme={theme}
        onThemeChange={handleThemeChange}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={handleToggleAutoPlay}
        onOpenSpecs={() => setIsSpecsOpen(true)}
      />

      {/* Hero Headline en la esquina superior izquierda (Inside MacBook style) */}
      <div className="fixed left-6 top-20 z-20 pointer-events-none max-w-sm hidden lg:block">
        <span className="text-[10px] font-mono tracking-widest uppercase opacity-50 block mb-0.5">
          Engineered, layer by layer
        </span>
        <h1 className="text-xl font-bold tracking-tight">ASUS TUF Gaming A15</h1>
        <p className="text-[11px] opacity-60 font-mono mt-0.5">
          15.6-inch &nbsp;/&nbsp; 2026 &nbsp;/&nbsp; Ryzen 9 + RTX 4070
        </p>
      </div>

      {/* Explorador de Ensamblaje en la barra lateral izquierda */}
      <AssemblyExplorer
        theme={theme}
        systemVisibility={systemVisibility}
        onToggleSystem={handleToggleSystem}
        onSelectComponent={handleSelectComponent}
      />

      {/* Marcadores 3D flotantes sutiles (visibles solo durante despiece) */}
      <HotspotsOverlay
        hotspots={hotspots}
        isVisible={true}
        disassemblyPercent={disassemblyPercent}
        onSelectComponent={handleSelectComponent}
        activeComponentId={selectedComponent?.id || null}
        theme={theme}
      />

      {/* Ficha técnica flotante lateral al seleccionar un componente */}
      <ComponentModal
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
        onFocusCamera={(id) => handleSelectComponent(id)}
        theme={theme}
      />

      {/* Modal de Especificaciones Generales */}
      <SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        theme={theme}
      />

      {/* Controlador de Desmontaje en la parte inferior */}
      <TeardownController
        disassemblyPercent={disassemblyPercent}
        onPercentChange={handlePercentChange}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={handleToggleAutoPlay}
        activeCameraPreset={activeCameraPreset}
        onSelectCameraPreset={handleSelectCameraPreset}
        onResetCamera={handleResetCamera}
        theme={theme}
      />

      {/* Pie de página sutil con pistas de interacción */}
      <div className="fixed bottom-3 left-6 z-20 pointer-events-none text-[11px] font-mono opacity-40 hidden sm:block">
        Drag to rotate &nbsp;·&nbsp; Scroll to zoom
      </div>

      <div className="fixed bottom-3 right-6 z-20 pointer-events-none text-[11px] font-mono opacity-40 hidden sm:block">
        ASUS TUF FA507NV Architecture
      </div>
    </div>
  );
};
