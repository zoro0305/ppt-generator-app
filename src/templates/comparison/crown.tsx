// Reusable crown icon — single source of truth for SVG preview and PPTX.
// ViewBox 28×20; designed at this ratio so callers can scale by width and
// compute height via crownHeight().

export const CROWN_VIEWBOX = { w: 28, h: 20 };

interface CrownProps {
  x: number;
  y: number;
  size: number; // width in SVG-unit space; height auto-scales
}

export function crownHeight(size: number): number {
  return (size * CROWN_VIEWBOX.h) / CROWN_VIEWBOX.w;
}

export function Crown({ x, y, size }: CrownProps) {
  const scale = size / CROWN_VIEWBOX.w;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id="cg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FFE566" />
          <stop offset="55%"  stopColor="#E8A020" />
          <stop offset="100%" stopColor="#B86800" />
        </linearGradient>
        <linearGradient id="cg-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D4820C" />
          <stop offset="100%" stopColor="#8B4800" />
        </linearGradient>
      </defs>

      {/* Crown body — 3 peaks, center tallest */}
      <path
        d="M 2 18 L 4 9 L 10 14 L 14 4 L 18 14 L 24 9 L 26 18 Z"
        fill="url(#cg-body)"
        stroke="#7A4800"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      {/* Base band */}
      <rect
        x={2} y={15.5} width={24} height={2.5} rx={0.5}
        fill="url(#cg-base)"
        stroke="#7A4800" strokeWidth={0.5}
      />
      {/* Highlight shimmer */}
      <ellipse cx={13} cy={13} rx={4.5} ry={1.8} fill="#FFF9C4" opacity={0.4} />

      {/* Left gem — ruby */}
      <circle cx={4}  cy={9} r={1.8} fill="#E03030" stroke="#7A0000" strokeWidth={0.3} />
      <circle cx={4.6} cy={8.4} r={0.5} fill="white" opacity={0.55} />

      {/* Center gem — sapphire (largest) */}
      <circle cx={14} cy={4} r={2.2} fill="#4FC3F7" stroke="#0070B0" strokeWidth={0.3} />
      <circle cx={14.7} cy={3.3} r={0.6} fill="white" opacity={0.55} />

      {/* Right gem — emerald */}
      <circle cx={24} cy={9} r={1.8} fill="#43A047" stroke="#1B5E20" strokeWidth={0.3} />
      <circle cx={24.6} cy={8.4} r={0.5} fill="white" opacity={0.55} />
    </g>
  );
}

// ── PPTX embed ────────────────────────────────────────────────────────────────
// Raw SVG for base64 embedding via pptxgenjs addImage().
const CROWN_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 20">
  <defs>
    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE566"/>
      <stop offset="55%" stop-color="#E8A020"/>
      <stop offset="100%" stop-color="#B86800"/>
    </linearGradient>
    <linearGradient id="gbb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D4820C"/>
      <stop offset="100%" stop-color="#8B4800"/>
    </linearGradient>
  </defs>
  <path d="M 2 18 L 4 9 L 10 14 L 14 4 L 18 14 L 24 9 L 26 18 Z" fill="url(#gb)" stroke="#7A4800" stroke-width="0.6" stroke-linejoin="round"/>
  <rect x="2" y="15.5" width="24" height="2.5" rx="0.5" fill="url(#gbb)" stroke="#7A4800" stroke-width="0.5"/>
  <ellipse cx="13" cy="13" rx="4.5" ry="1.8" fill="#FFF9C4" opacity="0.4"/>
  <circle cx="4" cy="9" r="1.8" fill="#E03030" stroke="#7A0000" stroke-width="0.3"/>
  <circle cx="4.6" cy="8.4" r="0.5" fill="white" opacity="0.55"/>
  <circle cx="14" cy="4" r="2.2" fill="#4FC3F7" stroke="#0070B0" stroke-width="0.3"/>
  <circle cx="14.7" cy="3.3" r="0.6" fill="white" opacity="0.55"/>
  <circle cx="24" cy="9" r="1.8" fill="#43A047" stroke="#1B5E20" stroke-width="0.3"/>
  <circle cx="24.6" cy="8.4" r="0.5" fill="white" opacity="0.55"/>
</svg>`;

function toBase64(s: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(s)));
  }
  return Buffer.from(s, "utf-8").toString("base64");
}

export const CROWN_DATA_URI = `data:image/svg+xml;base64,${toBase64(CROWN_SVG_RAW)}`;
