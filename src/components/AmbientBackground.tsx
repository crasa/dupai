interface FloatingSuit {
  glyph: string;
  left: string;
  top: string;
  size: number;
  color: string;
  dur: number;
  delay: number;
  tilt: number;
}

const SUITS: FloatingSuit[] = [
  { glyph: "♠", left: "6%", top: "12%", size: 72, color: "rgba(240,207,135,0.06)", dur: 9, delay: 0, tilt: -12 },
  { glyph: "♥", left: "16%", top: "70%", size: 56, color: "rgba(194,46,58,0.09)", dur: 11, delay: 1.2, tilt: 8 },
  { glyph: "♦", left: "28%", top: "26%", size: 40, color: "rgba(194,46,58,0.08)", dur: 8, delay: 2.1, tilt: -6 },
  { glyph: "♣", left: "40%", top: "84%", size: 64, color: "rgba(240,207,135,0.05)", dur: 12, delay: 0.6, tilt: 14 },
  { glyph: "♠", left: "58%", top: "8%", size: 46, color: "rgba(240,207,135,0.06)", dur: 10, delay: 3, tilt: 6 },
  { glyph: "♥", left: "72%", top: "64%", size: 84, color: "rgba(194,46,58,0.07)", dur: 13, delay: 1.8, tilt: -10 },
  { glyph: "♦", left: "86%", top: "22%", size: 58, color: "rgba(194,46,58,0.08)", dur: 9.5, delay: 0.9, tilt: 12 },
  { glyph: "♣", left: "92%", top: "78%", size: 44, color: "rgba(240,207,135,0.06)", dur: 8.5, delay: 2.6, tilt: -8 },
  { glyph: "♠", left: "48%", top: "46%", size: 110, color: "rgba(240,207,135,0.035)", dur: 14, delay: 0.3, tilt: 4 },
  { glyph: "♥", left: "4%", top: "42%", size: 38, color: "rgba(194,46,58,0.07)", dur: 10.5, delay: 3.4, tilt: -14 },
  { glyph: "♦", left: "64%", top: "88%", size: 36, color: "rgba(240,207,135,0.06)", dur: 9, delay: 1.5, tilt: 10 },
  { glyph: "♣", left: "80%", top: "44%", size: 52, color: "rgba(240,207,135,0.05)", dur: 11.5, delay: 2.2, tilt: -4 },
];

const NOISE_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.55'/></svg>\")";

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* 房间底色:从牌桌上方打下来的光 */}
      <div className="absolute inset-0 bg-[radial-gradient(1100px_680px_at_50%_-12%,#1b4a2f_0%,#0e2a1b_46%,#071810_100%)]" />
      {/* 缓慢漂浮的花色 */}
      {SUITS.map((s, i) => (
        <span
          key={i}
          className="float-suit font-display absolute select-none leading-none"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            color: s.color,
            ["--dur" as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
            ["--tilt" as string]: `${s.tilt}deg`,
          }}
        >
          {s.glyph}
        </span>
      ))}
      {/* 毡布噪点 */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: NOISE_URI }}
      />
      {/* 四周暗角 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(3,10,6,0.8)_100%)]" />
    </div>
  );
}
