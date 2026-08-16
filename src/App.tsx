import { useEffect, useState } from "react";
import AmbientBackground from "./components/AmbientBackground";
import HudPanel, { type Phase } from "./components/HudPanel";
import PlayingCard from "./components/PlayingCard";
import StatsBoard from "./components/StatsBoard";
import {
  SUITS,
  TOTAL_CARDS,
  loadHistory,
  loadMuted,
  makeDeck,
  saveHistory,
  saveMuted,
  uid,
  type Outcome,
  type RoundRecord,
} from "./game/logic";
import { sfx } from "./game/sound";

interface StatusMsg {
  text: string;
  tone: "info" | "good" | "bad";
  key: number;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  dur: number;
  size: number;
  color: string;
  spin: number;
  round: boolean;
}

const CONFETTI_COLORS = ["#e8b64c", "#f0cf87", "#c22e3a", "#f4ead2", "#d4a437"];

export default function App() {
  const [history, setHistory] = useState<RoundRecord[]>(() => loadHistory());
  const [deck, setDeck] = useState<number[]>(() => makeDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [roundKey, setRoundKey] = useState(0);
  const [status, setStatus] = useState<StatusMsg>({
    text: "20 张暗牌已就位 —— 点一张,试试手气",
    tone: "info",
    key: 0,
  });
  const [shaking, setShaking] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[] | null>(null);
  const [muted, setMuted] = useState<boolean>(() => loadMuted());

  useEffect(() => {
    sfx.setMuted(muted);
    saveMuted(muted);
  }, [muted]);

  const roundNo = history.length + 1;

  const say = (text: string, tone: StatusMsg["tone"]) =>
    setStatus({ text, tone, key: Date.now() + Math.random() });

  const pushHistory = (recScore: number, flips: number, outcome: Outcome) => {
    setHistory((prev) => {
      const rec: RoundRecord = {
        id: uid(),
        round: prev.length + 1,
        score: recScore,
        flips,
        outcome,
        ts: Date.now(),
      };
      const next = [...prev, rec];
      saveHistory(next);
      return next;
    });
  };

  const spawnConfetti = () => {
    const pieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      dur: 1 + Math.random() * 0.7,
      size: 6 + Math.random() * 7,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      spin: 420 + Math.random() * 520,
      round: Math.random() > 0.55,
    }));
    setConfetti(pieces);
    window.setTimeout(() => setConfetti(null), 2100);
  };

  const handleFlip = (index: number) => {
    if (phase !== "playing" || flipped.includes(index)) return;
    const value = deck[index];
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    sfx.flip();

    if (value === 5) {
      const newScore = score + 5;
      setScore(newScore);
      sfx.five();

      if (newFlipped.length === TOTAL_CARDS - 1) {
        // 翻完 19 张 5,最后一张必然是 0,自动收手
        setPhase("banked");
        pushHistory(newScore, newFlipped.length, "banked");
        spawnConfetti();
        say(
          "神乎其技!19 张全是 5,最后一张必是 0 —— 已自动收手",
          "good"
        );
      } else {
        say(`翻到 5,+5 分!当前 ${newScore} 分,敢不敢继续?`, "good");
      }
      return;
    }

    // 翻到了 0
    sfx.bust();
    setPhase("busted");
    setShaking(true);
    setFlashKey((k) => k + 1);
    window.setTimeout(() => setShaking(false), 650);
    pushHistory(0, newFlipped.length, "busted");
    say(
      score > 0
        ? `翻到了 0!刚攒下的 ${score} 分瞬间清零`
        : "第一张就是 0!非酋实锤,下一局转运",
      "bad"
    );
  };

  const handleBank = () => {
    if (phase !== "playing" || score === 0) return;
    sfx.bank();
    setPhase("banked");
    spawnConfetti();
    pushHistory(score, flipped.length, "banked");
    say(
      `稳!带着 ${score} 分离场 —— 剩 ${TOTAL_CARDS - flipped.length} 张里就藏着那张 0`,
      "good"
    );
  };

  const handleNewRound = () => {
    setDeck(makeDeck());
    setFlipped([]);
    setScore(0);
    setPhase("playing");
    setRoundKey((k) => k + 1);
    setConfetti(null);
    say("新一局!20 张暗牌重新洗好,祝你好运", "info");
  };

  const handleClear = () => {
    setHistory([]);
    saveHistory([]);
    say("战绩已清空,从零开始也是种勇气", "info");
  };

  const toneClass =
    status.tone === "good"
      ? "text-gold-300"
      : status.tone === "bad"
        ? "text-[#e8636e]"
        : "text-ivory-100/75";

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-5 pb-14 lg:px-6">
        {/* 顶栏 */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg width="46" height="46" viewBox="0 0 48 48" aria-hidden="true">
              <g transform="rotate(-11 24 24)">
                <rect
                  x="7"
                  y="7"
                  width="21"
                  height="29"
                  rx="3"
                  fill="#7f1a26"
                  stroke="#e8b64c"
                  strokeWidth="1.6"
                />
              </g>
              <g transform="rotate(9 26 24)">
                <rect
                  x="19"
                  y="10"
                  width="21"
                  height="29"
                  rx="3"
                  fill="#faf4e4"
                  stroke="#d4a437"
                  strokeWidth="1.6"
                />
                <text
                  x="29.5"
                  y="31"
                  textAnchor="middle"
                  fontFamily="'ZCOOL QingKe HuangYou', sans-serif"
                  fontSize="16"
                  fill="#143824"
                >
                  5
                </text>
              </g>
            </svg>
            <div>
              <h1 className="font-display text-3xl leading-none tracking-[0.22em] text-ivory-50 md:text-4xl">
                敢<span className="text-gold-400">翻</span>
              </h1>
              <p className="mt-1.5 text-[11px] tracking-[0.32em] text-gold-300/55">
                PRESS YOUR LUCK · 二十张牌 · 一张归零
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-display rounded-full border border-gold-500/30 bg-felt-900/70 px-4 py-1.5 text-sm text-gold-200">
              第 {roundNo} 局
            </span>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "开启音效" : "关闭音效"}
              title={muted ? "开启音效" : "关闭音效"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 bg-felt-900/70 text-gold-300/80 transition-colors duration-200 hover:border-gold-400/60 hover:text-gold-200"
            >
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                  <path d="m22 9-6 6" />
                  <path d="m16 9 6 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* 牌桌 */}
          <section>
            <div className="rounded-[30px] bg-gradient-to-br from-wood-600 via-wood-800 to-wood-900 p-3 shadow-[0_30px_70px_rgba(0,0,0,0.55)] md:p-4">
              <div
                className={`relative overflow-hidden rounded-[22px] border-2 border-gold-500/40 bg-[radial-gradient(120%_95%_at_50%_0%,#1b4a2f_0%,#143824_48%,#0e2a1b_100%)] p-3.5 shadow-[inset_0_0_70px_rgba(0,0,0,0.55)] sm:p-5 md:p-6 ${
                  shaking ? "shake-x" : ""
                }`}
              >
                {/* 桌面水印 */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[170px] leading-none text-gold-300/[0.05] select-none md:text-[230px]">
                    敢
                  </span>
                </div>

                {/* 状态播报 */}
                <div className="relative z-10 mb-4 flex min-h-6 items-center justify-center md:mb-5">
                  <p
                    key={status.key}
                    className={`fade-slide-in flex items-center gap-2 text-center text-sm font-medium md:text-[15px] ${toneClass}`}
                  >
                    <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                    {status.text}
                  </p>
                </div>

                {/* 20 张牌 */}
                <div
                  key={roundKey}
                  className="relative z-10 grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:gap-3"
                >
                  {deck.map((value, i) => (
                    <PlayingCard
                      key={i}
                      index={i}
                      value={value}
                      meta={SUITS[i % SUITS.length]}
                      revealed={flipped.includes(i) || phase !== "playing"}
                      revealedByPlayer={flipped.includes(i)}
                      ended={phase !== "playing"}
                      interactive={phase === "playing" && !flipped.includes(i)}
                      onFlip={handleFlip}
                    />
                  ))}
                </div>

                {/* 爆掉红闪 */}
                {flashKey > 0 && (
                  <div
                    key={flashKey}
                    className="flash-red pointer-events-none absolute inset-0 z-20 bg-cardred-600/60"
                  />
                )}

                {/* 收手金雨 */}
                {confetti && (
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                    {confetti.map((p) => (
                      <span
                        key={p.id}
                        className="confetti-piece"
                        style={{
                          left: `${p.left}%`,
                          width: p.size,
                          height: p.round ? p.size : p.size * 0.45,
                          backgroundColor: p.color,
                          borderRadius: p.round ? "50%" : "2px",
                          ["--spin" as string]: `${p.spin}deg`,
                          ["--dur" as string]: `${p.dur}s`,
                          ["--delay" as string]: `${p.delay}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 规则速记 */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-ivory-100/55">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-felt-400" />
                翻到 <b className="font-display text-sm text-felt-400">5</b> → +5 分
              </span>
              <span className="text-gold-500/40">◆</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-cardred-500" />
                翻到 <b className="font-display text-sm text-[#e8636e]">0</b> → 本局清零
              </span>
              <span className="text-gold-500/40">◆</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-gold-400" />
                随时收手 → 落袋为安
              </span>
            </div>
          </section>

          {/* 侧栏:计分台 + 统计 */}
          <aside className="flex flex-col gap-5">
            <HudPanel
              score={score}
              flips={flipped.length}
              phase={phase}
              roundNo={roundNo}
              onBank={handleBank}
              onNewRound={handleNewRound}
            />
            <StatsBoard history={history} onClear={handleClear} />
          </aside>
        </main>

        <footer className="mt-12 text-center text-[11px] tracking-[0.2em] text-ivory-100/30">
          敢翻 · 运气与胆量的博弈 —— 战绩保存在本地浏览器,爆掉不怪发牌的
        </footer>
      </div>
    </div>
  );
}
