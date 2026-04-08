class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playFlip() {
    this.playTone(440, 'sine', 0.1, 0.1);
  }

  playDraw() {
    this.playTone(523, 'triangle', 0.15, 0.1);
  }

  playDiscard() {
    this.playTone(330, 'sine', 0.1, 0.1);
  }

  playRemove() {
    // A nice little burst for removing columns
    this.playTone(880, 'sine', 0.05, 0.1);
    setTimeout(() => this.playTone(1320, 'sine', 0.05, 0.1), 50);
  }

  playVictory() {
    const sequence = [523, 659, 783, 1046];
    sequence.forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'sine', 0.3, 0.15), i * 150);
    });
  }
}

export const soundManager = new SoundManager();
