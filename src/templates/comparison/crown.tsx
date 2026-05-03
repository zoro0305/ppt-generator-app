// Crown icon — flat gold, 3-peak classic crown matching reference design.
// ViewBox 40×26; callers scale by width, compute height via crownHeight().

import { useId } from "react";

export const CROWN_VIEWBOX = { w: 40, h: 26 };

interface CrownProps {
  x: number;
  y: number;
  size: number; // width in target SVG units; height auto-scales
}

export function crownHeight(size: number): number {
  return (size * CROWN_VIEWBOX.h) / CROWN_VIEWBOX.w;
}

export function Crown({ x, y, size }: CrownProps) {
  const id    = useId();
  const scale = size / CROWN_VIEWBOX.w;
  const gBody = `crown-body-${id}`;
  const gBand = `crown-band-${id}`;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        {/* Body: bright gold at top, warm mid, darker base */}
        <linearGradient id={gBody} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F5D060" />
          <stop offset="45%"  stopColor="#D4A020" />
          <stop offset="100%" stopColor="#B07010" />
        </linearGradient>
        {/* Base band: slightly deeper gold */}
        <linearGradient id={gBand} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#C89018" />
          <stop offset="100%" stopColor="#8B5C08" />
        </linearGradient>
      </defs>

      {/*
        Crown body — 3 peaks, center tallest.
        Outer walls rise then angle inward before the first peak.
        Path traces: bottom-left → left wall → left angle → left peak base →
        valley → center peak base → valley → right peak base → right angle →
        right wall → bottom-right → close.
        Circles at each peak tip sit on top (drawn after body).
      */}
      <path
        d={[
          "M 1 25",       // bottom-left
          "L 1 15",       // up left wall
          "L 6 20",       // angle inward
          "L 11 9",       // rise to left peak shoulder
          "L 17 17",      // down to left valley
          "L 20 6",       // rise to center peak shoulder
          "L 23 17",      // down to right valley
          "L 29 9",       // rise to right peak shoulder
          "L 34 20",      // angle inward
          "L 39 15",      // up right wall
          "L 39 25",      // bottom-right
          "Z",
        ].join(" ")}
        fill={`url(#${gBody})`}
        stroke="#9B6E00"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />

      {/* Base band — separates crown body from border edge */}
      <rect
        x={1} y={21.5} width={38} height={3.5} rx={0.8}
        fill={`url(#${gBand})`}
        stroke="#9B6E00" strokeWidth={0.5}
      />

      {/* Peak balls — left, center (largest), right */}
      <circle cx={11} cy={9}  r={3.0} fill={`url(#${gBody})`} stroke="#9B6E00" strokeWidth={0.5} />
      <circle cx={20} cy={6}  r={3.5} fill={`url(#${gBody})`} stroke="#9B6E00" strokeWidth={0.5} />
      <circle cx={29} cy={9}  r={3.0} fill={`url(#${gBody})`} stroke="#9B6E00" strokeWidth={0.5} />

      {/* Specular highlights on each ball */}
      <circle cx={9.8}  cy={7.8}  r={1.0} fill="white" opacity={0.45} />
      <circle cx={18.5} cy={4.5}  r={1.2} fill="white" opacity={0.45} />
      <circle cx={27.8} cy={7.8}  r={1.0} fill="white" opacity={0.45} />
    </g>
  );
}

// ── PPTX embed ────────────────────────────────────────────────────────────────
const CROWN_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 26">
  <defs>
    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5D060"/>
      <stop offset="45%" stop-color="#D4A020"/>
      <stop offset="100%" stop-color="#B07010"/>
    </linearGradient>
    <linearGradient id="gbb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C89018"/>
      <stop offset="100%" stop-color="#8B5C08"/>
    </linearGradient>
  </defs>
  <path d="M 1 25 L 1 15 L 6 20 L 11 9 L 17 17 L 20 6 L 23 17 L 29 9 L 34 20 L 39 15 L 39 25 Z"
    fill="url(#gb)" stroke="#9B6E00" stroke-width="0.6" stroke-linejoin="round"/>
  <rect x="1" y="21.5" width="38" height="3.5" rx="0.8"
    fill="url(#gbb)" stroke="#9B6E00" stroke-width="0.5"/>
  <circle cx="11" cy="9"  r="3.0" fill="url(#gb)" stroke="#9B6E00" stroke-width="0.5"/>
  <circle cx="20" cy="6"  r="3.5" fill="url(#gb)" stroke="#9B6E00" stroke-width="0.5"/>
  <circle cx="29" cy="9"  r="3.0" fill="url(#gb)" stroke="#9B6E00" stroke-width="0.5"/>
  <circle cx="9.8"  cy="7.8"  r="1.0" fill="white" opacity="0.45"/>
  <circle cx="18.5" cy="4.5"  r="1.2" fill="white" opacity="0.45"/>
  <circle cx="27.8" cy="7.8"  r="1.0" fill="white" opacity="0.45"/>
</svg>`;

function toBase64(s: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(s)));
  }
  return Buffer.from(s, "utf-8").toString("base64");
}

export const CROWN_DATA_URI = `data:image/svg+xml;base64,${toBase64(CROWN_SVG_RAW)}`;
