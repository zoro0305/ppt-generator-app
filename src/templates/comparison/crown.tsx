// Reusable crown icon for marking the winning cell in a comparison row.
// Single source of truth for both SVG preview and PPTX generation.

export const CROWN_VIEWBOX = { w: 32, h: 24 };

interface CrownProps {
  x: number;
  y: number;
  size: number; // width in target units; height auto-scales
}

export function crownHeight(size: number): number {
  return (size * CROWN_VIEWBOX.h) / CROWN_VIEWBOX.w;
}

export function Crown({ x, y, size }: CrownProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${size / CROWN_VIEWBOX.w})`}>
      <path
        d="M 2 9 L 8 14 L 16 5 L 24 14 L 30 9 L 30 20 L 2 20 Z"
        fill="#E5A93A"
        stroke="#6E4F0C"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
      <rect x={2} y={18} width={28} height={1.2} fill="#6E4F0C" />
      <circle cx={2}  cy={9} r={1.7} fill="#E84C4C" stroke="#6E4F0C" strokeWidth={0.5} />
      <circle cx={16} cy={5} r={2.0} fill="#3FB6F2" stroke="#6E4F0C" strokeWidth={0.5} />
      <circle cx={30} cy={9} r={1.7} fill="#5BC267" stroke="#6E4F0C" strokeWidth={0.5} />
      <ellipse cx={11} cy={9} rx={1.0} ry={0.6} fill="#FFF1B8" opacity={0.7} />
    </g>
  );
}

// Raw SVG markup for embedding into PPTX as an image.
const CROWN_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24">
  <path d="M 2 9 L 8 14 L 16 5 L 24 14 L 30 9 L 30 20 L 2 20 Z" fill="#E5A93A" stroke="#6E4F0C" stroke-width="0.8" stroke-linejoin="round"/>
  <rect x="2" y="18" width="28" height="1.2" fill="#6E4F0C"/>
  <circle cx="2" cy="9" r="1.7" fill="#E84C4C" stroke="#6E4F0C" stroke-width="0.5"/>
  <circle cx="16" cy="5" r="2.0" fill="#3FB6F2" stroke="#6E4F0C" stroke-width="0.5"/>
  <circle cx="30" cy="9" r="1.7" fill="#5BC267" stroke="#6E4F0C" stroke-width="0.5"/>
  <ellipse cx="11" cy="9" rx="1.0" ry="0.6" fill="#FFF1B8" opacity="0.7"/>
</svg>`;

function toBase64(s: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(s)));
  }
  // Node/build-time fallback
  return Buffer.from(s, "utf-8").toString("base64");
}

export const CROWN_DATA_URI = `data:image/svg+xml;base64,${toBase64(CROWN_SVG_RAW)}`;
