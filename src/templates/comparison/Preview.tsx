"use client";

import { useMemo } from "react";
import { COMPARISON } from "./layout";
import type { ComparisonData } from "./schema";

// SVG coordinate system: 1 unit = 0.01 inch → viewBox 1333 × 750
const S = 100;

const DARK_BLUE  = "#1F3A6E";
const LIGHT_BLUE = "#BDD0E9";
const BLACK      = "#111111";
const WHITE      = "#FFFFFF";

const SLIDE_W = 1333;
const SLIDE_H = 750;

// Shared title/bullets positions (mirror src/lib/pptx/theme.ts)
const TITLE_X       = 70;
const TITLE_Y       = 28;
const BULLET_X      = 70;
const BULLET_Y      = 100;
const BULLET_LINE_H = 44;

// Comparison-specific (inches × S)
const TABLE_LEFT       = COMPARISON.marginX        * S;
const TABLE_W          = SLIDE_W - 2 * TABLE_LEFT;
const TABLE_MAX_BOTTOM = COMPARISON.tableMaxBottom * S;
const HEADER_H         = COMPARISON.headerH        * S;
const DIM_COL_W        = TABLE_W * COMPARISON.dimColRatio;
const CELL_PAD_X       = COMPARISON.cellPadX      * S;

// pt → SVG units
const pt = (p: number) => Math.round((p * S) / 72);
const FS_TITLE     = pt(34);
const FS_BULLET    = pt(18);
const FS_HDR_LABEL = pt(COMPARISON.headerLabelSize);
const FS_HDR_ICON  = pt(COMPARISON.headerIconSize);
const FS_DIM_LABEL = pt(COMPARISON.dimLabelSize);
const FS_CELL      = pt(COMPARISON.cellSize);

interface Props {
  data: ComparisonData;
}

export default function ComparisonPreview({ data }: Props) {
  const { intro, optColW, tableTop, rowH } = useMemo(() => {
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
    return { intro, optColW, tableTop, rowH };
  }, [data]);

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
        {/* Background */}
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

        {/* Header background */}
        <rect
          x={TABLE_LEFT} y={tableTop}
          width={TABLE_W} height={HEADER_H}
          fill={DARK_BLUE}
        />

        {/* Header: option icons + labels */}
        {data.options.map((o, i) => {
          const cx = TABLE_LEFT + DIM_COL_W + (i + 0.5) * optColW;
          return (
            <g key={o.id}>
              {o.icon && (
                <text
                  x={cx} y={tableTop + HEADER_H * 0.32}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={FS_HDR_ICON} fill={WHITE}
                >
                  {o.icon}
                </text>
              )}
              <text
                x={cx} y={tableTop + HEADER_H * 0.78}
                textAnchor="middle" dominantBaseline="central"
                fontSize={FS_HDR_LABEL} fontWeight="bold" fill={WHITE}
              >
                {o.label}
              </text>
            </g>
          );
        })}

        {/* Body rows */}
        {data.dimensions.map((d, rowIdx) => {
          const rowY = tableTop + HEADER_H + rowIdx * rowH;
          return (
            <g key={d.id}>
              {rowIdx % 2 === 1 && (
                <rect
                  x={TABLE_LEFT} y={rowY}
                  width={TABLE_W} height={rowH}
                  fill={LIGHT_BLUE}
                />
              )}

              <text
                x={TABLE_LEFT + CELL_PAD_X} y={rowY + rowH / 2}
                textAnchor="start" dominantBaseline="central"
                fontSize={FS_DIM_LABEL} fontWeight="bold" fill={BLACK}
              >
                {d.label}
              </text>

              {data.options.map((o, colIdx) => {
                const cx = TABLE_LEFT + DIM_COL_W + (colIdx + 0.5) * optColW;
                const value = d.values[o.id] ?? "";
                const winner = d.winnerId === o.id;
                return (
                  <text
                    key={o.id}
                    x={cx} y={rowY + rowH / 2}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={FS_CELL} fill={BLACK}
                  >
                    {winner ? `🏆 ${value}` : value}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
