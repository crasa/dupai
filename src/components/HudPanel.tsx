import { MAX_SCORE, POINTS_PER_FIVE, TOTAL_CARDS } from "../game/logic";

export type Phase = "playing" | "busted" | "banked";

interface HudPanelProps {
  score: number;
  flips: number;
  phase: Phase;
  roundNo: number;
  onBank: () => void;
  onNewRound: () => void;
}

export default function HudPanel({
  score,
  flips,
  phase,
  roundNo,
  onBank,
  onNewRound,
}: HudPanelProps) {
  const remaining = TOTAL_CARDS - flips;
  const playing = phase === "playing";
  const chance = playing && remaining > 0 ? 1 / remaining : null;
  const ev =
    playing && remaining > 0
      ? (POINTS_PER_FIVE * (remaining - 1) - score) / remaining
      : null;

  const chancePct = chance !== null ? chance * 100 : 0;
  const barColor =
    chance === null
      ? "bg-felt-500"
      : chance < 0.08
        ? "bg-felt-400"
        : chance < 0.18
          ? "bg-gold-400"
          : "bg-cardred-500";

  const canBank = playing && score > 0;

  return (
    <section className="rise-in rounded-2xl border border-gold-500/25 bg-gradient-to-b from-felt-800 to-felt-900 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(240,207,135,0.12)]">
      {/* 标题行 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm tracking-[0.45em] text-gold-300/75">
          计分台
        </h2>
        <span className="font-display rounded-full border border-gold-500/30 px-3 py-0.5 text-xs text-gold-200/90">
          第 {roundNo} 局
        </span>
      </div>

      {/* 本局积分 */}
      <div className="rounded-xl border border-gold-500/15 bg-felt-950/60 px-4 py-3 text-center shadow-inner">
        <p className="text-[11px] tracking-[0.3em] text-ivory-100/45">
          本局积分
        </p>
        <p
          key={score}
          className={`score-pop font-display mt-0.5 text-6xl leading-none ${
            score > 0 ? "text-gold-300" : "text-ivory-100/35"
          }`}
        >
          {score}
        </p>
        <p className="mt-1.5 text-[11px] text-ivory-100/40">
          单局上限 {MAX_SCORE} 分 · 翻满 19 张
        </p>
      </div>

      {/* 牌局信息 */}
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between text-ivory-100/70">
          <span>已翻 / 剩余</span>
          <span className="font-display text-base text-ivory-50">
            {flips}
            <span className="mx-1 text-ivory-100/30">/</span>
            {remaining}
          </span>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-ivory-100/70">
            <span>下一张爆掉概率</span>
            <span
              className={`font-display text-base ${
                chance === null
                  ? "text-ivory-100/35"
                  : chance < 0.08
                    ? "text-felt-400"
                    : chance < 0.18
                      ? "text-gold-300"
                      : "text-cardred-500"
              }`}
            >
              {chance === null ? "—" : `${chancePct.toFixed(1)}%`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-felt-950/80 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{
                width:
                  chance === null
                    ? "0%"
                    : `${Math.max(chancePct * 3.2, chancePct > 0 ? 6 : 0)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-ivory-100/70">
          <span>再翻一张的期望</span>
          {ev === null ? (
            <span className="font-display text-base text-ivory-100/35">—</span>
          ) : (
            <span
              className={`font-display text-base ${
                ev >= 0 ? "text-felt-400" : "text-cardred-500"
              }`}
            >
              {ev >= 0 ? "+" : "−"}
              {Math.abs(ev).toFixed(1)} 分
            </span>
          )}
        </div>
        {ev !== null && ev <= 0 && (
          <p className="fade-slide-in -mt-1 text-right text-[11px] text-cardred-500/90">
            数学期望已为负 —— 理性的选择是收手
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-5 space-y-2.5">
        {playing ? (
          <button
            type="button"
            onClick={onBank}
            disabled={!canBank}
            className={`btn-shine font-display w-full rounded-xl bg-gradient-to-b from-gold-300 via-gold-400 to-gold-600 py-3.5 text-xl tracking-[0.25em] text-ink-900 shadow-[0_10px_26px_rgba(0,0,0,0.4)] transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-50 ${
              canBank && score >= 40 ? "bank-glow" : ""
            }`}
          >
            收手离场
            <span className="mt-0.5 block text-xs font-bold tracking-[0.2em] text-ink-900/70">
              {canBank ? `落袋 ${score} 分` : "至少先翻出一张 5"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewRound}
            className="btn-shine font-display w-full rounded-xl border-2 border-gold-400/70 bg-gold-400/5 py-3.5 text-xl tracking-[0.25em] text-gold-200 transition-colors duration-200 hover:bg-gold-400/15 active:scale-[0.97]"
          >
            <span className="inline-flex items-center gap-2.5">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              再来一局
            </span>
            <span className="mt-0.5 block text-xs font-bold tracking-[0.2em] text-gold-200/60">
              重新洗牌 · 20 张暗牌
            </span>
          </button>
        )}
        <p className="text-center text-[11px] leading-relaxed text-ivory-100/35">
          20 张牌中藏着 1 张「0」,翻到即本局清零
        </p>
      </div>
    </section>
  );
}
