import { useMemo, useRef, useState } from "react";
import {
  MAX_SCORE,
  TOTAL_CARDS,
  computeStats,
  type RoundRecord,
} from "../game/logic";

interface StatsBoardProps {
  history: RoundRecord[];
  onClear: () => void;
}

export default function StatsBoard({ history, onClear }: StatsBoardProps) {
  const stats = useMemo(() => computeStats(history), [history]);
  const recent = useMemo(() => history.slice(-20), [history]);
  const reversed = useMemo(() => [...history].reverse().slice(0, 60), [history]);

  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleClear = () => {
    if (history.length === 0) return;
    if (!confirming) {
      setConfirming(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setConfirming(false), 2600);
      return;
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setConfirming(false);
    onClear();
  };

  return (
    <section
      className="rise-in rounded-2xl border border-gold-500/25 bg-gradient-to-b from-felt-800 to-felt-900 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(240,207,135,0.12)]"
      style={{ animationDelay: "0.12s" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-sm tracking-[0.45em] text-gold-300/75">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M4 20V10" />
            <path d="M10 20V4" />
            <path d="M16 20v-7" />
            <path d="M22 20H2" />
          </svg>
          战绩统计
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className={`rounded-md border px-2.5 py-1 text-[11px] transition-colors duration-200 ${
              confirming
                ? "border-cardred-500/70 bg-cardred-500/15 text-[#e8636e]"
                : "border-ivory-100/15 text-ivory-100/45 hover:border-cardred-500/50 hover:text-[#e8636e]"
            }`}
          >
            {confirming ? "再点一次确认" : "清空记录"}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold-500/20 px-4 py-8 text-center">
          <p className="font-display text-2xl text-ivory-100/25">虚位以待</p>
          <p className="mt-1.5 text-xs text-ivory-100/35">
            完成任意一局(收手或爆掉)后,这里会出现你的战绩
          </p>
        </div>
      ) : (
        <>
          {/* 三项核心数据 */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-gold-500/30 bg-gold-400/10 px-2 py-3 text-center">
              <p className="font-display text-2xl leading-none text-gold-300 md:text-3xl">
                {stats.avg}
              </p>
              <p className="mt-1.5 text-[10px] tracking-[0.2em] text-gold-200/60">
                平均分
              </p>
            </div>
            <div className="rounded-xl border border-gold-500/15 bg-felt-950/50 px-2 py-3 text-center">
              <p className="font-display text-2xl leading-none text-ivory-50 md:text-3xl">
                {stats.total}
              </p>
              <p className="mt-1.5 text-[10px] tracking-[0.2em] text-ivory-100/40">
                累计得分
              </p>
            </div>
            <div className="rounded-xl border border-gold-500/15 bg-felt-950/50 px-2 py-3 text-center">
              <p className="font-display text-2xl leading-none text-ivory-50 md:text-3xl">
                {stats.best}
              </p>
              <p className="mt-1.5 text-[10px] tracking-[0.2em] text-ivory-100/40">
                单局最高
              </p>
            </div>
          </div>

          {/* 四项次要数据 */}
          <div className="mt-2.5 grid grid-cols-4 gap-2.5 text-center">
            {[
              { label: "总局数", value: String(stats.rounds), tone: "text-ivory-50" },
              { label: "收手", value: String(stats.banks), tone: "text-gold-300" },
              { label: "爆掉", value: String(stats.busts), tone: "text-[#e8636e]" },
              { label: "均翻牌", value: stats.avgFlips, tone: "text-ivory-50" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-gold-500/10 bg-felt-950/40 px-1 py-2"
              >
                <p className={`font-display text-lg leading-none ${c.tone}`}>
                  {c.value}
                </p>
                <p className="mt-1 text-[10px] text-ivory-100/40">{c.label}</p>
              </div>
            ))}
          </div>

          {/* 最近走势 */}
          <div className="mt-4">
            <p className="mb-1.5 flex items-center justify-between text-[11px] text-ivory-100/45">
              <span>最近 {recent.length} 局走势</span>
              <span>爆掉率 {stats.bustRate}</span>
            </p>
            <div className="h-12 rounded-lg border border-gold-500/10 bg-felt-950/50 px-1.5 py-1">
              <svg
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                {recent.map((r, i) => {
                  const n = recent.length;
                  const slot = 100 / n;
                  const h = Math.max(2.5, (r.score / MAX_SCORE) * 36);
                  return (
                    <rect
                      key={r.id}
                      x={i * slot + slot * 0.18}
                      y={40 - h}
                      width={slot * 0.64}
                      height={h}
                      rx={1}
                      fill={r.outcome === "busted" ? "#c22e3a" : "#e8b64c"}
                      opacity={r.outcome === "busted" ? 0.85 : 0.9}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 对局记录 */}
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] text-ivory-100/45">
              对局记录(新 → 旧)
            </p>
            <ul className="scroll-slim max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {reversed.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-2.5 rounded-lg border border-gold-500/10 bg-felt-950/40 px-2.5 py-2"
                >
                  <span className="font-display w-9 shrink-0 text-center text-xs text-ivory-100/40">
                    #{r.round}
                  </span>
                  <span
                    className={`font-display shrink-0 rounded px-1.5 py-0.5 text-[11px] leading-none ${
                      r.outcome === "banked"
                        ? "bg-gold-400/15 text-gold-300"
                        : "bg-cardred-500/15 text-[#e8636e]"
                    }`}
                  >
                    {r.outcome === "banked" ? "收手" : "爆掉"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] text-ivory-100/50">
                      翻 {r.flips} 张
                    </span>
                    <span className="mt-1 block h-1 overflow-hidden rounded-full bg-felt-700/70">
                      <span
                        className={`block h-full rounded-full ${
                          r.outcome === "banked" ? "bg-gold-400/80" : "bg-cardred-500/80"
                        }`}
                        style={{
                          width: `${Math.min(100, (r.flips / (TOTAL_CARDS - 1)) * 100)}%`,
                        }}
                      />
                    </span>
                  </span>
                  <span
                    className={`font-display shrink-0 text-lg leading-none ${
                      r.outcome === "banked" ? "text-gold-300" : "text-ivory-100/30"
                    }`}
                  >
                    {r.outcome === "banked" ? `+${r.score}` : "0"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
