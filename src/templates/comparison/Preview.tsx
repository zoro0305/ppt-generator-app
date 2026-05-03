"use client";

import { useMemo } from "react";
import { COMPARISON } from "./layout";
import { Crown } from "./crown";
import type { ComparisonData } from "./schema";

// SVG coordinate system: 1 unit = 0.01 inch → viewBox 1333 × 750
const S = 100;

const DARK_BLUE  = "#1F3A6E";
const LIGHT_BLUE = "#D6E4F4";  // slightly lighter for cleaner look
const BLACK      = "#111111";
const WHITE      = "#FFFFFF";
const GRID_COLOR = "#8DA3BC";  // subtle blue-gray grid lines
const FRAME_R    = 10;         // SVG units — rounded corner radius

const SLIDE_W = 1333;
const SLIDE_H = 750;

const TITLE_X       = 70;
const TITLE_Y       = 28;
const BULLET_X      = 70;
const BULLET_Y      = 100;
const BULLET_LINE_H = 44;

const TABLE_LEFT       = COMPARISON.marginX        * S;
const TABLE_W          = SLIDE_W - 2 * TABLE_LEFT;
const TABLE_MAX_BOTTOM = COMPARISON.tableMaxBottom * S;
const HEADER_H         = COMPARISON.headerH        * S;
const DIM_COL_W        = TABLE_W * COMPARISON.dimColRatio;
const CELL_PAD_X       = COMPARISON.cellPadX      * S;
const CROWN_W          = COMPARISON.crownW        * S;
const CROWN_PAD_X      = COMPARISON.crownPadX     * S;
const CROWN_PAD_Y      = COMPARISON.crownPadY     * S;
const GRID_W           = 0.7;  // SVG stroke-width for internal grid

const pt = (p: number) => Math.round((p * S) / 72);
const FS_TITLE     = pt(34);
const FS_BULLET    = pt(18);
const FS_HDR_LABEL = pt(COMPARISON.headerLabelSize);
const FS_DIM_LABEL = pt(COMPARISON.dimLabelSize);
const FS_CELL      = pt(COMPARISON.cellSize);

interface Props {
  data: ComparisonData;
}

export default function ComparisonPreview({ data }: Props) {
  const { intro, optColW, tableTop, rowH, tableH } = useMemo(() => {
    const intro    = data.intro.filter((b) => b.trim());
    const optColW  = (TABLE_W - DIM_COL_W) / Math.max(data.options.length, 1);
    const tableTop = intro.length > 0
      ? BULLET_Y + intro.length * BULLET_LINE_H + 20
      : 140;
    const tableH = TABLE_MAX_BOTTOM - tableTop;
    const bodyH  = tableH - HEADER_H;
    const rowH   = data.dimensions.length > 0
      ? bodyH / data.dimensions.length
      : bodyH;
    return { intro, optColW, tableTop, rowH, tableH };
  }, [data]);

  const clipId = "table-clip";

  return (
    <div
      className="w-full overflow-hidden rounded-lg shadow-lg"
      style={{ aspectRatio: "16/9", background: WHITE }}
    >
      <svg
        viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
        fontFamily="Arial, 'Microsoft JhengHei', sans-serif"
      >
        <defs>
          {/* Clip all table fills to rounded rect so nothing overflows corners */}
          <clipPath id={clipId}>
            <rect
              x={TABLE_LEFT} y={tableTop}
              width={TABLE_W} height={tableH}
              rx={FRAME_R} ry={FRAME_R}
            />
          </clipPath>
        </defs>

        <rect x={0} y={0} width={SLIDE_W} height={SLIDE_H} fill={WHITE} />

        {/* Title */}
        <text
          x={TITLE_X} y={TITLE_Y}
          fontSize={FS_TITLE} fontWeight="bold" fill={BLACK}
          dominantBaseline="hanging"
        >
          {data.title}
        </text>

        {/* Intro bullets */}
        {intro.map((b, i) => (
          <text
            key={i}
            x={BULLET_X} y={BULLET_Y + i * BULLET_LINE_H}
            fontSize={FS_BULLET} fill={BLACK}
            dominantBaseline="hanging"
          >
            {"●  "}{b}
          </text>
        ))}

        {/* Table — all fills clipped to rounded rect */}
        <g clipPath={`url(#${clipId})`}>
          {/* White base */}
          <rect
            x={TABLE_LEFT} y={tableTop}
            width={TABLE_W} height={tableH}
            fill={WHITE}
          />

          {/* Header background */}
          <rect
            x={TABLE_LEFT} y={tableTop}
            width={TABLE_W} height={HEADER_H}
            fill={DARK_BLUE}
          />

          {/* Alternating row fills */}
          {data.dimensions.map((d, rowIdx) => {
            const rowY = tableTop + HEADER_H + rowIdx * rowH;
            return rowIdx % 2 === 1 ? (
              <rect key={d.id}
                x={TABLE_LEFT} y={rowY}
                width={TABLE_W} height={rowH}
                fill={LIGHT_BLUE}
              />
            ) : null;
          })}
        </g>

        {/* Header labels */}
        {data.options.map((o, i) => {
          const cx = TABLE_LEFT + DIM_COL_W + (i + 0.5) * optColW;
          return (
            <text
              key={o.id}
              x={cx} y={tableTop + HEADER_H / 2}
              textAnchor="middle" dominantBaseline="central"
              fontSize={FS_HDR_LABEL} fontWeight="bold" fill={WHITE}
            >
              {o.label}
            </text>
          );
        })}

        {/* Body rows: dimension labels + cells + crowns */}
        {data.dimensions.map((d, rowIdx) => {
          const rowY = tableTop + HEADER_H + rowIdx * rowH;
          return (
            <g key={d.id}>
              {/* Dimension label — dark blue bold */}
              <text
                x={TABLE_LEFT + CELL_PAD_X} y={rowY + rowH / 2}
                textAnchor="start" dominantBaseline="central"
                fontSize={FS_DIM_LABEL} fontWeight="bold" fill={DARK_BLUE}
              >
                {d.label}
              </text>

              {data.options.map((o, colIdx) => {
                const cellX = TABLE_LEFT + DIM_COL_W + colIdx * optColW;
                const cx = cellX + optColW / 2;
                const value = d.values[o.id] ?? "";
                const isWinner = d.winnerIds?.includes(o.id) ?? false;
                return (
                  <g key={o.id}>
                    <text
                      x={cx} y={rowY + rowH / 2}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={FS_CELL} fill={BLACK}
                    >
                      {value}
                    </text>
                    {isWinner && (
                      <Crown
                        x={cellX + optColW - CROWN_W - CROWN_PAD_X}
                        y={rowY + CROWN_PAD_Y}
                        size={CROWN_W}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Grid lines — drawn above fills but clipped so they don't bleed outside rounded frame */}
        <g clipPath={`url(#${clipId})`}>
          {/* Header bottom */}
          <line
            x1={TABLE_LEFT} y1={tableTop + HEADER_H}
            x2={TABLE_LEFT + TABLE_W} y2={tableTop + HEADER_H}
            stroke={GRID_COLOR} strokeWidth={GRID_W}
          />
          {/* Horizontal row separators */}
          {data.dimensions.slice(1).map((_, i) => {
            const y = tableTop + HEADER_H + (i + 1) * rowH;
            return (
              <line key={`h-${i}`}
                x1={TABLE_LEFT} y1={y}
                x2={TABLE_LEFT + TABLE_W} y2={y}
                stroke={GRID_COLOR} strokeWidth={GRID_W}
              />
            );
          })}
          {/* Vertical: dim column boundary */}
          <line
            x1={TABLE_LEFT + DIM_COL_W} y1={tableTop}
            x2={TABLE_LEFT + DIM_COL_W} y2={tableTop + tableH}
            stroke={GRID_COLOR} strokeWidth={GRID_W}
          />
          {/* Vertical: between option columns */}
          {data.options.slice(1).map((_, i) => {
            const x = TABLE_LEFT + DIM_COL_W + (i + 1) * optColW;
            return (
              <line key={`v-${i}`}
                x1={x} y1={tableTop}
                x2={x} y2={tableTop + tableH}
                stroke={GRID_COLOR} strokeWidth={GRID_W}
              />
            );
          })}
        </g>

        {/* Outer frame — rounded rect, drawn last as a crisp border */}
        <rect
          x={TABLE_LEFT} y={tableTop}
          width={TABLE_W} height={tableH}
          rx={FRAME_R} ry={FRAME_R}
          fill="none"
          stroke={DARK_BLUE} strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}
