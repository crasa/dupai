/** 轻量 WebAudio 音效:无外部资源,首次交互时惰性创建 AudioContext */

let ctx: AudioContext | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  when = 0,
  slideTo?: number
) {
  const ac = ensureCtx();
  if (!ac || muted) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), t0 + dur);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  setMuted(m: boolean) {
    muted = m;
  },
  /** 翻牌:短促纸牌声 */
  flip() {
    tone(620, 0.07, "triangle", 0.16);
    tone(1400, 0.045, "sine", 0.06, 0.01);
  },
  /** 翻到 5:清脆的硬币上分声 */
  five() {
    tone(880, 0.09, "sine", 0.16);
    tone(1318, 0.12, "sine", 0.14, 0.07);
  },
  /** 爆掉:低沉下坠声 */
  bust() {
    tone(220, 0.5, "sawtooth", 0.2, 0, 48);
    tone(160, 0.6, "square", 0.1, 0.05, 40);
  },
  /** 收手:上行琶音 */
  bank() {
    tone(523, 0.1, "sine", 0.15);
    tone(659, 0.1, "sine", 0.15, 0.08);
    tone(784, 0.12, "sine", 0.15, 0.16);
    tone(1046, 0.2, "sine", 0.16, 0.24);
  },
};
