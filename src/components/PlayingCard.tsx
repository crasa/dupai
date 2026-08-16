import type { CardMeta } from "../game/logic";

interface PlayingCardProps {
  index: number;
  value: number;
  meta: CardMeta;
  revealed: boolean;
  revealedByPlayer: boolean;
  ended: boolean;
  interactive: boolean;
  onFlip: (index: number) => void;
}

export default function PlayingCard({
  index,
  value,
  meta,
  revealed,
  revealedByPlayer,
  ended,
  interactive,
  onFlip,
}: PlayingCardProps) {
  const isZero = value === 0;
  const suitColor = meta.red ? "text-cardred-500" : "text-ink-900/80";

  // 结算后,未翻的牌按顺序错峰亮出
  const revealDelay =
    ended && !revealedByPlayer ? `${0.25 + index * 0.035}s` : undefined;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onFlip(index)}
      aria-label={
        revealed
          ? `第 ${index + 1} 张,牌面 ${value}`
          : `翻开第 ${index + 1} 张暗牌`
      }
      className="card-tilt perspective-card deal-in group relative block aspect-[5/7] w-full rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-felt-800"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div
        className={`card-inner ${revealed ? "rotated" : ""}`}
        style={{ transitionDelay: revealDelay }}
      >
        {/* 牌背 */}
        <div className="card-face rounded-[10px] border-2 border-gold-400/80 bg-cardred-900 shadow-[0_8px_18px_rgba(0,0,0,0.45)]">
          <div className="card-back-pattern absolute inset-[4px] flex items-center justify-center rounded-[6px] border border-gold-300/40">
            <span className="font-display text-2xl select-none text-gold-300/50 md:text-3xl">
              敢
            </span>
          </div>
        </div>

        {/* 牌面 */}
        <div
          className={`card-face card-face-front flex rounded-[10px] border bg-ivory-50 shadow-[0_8px_18px_rgba(0,0,0,0.45)] ${
            isZero ? "border-cardred-500/70" : "border-ivory-300"
          } ${isZero && revealed ? "zero-ring" : ""} ${
            ended && !revealedByPlayer ? "opacity-80 saturate-[0.85]" : ""
          }`}
        >
          {isZero && (
            <div className="pointer-events-none absolute inset-0 rounded-[9px] bg-[radial-gradient(circle_at_center,rgba(194,46,58,0.2),transparent_68%)]" />
          )}
          {/* 左上角标 */}
          <span className="font-display absolute top-1 left-1.5 flex flex-col items-center leading-none">
            <span className={`text-sm md:text-base ${isZero ? "text-cardred-500" : "text-felt-700"}`}>
              {value}
            </span>
            <span className={`text-[10px] md:text-xs ${isZero ? "text-cardred-500" : suitColor}`}>
              {isZero ? "爆" : meta.suit}
            </span>
          </span>
          {/* 右下角标 */}
          <span className="font-display absolute right-1.5 bottom-1 flex rotate-180 flex-col items-center leading-none">
            <span className={`text-sm md:text-base ${isZero ? "text-cardred-500" : "text-felt-700"}`}>
              {value}
            </span>
            <span className={`text-[10px] md:text-xs ${isZero ? "text-cardred-500" : suitColor}`}>
              {isZero ? "爆" : meta.suit}
            </span>
          </span>
          {/* 中央 */}
          <span className="relative flex h-full w-full flex-col items-center justify-center">
            {isZero ? (
              <>
                <span className="font-display text-5xl leading-none text-cardred-500 [text-shadow:0_0_18px_rgba(194,46,58,0.5)] md:text-6xl">
                  0
                </span>
                <span className="mt-1.5 text-[10px] font-bold tracking-[0.35em] text-cardred-500/80">
                  归零
                </span>
              </>
            ) : (
              <>
                <span className="font-display text-4xl leading-none text-felt-700 md:text-5xl">
                  5
                </span>
                <span className={`text-base leading-none md:text-lg ${suitColor}`}>
                  {meta.suit}
                </span>
              </>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
