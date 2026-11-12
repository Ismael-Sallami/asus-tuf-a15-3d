import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Cpu,
  Eye,
  Focus,
  HelpCircle,
  Layers,
  Maximize2,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sun,
  Moon,
  Terminal,
  X
} from 'lucide-react';

import { SceneManager } from './three/SceneManager';
import {
  BOARD_GROUPS,
  PARTS,
  SYSTEMS,
  getLiveStageInfo,
  getPartById
} from './data/laptopSpecs';
import { AppTheme, CameraPreset, SystemId, ViewMode } from './types/laptop';
import { soundManager } from './utils/soundEffects';

function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

/**
 * Coreografía de 24 segundos para el botón "Ver desmontaje 24s" (inspirado en Inside MacBook)
 */
function getDemoKeyframe(sec: number) {
  const t = Math.max(0, Math.min(24, sec));
  const boardIdx = Math.min(7, Math.max(0, Math.floor((t - 12) / 1.5)));

  const captions = [
    'El procesador AMD Ryzen 9 7940HS (Zen 4, 4 nm).',
    'GPU dedicada NVIDIA GeForce RTX 4070 (140W TGP).',
    'Memoria DDR5-4800 en doble canal ampliable.',
    'Almacenamiento SSD NVMe PCIe 4.0 de alta velocidad.',
    'Regulación eléctrica VRM Digi+ de 12+2 fases.',
    'Conmutador MUX físico hacia el panel 144Hz.',
    'Interfaces USB4 (40 Gbps), HDMI 2.1 y Wi-Fi 6E.',
    'Buses de cobre de impedancia controlada en 8 capas.'
  ];

  return {
    lid: 0.04 + smoothstep((t - 0.8) / 2.4) * 1.905,
    explosion: smoothstep((t - 3.5) / 5.5),
    angle: 0.62 + Math.sin((t / 24) * Math.PI) * 0.18,
    selectedId:
      t >= 8.8 && t < 9.8
        ? 'left-fan'
        : t >= 9.8 && t < 10.8
          ? 'right-fan'
          : t >= 10.8 && t < 12
            ? 'logic-board'
            : null,
    board: t >= 12,
    boardProgress: smoothstep((t - 12) / 11),
    boardSelectedId: BOARD_GROUPS[boardIdx].id,
    caption:
      t < 3
        ? 'ASUS TUF Gaming A15 · Ryzen 9 + RTX 4070.'
        : t < 6
          ? 'Bajo el chasis blindado MIL-STD-810H.'
          : t < 8.8
            ? '16 ensamblajes modulares. Un sistema integrado.'
            : t < 9.8
              ? 'Ventilador Arc Flow izquierdo · 84 aspas LCP.'
              : t < 10.8
                ? 'Ventilador Arc Flow derecho · Flujo simétrico.'
                : t < 12
                  ? 'Todas las piezas desplegadas en bandeja.'
                  : captions[boardIdx]
  };
}

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Estado principal del ensamblaje
  const [enabledSystems, setEnabledSystems] = useState<SystemId[]>(() =>
    SYSTEMS.map((s) => s.id)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const [explosion, setExplosion] = useState<number>(0);

  // Modo estudio de placa base (Explore logic board)
  const [boardMode, setBoardMode] = useState<boolean>(false);
  const [boardProgress, setBoardProgress] = useState<number>(0);
  const [boardSelectedId, setBoardSelectedId] = useState<string>('board-soc');

  // Búsqueda, vistas, zoom y temas
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cameraView, setCameraView] = useState<CameraPreset>('perspective');
  const [zoom, setZoom] = useState<number>(1);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Tema visual y modo de renderizado
  const [theme, setTheme] = useState<AppTheme>('studio');
  const [viewMode, setViewMode] = useState<ViewMode>('normal');

  // Demo guiada de 24 segundos
  const [demoPlaying, setDemoPlaying] = useState<boolean>(false);
  const [demoSeconds, setDemoSeconds] = useState<number>(0);

  // Coordenadas 2D proyectadas para pines flotantes 3D
  const [partPin, setPartPin] = useState<{
    x: number;
    y: number;
    name: string;
    visible: boolean;
  } | null>(null);
  const [boardPins, setBoardPins] = useState<
    Array<{
      id: string;
      index: number;
      shortName: string;
      name: string;
      color: string;
      x: number;
      y: number;
      visible: boolean;
    }>
  >([]);

  const demoFrame = useMemo(() => getDemoKeyframe(demoSeconds), [demoSeconds]);

  const activeBoardMode = demoPlaying ? demoFrame.board : boardMode;
  const activeBoardProgress = demoPlaying ? demoFrame.boardProgress : boardProgress;
  const activeBoardGroup =
    BOARD_GROUPS.find(
      (b) => b.id === (demoPlaying ? demoFrame.boardSelectedId : boardSelectedId)
    ) ?? BOARD_GROUPS[0];

  const activeExplosion = demoPlaying ? demoFrame.explosion : explosion;
  const activeSelectedId = demoPlaying ? demoFrame.selectedId : selectedId;
  const activeIsolatedId = demoPlaying ? null : isolatedId;

  const visibleParts = useMemo(
    () =>
      PARTS.filter(
        (p) =>
          enabledSystems.includes(p.system) &&
          (activeIsolatedId === null || p.id === activeIsolatedId)
      ),
    [enabledSystems, activeIsolatedId]
  );

  const filteredParts = useMemo(
    () =>
      visibleParts.filter((p) =>
        `${p.name} ${p.shortDesc} ${p.system} ${p.id}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      ),
    [visibleParts, searchQuery]
  );

  const selectedPart = useMemo(
    () => getPartById(activeSelectedId),
    [activeSelectedId]
  );
  const selectedSystem = useMemo(
    () => SYSTEMS.find((s) => s.id === selectedPart?.system),
    [selectedPart]
  );

  const sliderPercent = Math.round(
    (activeBoardMode ? activeBoardProgress : activeExplosion) * 100
  );

  const liveStageInfo = useMemo(
    () => getLiveStageInfo(sliderPercent),
    [sliderPercent]
  );

  // Inicializar motor 3D
  useEffect(() => {
    if (!canvasRef.current) return;
    const manager = new SceneManager(canvasRef.current, {
      onSelectPart: (partId) => {
        soundManager.playMechanicalClick();
        setSelectedId(partId);
        setMobileDrawerOpen(false);
      },
      onSelectBoardGroup: (groupId) => {
        soundManager.playMechanicalClick();
        setBoardSelectedId(groupId);
      }
    });
    sceneRef.current = manager;
    manager.setTheme('studio');

    return () => {
      manager.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sincronizar estado con el motor 3D
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.syncState({
      explosion: activeExplosion,
      enabledSystems,
      selectedId: activeSelectedId,
      isolatedId: activeIsolatedId,
      boardMode: activeBoardMode,
      boardProgress: activeBoardProgress,
      view: cameraView,
      zoom,
      demoAngle: demoPlaying ? demoFrame.angle : undefined,
      lidAngle: demoPlaying ? demoFrame.lid : 1.945
    });
  }, [
    activeExplosion,
    enabledSystems,
    activeSelectedId,
    activeIsolatedId,
    activeBoardMode,
    activeBoardProgress,
    cameraView,
    zoom,
    demoPlaying,
    demoFrame
  ]);

  // Actualizar proyección 2D de pines 3D
  useEffect(() => {
    let rafId: number;
    const updatePins = () => {
      if (sceneRef.current) {
        setPartPin(sceneRef.current.getSelectedPartPin());
        if (activeBoardMode) {
          setBoardPins(sceneRef.current.getBoardGroupPins());
        }
      }
      rafId = requestAnimationFrame(updatePins);
    };
    rafId = requestAnimationFrame(updatePins);
    return () => cancelAnimationFrame(rafId);
  }, [activeBoardMode, activeSelectedId, activeExplosion, activeIsolatedId]);

  // Temporizador del recorrido de 24s
  useEffect(() => {
    if (!demoPlaying) return;
    let rafId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      if (elapsed >= 24) {
        setDemoPlaying(false);
        setDemoSeconds(24);
        setBoardMode(false);
        setExplosion(1);
        return;
      }
      setDemoSeconds(elapsed);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [demoPlaying]);

  // Atajos de teclado (/ para buscar, Escape para cerrar)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setFocusMode(false);
        setDemoPlaying(false);
        setSelectedId(null);
        setIsolatedId(null);
      } else if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !dialogRef.current?.open
      ) {
        e.preventDefault();
        setMobileDrawerOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleToggleSystem = (sysId: SystemId) => {
    setEnabledSystems((prev) => {
      const next = prev.includes(sysId)
        ? prev.filter((id) => id !== sysId)
        : [...prev, sysId];
      return next;
    });
    setIsolatedId(null);
  };

  const handleSelectPart = (partId: string, fromSidebar = false) => {
    soundManager.playMechanicalClick();
    setSelectedId(partId);
    setMobileDrawerOpen(false);
    // Si está cerrado y elige un componente interno desde la lista, abrir a 55% para que se vea
    if (
      fromSidebar &&
      !isolatedId &&
      !['top-case', 'display', 'keyboard', 'trackpad'].includes(partId) &&
      explosion < 0.45
    ) {
      setExplosion(0.55);
    }
  };

  const handleResetAll = () => {
    setBoardMode(false);
    setBoardProgress(0);
    setEnabledSystems(SYSTEMS.map((s) => s.id));
    setSelectedId(null);
    setIsolatedId(null);
    setExplosion(0);
    setSearchQuery('');
    setCameraView('perspective');
    setZoom(1);
    setDemoPlaying(false);
    setMobileDrawerOpen(false);
    sceneRef.current?.resetCamera();
  };

  const handleThemeChange = (nextTheme: AppTheme) => {
    setTheme(nextTheme);
    sceneRef.current?.setTheme(nextTheme);
  };

  const handleViewModeChange = (nextMode: ViewMode) => {
    setViewMode(nextMode);
    sceneRef.current?.setViewMode(nextMode);
  };

  const isInventoryMode =
    !activeBoardMode && activeExplosion >= 0.94 && !activeIsolatedId;

  return (
    <div
      className={`app theme-${theme} ${activeBoardMode ? 'board-mode' : ''} ${
        focusMode ? 'focus-mode' : ''
      } ${demoPlaying ? 'demo-mode' : ''} ${
        isInventoryMode ? 'inventory-mode' : ''
      }`}
    >
      {/* Cabecera superior */}
      <header className="header">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleResetAll();
          }}
          aria-label="Inicio Inside ASUS TUF A15"
        >
          <span className="brand-icon">
            <Layers size={19} strokeWidth={1.75} />
          </span>
          <span>
            inside<span className="brand-period">.</span>
          </span>
        </a>

        <div className="breadcrumb">
          <span>EXPLORADOR DE OBJETOS 3D</span>
          <i />
          <span>ASUS TUF GAMING A15 (2026)</span>
        </div>

        <div className="header-actions">
          {/* Selector de modo óptico: Normal / Térmico / Rayos X */}
          <div className="pill-group mode-pills" role="group" aria-label="Modo de vista">
            <button
              className={`pill-btn ${viewMode === 'normal' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('normal')}
            >
              Normal
            </button>
            <button
              className={`pill-btn ${viewMode === 'thermal' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('thermal')}
            >
              Térmico
            </button>
            <button
              className={`pill-btn ${viewMode === 'xray' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('xray')}
            >
              Rayos X
            </button>
          </div>

          {/* Selector de tema: Studio Claro / Dark / CAD */}
          <div className="pill-group" role="group" aria-label="Tema visual">
            <button
              className={`pill-btn ${theme === 'studio' ? 'active' : ''}`}
              onClick={() => handleThemeChange('studio')}
              title="Tema Estudio Claro"
            >
              <Sun size={12} />
              <span>Claro</span>
            </button>
            <button
              className={`pill-btn ${theme === 'cyber' ? 'active' : ''}`}
              onClick={() => handleThemeChange('cyber')}
              title="Tema Oscuro"
            >
              <Moon size={12} />
              <span>Oscuro</span>
            </button>
            <button
              className={`pill-btn ${theme === 'blueprint' ? 'active' : ''}`}
              onClick={() => handleThemeChange('blueprint')}
              title="Tema Blueprint CAD"
            >
              <Terminal size={12} />
              <span>CAD</span>
            </button>
          </div>

          <button
            className="about-button"
            onClick={() => dialogRef.current?.showModal()}
            aria-label="Ficha técnica y notas del proyecto"
          >
            <HelpCircle size={15} />
            <span>Ficha técnica</span>
          </button>

          <button
            className={`demo-button ${demoPlaying ? 'playing' : ''}`}
            onClick={
              demoPlaying
                ? () => setDemoPlaying(false)
                : () => {
                    setDemoSeconds(0);
                    setMobileDrawerOpen(false);
                    setDemoPlaying(true);
                  }
            }
          >
            {demoPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" />
            )}
            <span>{demoPlaying ? 'Salir de demo' : 'Ver desmontaje'}</span>
            <span className="demo-duration">24s</span>
          </button>
        </div>
      </header>

      {/* Espacio de trabajo principal */}
      <main className="workspace">
        {/* Botón móvil para abrir el cajón de piezas y sistemas */}
        <button
          className="mobile-parts-button"
          onClick={() => setMobileDrawerOpen((o) => !o)}
          aria-expanded={mobileDrawerOpen}
          aria-controls="assembly-sidebar"
        >
          <SlidersHorizontal size={14} />
          <span>Piezas y sistemas</span>
          <ChevronDown size={13} />
        </button>

        {mobileDrawerOpen && (
          <button
            className="mobile-backdrop"
            aria-label="Cerrar panel de piezas"
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}

        {/* Barra lateral izquierda: Sistemas y Lista de los 16 Componentes */}
        <aside
          id="assembly-sidebar"
          className={`sidebar ${mobileDrawerOpen ? 'mobile-open' : ''}`}
          aria-label="Piezas y sistemas"
        >
          <div className="sidebar-heading">
            <div className="eyebrow">MIRA MÁS DE CERCA</div>
            <h2>
              {activeBoardMode ? 'En la placa base' : 'El ensamblaje'}
              <span>.</span>
            </h2>
            <p>
              {activeBoardMode
                ? '8 bloques funcionales · estudio de circuito'
                : '16 ensamblajes · 5 sistemas principales'}
            </p>
          </div>

          <fieldset className="systems" disabled={demoPlaying}>
            <legend className="section-label">
              SISTEMAS <span>VISIBILIDAD</span>
            </legend>
            {SYSTEMS.map((sys) => {
              const enabled = enabledSystems.includes(sys.id);
              const count = PARTS.filter((p) => p.system === sys.id).length;
              return (
                <button
                  key={sys.id}
                  type="button"
                  className={`system-row ${enabled ? '' : 'system-off'}`}
                  aria-pressed={enabled}
                  onClick={() => handleToggleSystem(sys.id)}
                  title={sys.description}
                >
                  <span
                    className="system-dot"
                    style={{ background: sys.color }}
                  />
                  <span>{sys.label}</span>
                  <span className="system-count">{count}</span>
                  <span className="visibility-check">
                    {enabled && <Check size={11} strokeWidth={2.5} />}
                  </span>
                </button>
              );
            })}
          </fieldset>

          <div className="parts-heading">
            <span className="section-label">COMPONENTES</span>
            <span className="count-pill">
              {activeBoardMode ? BOARD_GROUPS.length : filteredParts.length}
            </span>
          </div>

          <label className="search-field">
            <Search size={13} />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar una pieza..."
              aria-label="Buscar una pieza"
              disabled={demoPlaying}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <X size={12} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </label>

          <div className="parts-list" aria-label="Lista de componentes">
            {activeBoardMode
              ? BOARD_GROUPS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    className={`part-row ${
                      activeBoardGroup.id === bg.id ? 'selected' : ''
                    }`}
                    onClick={() => {
                      setBoardSelectedId(bg.id);
                      setMobileDrawerOpen(false);
                    }}
                  >
                    <span className="part-indicator" />
                    <span>{bg.name}</span>
                    <ArrowUpRight size={12} />
                  </button>
                ))
              : filteredParts.map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    disabled={demoPlaying}
                    className={`part-row ${
                      selectedPart?.id === part.id ? 'selected' : ''
                    }`}
                    aria-pressed={selectedPart?.id === part.id}
                    onClick={() => handleSelectPart(part.id, true)}
                  >
                    <span className="part-indicator" />
                    <span>{part.name}</span>
                    <ArrowUpRight size={12} />
                  </button>
                ))}

            {!activeBoardMode && filteredParts.length === 0 && (
              <div className="py-6 text-center text-xs opacity-70">
                <p className="mb-2">
                  {searchQuery
                    ? 'No hay piezas que coincidan.'
                    : 'Todos los sistemas están ocultos.'}
                </p>
                <button
                  type="button"
                  className="underline font-medium"
                  onClick={
                    searchQuery ? () => setSearchQuery('') : handleResetAll
                  }
                >
                  {searchQuery
                    ? 'Limpiar búsqueda'
                    : 'Mostrar todos los componentes'}
                </button>
              </div>
            )}
          </div>

          <div className="sidebar-foot">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            <span>Modelo 3D paramétrico interactivo</span>
          </div>
        </aside>

        {/* Visor central 3D */}
        <section className="viewer" aria-label="Visor 3D del portátil">
          <div className="viewer-heading">
            <div>
              <div className="eyebrow">DISEÑADO CAPA POR CAPA</div>
              <h1>
                {activeBoardMode
                  ? 'Arquitectura de la placa base'
                  : 'ASUS TUF Gaming A15'}
              </h1>
              <p>
                15.6 pulgadas <span>/</span> 2026 <span>/</span> Ryzen 9 7940HS
                + RTX 4070
              </p>
            </div>
            <div className="live-label">
              <span />
              3D INTERACTIVO
            </div>
          </div>

          {/* Contenedor del lienzo Three.js y etiquetas de cuadrícula Knolling */}
          <div className="scene-wrap">
            <div className="datum datum-left">
              <span>+</span>
            </div>
            <div className="datum datum-right">
              <span>+</span>
            </div>

            <div ref={canvasRef} className="w-full h-full" />

            {/* Pin 3D flotante sobre el componente seleccionado durante desmontaje */}
            {partPin && partPin.visible && (
              <div
                className="part-pin"
                style={{ left: `${partPin.x}px`, top: `${partPin.y}px` }}
              >
                <i />
                <span>{partPin.name}</span>
              </div>
            )}

            {/* Pines numerados 01..08 en el modo "Explorar placa base" */}
            {activeBoardMode &&
              boardPins.map(
                (bp) =>
                  bp.visible && (
                    <button
                      key={bp.id}
                      type="button"
                      className={`board-pin ${
                        activeBoardGroup.id === bp.id ? 'active' : ''
                      }`}
                      style={{
                        left: `${bp.x}px`,
                        top: `${bp.y}px`,
                        borderColor:
                          activeBoardGroup.id === bp.id ? bp.color : '#58625b'
                      }}
                      onClick={() => !demoPlaying && setBoardSelectedId(bp.id)}
                    >
                      <span
                        style={{
                          color: bp.color,
                          fontFamily: 'var(--mono)',
                          fontSize: 9
                        }}
                      >
                        {String(bp.index).padStart(2, '0')}
                      </span>
                      <span>{bp.shortName}</span>
                    </button>
                  )
              )}

            {/* CUADRÍCULA KNOLLING AL LLEGAR AL FINAL (94% - 100%): Cada pieza 3D con su título y explicación debajo */}
            {isInventoryMode && (
              <div
                className="inventory-labels"
                aria-label="Bandeja de piezas con su explicación"
              >
                {PARTS.map((part) => {
                  const isEnabled = enabledSystems.includes(part.system);
                  const isActive = selectedPart?.id === part.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      disabled={!isEnabled}
                      className={`inventory-item ${isActive ? 'active' : ''}`}
                      onClick={() => !demoPlaying && handleSelectPart(part.id)}
                      aria-label={`Inspeccionar ${part.name}`}
                    >
                      <div className="inventory-item-caption">
                        <span className="inventory-item-title">
                          {part.name}
                        </span>
                        <span className="inventory-item-desc">
                          {part.shortDesc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón superior derecho: Explorar placa base / Volver al portátil */}
          {!demoPlaying && (
            <button
              type="button"
              className="board-entry"
              onClick={() => {
                setBoardMode((b) => !b);
                setMobileDrawerOpen(false);
              }}
            >
              <Cpu size={14} />
              <span>
                {boardMode ? 'Volver al portátil' : 'Explorar placa base'}
              </span>
              <ArrowUpRight size={12} />
            </button>
          )}

          {/* Tarjeta explicativa en vivo mientras se va desmontando (0% a 93%) cuando no hay pieza fija seleccionada */}
          {!demoPlaying && !activeBoardMode && !selectedPart && !isInventoryMode && (
            <aside className="live-stage-banner" aria-live="polite">
              <div className="eyebrow">{liveStageInfo.stepLabel}</div>
              <h3>{liveStageInfo.title}</h3>
              <p>{liveStageInfo.description}</p>
              {liveStageInfo.highlightPartId && (
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPart(liveStageInfo.highlightPartId!)
                  }
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[10.5px] font-semibold underline"
                  style={{ color: 'var(--accent)' }}
                >
                  <span>Ver ficha de esta pieza</span>
                  <ArrowUpRight size={12} />
                </button>
              )}
            </aside>
          )}

          {/* Panel lateral de estudio de circuito en modo "Explorar placa base" */}
          {activeBoardMode && (
            <aside className="board-details" aria-label="Detalles del circuito">
              <div className="eyebrow">
                ESTUDIO DE CIRCUITO /{' '}
                {BOARD_GROUPS.indexOf(activeBoardGroup) + 1} DE 8
              </div>
              <h2>{activeBoardGroup.name}</h2>
              <p className="font-medium" style={{ color: 'var(--ink)' }}>
                {activeBoardGroup.description}
              </p>
              <p>{activeBoardGroup.detail}</p>
              <div className="part-location">
                <b>UBICACIÓN EN PLACA</b>
                <br />
                {activeBoardGroup.location}
              </div>
              <small>
                Esquema educativo de arquitectura electrónica. Los bloques
                ilustran la separación funcional de CPU, GPU, fases VRM,
                memorias y buses de interconexión sobre el PCB de 8 capas.
              </small>
            </aside>
          )}

          {/* Controles de cámara y zoom en el visor */}
          {!demoPlaying && (
            <>
              <div className="scene-top-controls">
                <div className="view-switch" role="group" aria-label="Vista de cámara">
                  {(
                    [
                      ['perspective', 'Perspectiva'],
                      ['top', 'Superior'],
                      ['front', 'Frontal'],
                      ['bottom', 'Inferior'],
                      ['left', 'Izquierda'],
                      ['right', 'Derecha']
                    ] as const
                  ).map(([preset, label]) => (
                    <button
                      key={preset}
                      type="button"
                      className={cameraView === preset ? 'active' : ''}
                      aria-pressed={cameraView === preset}
                      onClick={() => {
                        setCameraView(preset);
                        if (selectedId) {
                          setIsolatedId(selectedId);
                        } else if (explosion > 0.65) {
                          setExplosion(0.6);
                        }
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {isolatedId && (
                  <button
                    type="button"
                    className="return-button"
                    onClick={() => {
                      setIsolatedId(null);
                      if (explosion > 0.65) setCameraView('perspective');
                    }}
                  >
                    <ChevronLeft size={13} />
                    <span>Ver ensamblaje completo</span>
                  </button>
                )}
              </div>

              <div className="viewport-actions">
                <button
                  type="button"
                  aria-label="Acercar zoom"
                  title="Acercar zoom"
                  disabled={zoom >= 1.6}
                  onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Alejar zoom"
                  title="Alejar zoom"
                  disabled={zoom <= 0.7}
                  onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                >
                  <Minus size={16} />
                </button>
                <span />
                <button
                  type="button"
                  aria-label={
                    focusMode ? 'Salir de vista expandida' : 'Expandir vista'
                  }
                  title="Expandir vista"
                  onClick={() => setFocusMode((f) => !f)}
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              <div className="orbit-hint">
                <MousePointer2 size={12} />
                <span>Arrastra para rotar</span>
                <span>·</span>
                <span>Rueda para hacer zoom</span>
              </div>

              <div className="model-note">
                MODELO ILUSTRATIVO DE INGENIERÍA · ESCALA 1:1
              </div>
            </>
          )}

          {/* Subtítulos cinemáticos durante la demo de 24s */}
          {demoPlaying && (
            <div className="demo-caption">
              <span className="eyebrow">INSIDE ASUS TUF A15</span>
              <h2>{demoFrame.caption}</h2>
              <div className="demo-progress">
                <i style={{ width: `${(demoSeconds / 24) * 100}%` }} />
              </div>
              <span className="demo-timer">
                {String(Math.floor(demoSeconds)).padStart(2, '0')} / 24 SEG
              </span>
            </div>
          )}
        </section>

        {/* Inspector de detalles del componente seleccionado (Derecha en escritorio / Tarjeta inferior en móvil) */}
        <aside
          className={`inspector ${selectedPart ? 'has-selection' : ''}`}
          aria-label="Detalles del componente"
          aria-live="polite"
        >
          {selectedPart && (
            <>
              <div className="inspector-top">
                <span className="section-label">DETALLES DE LA PIEZA</span>
                <button
                  type="button"
                  aria-label="Cerrar detalles de pieza"
                  onClick={() => {
                    setIsolatedId(null);
                    setSelectedId(null);
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="system-tag">
                <span style={{ background: selectedSystem?.color }} />
                {selectedSystem?.label}
              </div>

              <h2>{selectedPart.name}</h2>
              <p className="part-description">{selectedPart.description}</p>
              <p className="part-detail">{selectedPart.detail}</p>

              <p className="part-location">
                <b>POSICIÓN EN EL EQUIPO</b>
                <br />
                {selectedPart.location}
              </p>

              <div className="material-info">
                <span className="section-label">MATERIAL Y CONSTRUCCIÓN</span>
                <p>{selectedPart.material}</p>
              </div>

              <button
                type="button"
                className="isolate-button"
                onClick={() =>
                  isolatedId
                    ? setIsolatedId(null)
                    : setIsolatedId(selectedPart.id)
                }
              >
                {isolatedId ? <Layers size={14} /> : <Focus size={14} />}
                <span>
                  {isolatedId
                    ? 'Mostrar ensamblaje completo'
                    : 'Aislar componente en 3D'}
                </span>
                <ArrowUpRight size={13} />
              </button>

              <div className="selection-note">
                {isolatedId
                  ? 'Mostrando únicamente esta pieza en 3D.'
                  : 'Seleccionado en la vista 3D.'}
              </div>
            </>
          )}
        </aside>

        {/* Controlador inferior de desmontaje ("Desmontar · Capa por capa" -> "Todas las piezas") */}
        <section
          className="teardown-controls"
          aria-label="Controles de desmontaje"
        >
          <div className="teardown-label">
            <span className="slider-icon">
              <Layers size={18} strokeWidth={1.6} />
            </span>
            <div>
              <h2>
                {activeBoardMode ? 'Separar circuitos' : 'Desmontar equipo'}
              </h2>
              <p>Capa por capa hasta ver cada pieza.</p>
            </div>
          </div>

          <div className="slider-control">
            <div className="slider-endpoints">
              <button
                type="button"
                disabled={demoPlaying || (!activeBoardMode && !!isolatedId)}
                onClick={() =>
                  activeBoardMode ? setBoardProgress(0) : setExplosion(0)
                }
              >
                Ensamblado
              </button>

              <span className="explosion-value">
                {sliderPercent}
                <span>%</span>
              </span>

              <button
                type="button"
                disabled={demoPlaying || (!activeBoardMode && !!isolatedId)}
                onClick={() =>
                  activeBoardMode ? setBoardProgress(1) : setExplosion(1)
                }
              >
                <span>Todas las piezas</span>
                <MoveUpRight size={11} />
              </button>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sliderPercent}
              disabled={demoPlaying || (!activeBoardMode && !!isolatedId)}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                if (activeBoardMode) {
                  setBoardProgress(val);
                } else {
                  setExplosion(val);
                }
              }}
              aria-label={
                activeBoardMode
                  ? 'Separación de los circuitos de la placa'
                  : 'Progreso de desmontaje del portátil'
              }
              style={
                {
                  '--progress': `${sliderPercent}%`
                } as React.CSSProperties
              }
            />

            <div className="slider-ticks" aria-hidden="true">
              {Array.from({ length: 21 }, (_, idx) => (
                <i key={idx} />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="reset-button"
            onClick={handleResetAll}
            title="Restaurar vista inicial"
          >
            <RotateCcw size={13} />
            <span>Reiniciar</span>
          </button>
        </section>
      </main>

      {/* Diálogo modal de Especificaciones Técnicas y Fuentes */}
      <dialog
        ref={dialogRef}
        className="about-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow">FICHA TÉCNICA DE INGENIERÍA</span>
          <button
            type="button"
            aria-label="Cerrar ventana"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="text-2xl font-semibold mt-4 mb-3">
          ASUS TUF Gaming A15 (FA507NV)
        </h2>
        <p className="text-xs leading-relaxed opacity-80 mb-4">
          Reconstrucción tridimensional interactiva de los 16 subsistemas
          internos y 8 bloques funcionales de placa base. Desliza el control
          inferior desde 0% (ensamblado a ras) hasta 100% (bandeja Knolling)
          para estudiar cada pieza y su función.
        </p>

        <div className="border-t border-b py-3 my-3 space-y-2 text-xs" style={{ borderColor: 'var(--line)' }}>
          <div className="flex justify-between">
            <span className="opacity-70">Procesador</span>
            <span className="font-semibold">AMD Ryzen 9 7940HS (8C/16T, 4nm, 5.2 GHz)</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Gráficos dedicados</span>
            <span className="font-semibold">NVIDIA GeForce RTX 4070 Laptop (8GB, 140W TGP)</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Refrigeración</span>
            <span className="font-semibold">2× Ventiladores Arc Flow (84 aspas) + 5 Heatpipes</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Memoria y Almacenamiento</span>
            <span className="font-semibold">DDR5-4800 Dual Channel + 2× M.2 NVMe PCIe 4.0</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Pantalla y Batería</span>
            <span className="font-semibold">15.6" FHD 144Hz G-SYNC · Batería 90Wh (4 celdas)</span>
          </div>
        </div>

        <button
          type="button"
          className="isolate-button w-full mt-4"
          onClick={() => dialogRef.current?.close()}
        >
          <span>Continuar explorando</span>
          <Eye size={14} />
        </button>
      </dialog>
    </div>
  );
};
