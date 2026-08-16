export type Outcome = "banked" | "busted";

export interface RoundRecord {
  id: string;
  round: number;
  score: number;
  flips: number;
  outcome: Outcome;
  ts: number;
}

export interface CardMeta {
  suit: string;
  red: boolean;
}

export const SUITS: CardMeta[] = [
  { suit: "♠", red: false },
  { suit: "♥", red: true },
  { suit: "♦", red: true },
  { suit: "♣", red: false },
];

export const TOTAL_CARDS = 20;
export const POINTS_PER_FIVE = 5;
export const MAX_SCORE = POINTS_PER_FIVE * (TOTAL_CARDS - 1); // 95

/** 生成一副洗好的牌:19 张 5 + 1 张 0 */
export function makeDeck(): number[] {
  const deck: number[] = Array(TOTAL_CARDS - 1).fill(POINTS_PER_FIVE);
  deck.push(0);
  // Fisher–Yates 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export interface GameStats {
  rounds: number;
  total: number;
  avg: string;
  best: number;
  busts: number;
  banks: number;
  bustRate: string;
  avgFlips: string;
}

export function computeStats(history: RoundRecord[]): GameStats {
  const rounds = history.length;
  if (rounds === 0) {
    return {
      rounds: 0,
      total: 0,
      avg: "—",
      best: 0,
      busts: 0,
      banks: 0,
      bustRate: "—",
      avgFlips: "—",
    };
  }
  const total = history.reduce((s, r) => s + r.score, 0);
  const best = Math.max(...history.map((r) => r.score));
  const busts = history.filter((r) => r.outcome === "busted").length;
  const banks = rounds - busts;
  const flips = history.reduce((s, r) => s + r.flips, 0);
  return {
    rounds,
    total,
    avg: (total / rounds).toFixed(1),
    best,
    busts,
    banks,
    bustRate: `${((busts / rounds) * 100).toFixed(0)}%`,
    avgFlips: (flips / rounds).toFixed(1),
  };
}

export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
  );
}

const HISTORY_KEY = "ganfan-history-v1";
const MUTE_KEY = "ganfan-muted-v1";

export function loadHistory(): RoundRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r) =>
        r &&
        typeof r.score === "number" &&
        typeof r.flips === "number" &&
        (r.outcome === "banked" || r.outcome === "busted")
    );
  } catch {
    return [];
  }
}

export function saveHistory(history: RoundRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* 忽略存储失败 */
  }
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* 忽略存储失败 */
  }
}
