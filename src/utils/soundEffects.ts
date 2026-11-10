/**
 * Sistema de audio sintetizado proceduralmente mediante Web Audio API
 * Genera sonidos mecánicos, turbinas y zumbidos futuristas sin depender de archivos de audio externos.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private masterGain: GainNode | null = null;

  constructor() {
    // El contexto de audio se inicializa tras el primer gesto de usuario para cumplir la política de navegadores
  }

  private initContext(): boolean {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return true;
  }

  public toggleSound(): boolean {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (this.isEnabled && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.playMechanicalClick();
    }
    return this.isEnabled;
  }

  public isSoundActive(): boolean {
    return this.isEnabled;
  }

  public setSoundActive(active: boolean): void {
    this.isEnabled = active;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(active ? 0.3 : 0, this.ctx.currentTime);
    }
  }

  /**
   * Click mecánico metálico de alta precisión para clics e interacciones de interfaz
   */
  public playMechanicalClick(): void {
    if (!this.isEnabled || !this.initContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // Oscilador de ataque transitorio
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);

    // Segundo pulso de rebote del muelle mecánico
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(650, now + 0.015);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.05);

    gain2.gain.setValueAtTime(0.2, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc2.start(now + 0.015);
    osc2.stop(now + 0.065);
  }

  /**
   * Tono de advertencia / despliegue militar con modulación de frecuencia dual
   */
  public playMechaWarning(): void {
    if (!this.isEnabled || !this.initContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.08);
    osc.frequency.linearRampToValueAtTime(660, now + 0.16);
    osc.frequency.linearRampToValueAtTime(1320, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Giro de turbinas Arc Flow con modulación de frecuencia proporcional a las RPM
   */
  public playTurbineSpin(intensity: number = 0.5): void {
    if (!this.isEnabled || !this.initContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const baseFreq = 80 + intensity * 260;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.28);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.55);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18 * intensity, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Zumbido electromagnético futurista al enfocar componentes de silicio o placas
   */
  public playFuturisticHum(): void {
    if (!this.isEnabled || !this.initContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);

    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(110, now);
    oscSub.frequency.linearRampToValueAtTime(165, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    oscSub.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    oscSub.start(now);
    osc.stop(now + 0.4);
    oscSub.stop(now + 0.4);
  }
}

export const soundManager = new SoundSystem();
