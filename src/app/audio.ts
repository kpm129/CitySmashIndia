import type { PowerId, Preferences } from "../game/domain";
export class AudioSystem {
  private context?: AudioContext;
  private buses?: Record<
    "master" | "music" | "ambience" | "sfx" | "ui",
    GainNode
  >;
  private voices = new Set<OscillatorNode>();
  private loop?: number;
  private note = 0;
  private paused = true;
  private rate = 1;
  private musicElapsed = 0;
  private intensity = 1;
  constructor(private prefs: Preferences) {}
  unlock() {
    try {
      if (!this.context) {
        const c = (this.context = new AudioContext());
        const bus = () => c.createGain();
        this.buses = {
          master: bus(),
          music: bus(),
          ambience: bus(),
          sfx: bus(),
          ui: bus(),
        };
        this.buses.master.connect(c.destination);
        for (const name of ["music", "ambience", "sfx", "ui"] as const)
          this.buses[name].connect(this.buses.master);
        this.loop = window.setInterval(() => {
          if (!this.paused) {
            this.musicElapsed += 50 * this.rate;
            if (this.musicElapsed >= 650) {
              this.musicElapsed -= 650;
              this.music();
            }
          }
        }, 50);
      }
      this.pause(this.paused);
      this.apply();
    } catch {
      /* Audio is optional on unsupported browsers. */
    }
  }
  apply() {
    if (!this.buses) return;
    this.buses.master.gain.value = this.prefs.master ? 0.18 : 0;
    this.buses.music.gain.cancelScheduledValues(0);
    this.buses.music.gain.value = this.prefs.music ? 0.3 : 0;
    this.buses.ambience.gain.value = this.prefs.music ? 0.1 : 0;
    this.buses.sfx.gain.value = this.prefs.sfx ? 0.65 : 0;
    this.buses.ui.gain.value = this.prefs.sfx ? 0.12 : 0;
  }
  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    bus: "music" | "sfx" | "ambience" | "ui",
    end = freq,
  ) {
    const c = this.context;
    if (!c || !this.buses || this.voices.size >= 16 || c.state !== "running")
      return;
    duration /= this.rate;
    freq *= this.rate;
    end *= this.rate;
    const o = c.createOscillator(),
      gain = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      Math.max(20, end),
      c.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.35 * (bus === "sfx" ? this.intensity : 1),
      c.currentTime + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(gain);
    gain.connect(this.buses[bus]);
    this.voices.add(o);
    o.onended = () => {
      o.disconnect();
      gain.disconnect();
      this.voices.delete(o);
    };
    o.start();
    o.stop(c.currentTime + duration);
  }
  private music() {
    const notes = [130.81, 164.81, 196, 261.63, 196, 164.81, 146.83, 196];
    this.tone(notes[this.note++ % notes.length], 1.2, "sine", "music");
    if (this.note % 4 === 0) this.tone(65.4, 2, "sine", "ambience");
  }
  setRate(rate: number) {
    this.rate = rate;
  }
  effect(power: PowerId, s = 1) {
    this.intensity = Math.min(1.5, Math.sqrt(s));
    this.unlock();
    const f = {
      meteor: 180,
      earthquake: 65,
      alien: 700,
      tornado: 120,
      volcano: 95,
      lightning: 1400,
    }[power];
    this.tone(
      f,
      0.65,
      power === "alien" ? "sine" : "sawtooth",
      "sfx",
      power === "alien" ? 1000 : 30,
    );
    this.tone(f * 1.51, 0.3, "triangle", "sfx", 45);
    if (this.buses && this.context && this.prefs.music) {
      this.buses.music.gain.setTargetAtTime(
        0.04,
        this.context.currentTime,
        0.03,
      );
      this.buses.music.gain.setTargetAtTime(
        this.prefs.music ? 0.3 : 0,
        this.context.currentTime + 0.7,
        0.3,
      );
    }
  }
  pause(value: boolean) {
    this.paused = value;
    if (this.context)
      void (value ? this.context.suspend() : this.context.resume()).catch(
        () => {},
      );
  }
  clear() {
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {
        /* Already stopped. */
      }
    }
    this.voices.clear();
  }
  snapshot() {
    return {
      state: this.context?.state ?? "suspended",
      voices: this.voices.size,
      musicGain: this.buses?.music.gain.value ?? 0,
    };
  }
  dispose() {
    this.clear();
    clearInterval(this.loop);
    void this.context?.close();
  }
}
