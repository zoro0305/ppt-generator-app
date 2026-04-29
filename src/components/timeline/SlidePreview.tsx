"use client";

import { useMemo } from "react";
import {
  dateToRatio,
  ratioToX,
  getDateBounds,
  sortedMilestones,
  sortedPhases,
} from "@/lib/pptx/timelineLayout";
import type { TimelineInput } from "@/types/timeline";

// SVG coordinate system: 1 unit = 0.01 inch → viewBox 1333 × 750 (= 13.33" × 7.5")
const S = 100;

// Colors
const DARK_BLUE  = "#1F3A6E";
const LIGHT_BLUE = "#BDD0E9";
const BLACK      = "#111111";
const WHITE      = "#FFFFFF";

// Axis geometry (inches × S = SVG units)
const AXIS_LEFT   = 75;
const AXIS_RIGHT  = 1230;
const AXIS_Y      = 365;
const AXIS_H      = 20;
const AXIS_TOP    = AXIS_Y - AXIS_H / 2;   // 355
const AXIS_BOTTOM = AXIS_Y + AXIS_H / 2;   // 375

// Milestone geometry
const MS_CIRCLE_R    = 8;
const MS_AXIS_GAP    = 7;
const MS_DOT_Y       = AXIS_TOP - MS_AXIS_GAP - MS_CIRCLE_R; // 340
const MS_STEM_BOTTOM = MS_DOT_Y - MS_CIRCLE_R;               // 332
const MS_STEM_H      = 42;
const MS_STEM_TOP    = MS_STEM_BOTTOM - MS_STEM_H;            // 290
const MS_DATE_Y      = MS_STEM_TOP - 28 - 4;                  // 258
const MS_LABEL_Y     = MS_DATE_Y  - 36 - 4;                   // 218

// Phase geometry
const PH_ICON_R   = 30;
const PH_ICON_GAP = 28;
const PH_ICON_Y   = AXIS_BOTTOM + PH_ICON_GAP + PH_ICON_R;   // 433
const PH_LABEL_Y  = PH_ICON_Y + PH_ICON_R + 10;               // 473
const PH_DATE_Y   = PH_LABEL_Y + 34;                           // 507

// Stagger constants
const MS_STAGGER_THRESHOLD = 140; // 1.4" × S
const MS_STAGGER_SHIFT     = 45;  // 0.45" × S

// Font sizes: pt × S/72 → SVG units
const pt = (p: number) => Math.round((p * S) / 72);
const FS_TITLE    = pt(34); // 47
const FS_BULLET   = pt(18); // 25
const FS_MS_LABEL = pt(14); // 19
const FS_MS_DATE  = pt(12); // 17
const FS_PH_LABEL = pt(14); // 19
const FS_PH_DATE  = pt(12); // 17
const FS_PH_ICON  = pt(16); // 22

function dynSvg(basePt: number, baseSvg: number, count: number): number {
  if (count <= 4) return baseSvg;
  if (count <= 6) return pt(basePt - 1);
  return pt(basePt - 2);
}

function fmtRange(start: string, end: string): string {
  const s = start.replace(/-/g, "/");
  const e = end.replace(/-/g, "/");
  return s.slice(0, 4) === e.slice(0, 4) ? `${s} - ${e.slice(5)}` : `${s} - ${e}`;
}

interface Props {
  input: TimelineInput;
}

export default function SlidePreview({ input }: Props) {
  const data = useMemo(() => {
    const milestones = sortedMilestones(input.milestones);
    const phases     = sortedPhases(input.phases);

    if (milestones.length === 0 && phases.length === 0) return null;

    const { min: minDate, max: maxDate } = getDateBounds(milestones, phases);

    const totalAxisW = AXIS_RIGHT - AXIS_LEFT;
    const phW = phases.length > 0 ? totalAxisW / phases.length : totalAxisW;

    const msLabelSz = dynSvg(14, FS_MS_LABEL, milestones.length);
    const msDateSz  = dynSvg(12, FS_MS_DATE,  milestones.length);
    const phLabelSz = dynSvg(14, FS_PH_LABEL, phases.length);
    const phDateSz  = dynSvg(12, FS_PH_DATE,  phases.length);

    // Compute milestone x positions + stagger
    let staggerLevel = 0;
    const msPositioned = milestones.map((ms, i) => {
      const cx     = ratioToX(dateToRatio(ms.date, minDate, maxDate)) * S;
      const prevCx = i > 0
        ? ratioToX(dateToRatio(milestones[i - 1].date, minDate, maxDate)) * S
        : -999;
      if (Math.abs(cx - prevCx) < MS_STAGGER_THRESHOLD) {
        staggerLevel = staggerLevel === 0 ? 1 : 0;
      } else {
        staggerLevel = 0;
      }
      return { ms, cx, extraUp: staggerLevel * MS_STAGGER_SHIFT };
    });

    const lastColor = phases.length > 0
      ? (phases.length - 1) % 2 === 0 ? DARK_BLUE : LIGHT_BLUE
      : LIGHT_BLUE;

    const title   = input.title || "TIMELINE";
    const bullets = (input.bullets ?? []).filter((b) => b.trim());

    return { milestones: msPositioned, phases, phW, title, bullets, lastColor, msLabelSz, msDateSz, phLabelSz, phDateSz };
  }, [input]);

  if (!data) return null;

  const { milestones, phases, phW, title, bullets, lastColor, msLabelSz, msDateSz, phLabelSz, phDateSz } = data;

  // Arrow polygon: filled triangle at the right end of the axis
  const arrowTip = AXIS_RIGHT + 42;
  const arrowPoints = `${AXIS_RIGHT},${AXIS_TOP} ${AXIS_RIGHT},${AXIS_BOTTOM} ${arrowTip},${AXIS_Y}`;

  return (
    <div
      className="w-full overflow-hidden rounded-lg shadow-lg"
      style={{ aspectRatio: "16/9", background: WHITE }}
    >
      <svg
        viewBox="0 0 1333 750"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
        fontFamily="Arial, 'Microsoft JhengHei', sans-serif"
      >
        {/* Background */}
        <rect x={0} y={0} width={1333} height={750} fill={WHITE} />

        {/* Title */}
        <text
          x={THEME_TITLE_X}
          y={THEME_TITLE_Y}
          fontSize={FS_TITLE}
          fontWeight="bold"
          fill={BLACK}
          dominantBaseline="hanging"
        >
          {title}
        </text>

        {/* Bullet points */}
        {bullets.map((b, i) => (
          <text
            key={i}
            x={70}
            y={100 + i * 44}
            fontSize={FS_BULLET}
            fill={BLACK}
            dominantBaseline="hanging"
          >
            {"●  "}{b}
          </text>
        ))}

        {/* Axis base bar */}
        <rect
          x={AXIS_LEFT} y={AXIS_TOP}
          width={AXIS_RIGHT - AXIS_LEFT} height={AXIS_H}
          fill={LIGHT_BLUE}
        />

        {/* Phase color segments */}
        {phases.map((_, i) => (
          <rect
            key={i}
            x={AXIS_LEFT + i * phW} y={AXIS_TOP}
            width={phW} height={AXIS_H}
            fill={i % 2 === 0 ? DARK_BLUE : LIGHT_BLUE}
          />
        ))}

        {/* Arrow at axis end */}
        <polygon points={arrowPoints} fill={lastColor} />

        {/* Phase icons + labels + dates */}
        {phases.map((phase, i) => {
          const cx      = AXIS_LEFT + (i + 0.5) * phW;
          const isDark  = i % 2 === 0;
          const fill    = isDark ? DARK_BLUE : LIGHT_BLUE;
          const txtClr  = isDark ? WHITE : DARK_BLUE;
          const labelW  = Math.max(phW - 10, 90);

          return (
            <g key={i}>
              <circle
                cx={cx} cy={PH_ICON_Y} r={PH_ICON_R}
                fill={fill}
                stroke={isDark ? "none" : DARK_BLUE}
                strokeWidth={isDark ? 0 : 1.5}
              />
              {phase.icon && (
                <text
                  x={cx} y={PH_ICON_Y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={FS_PH_ICON}
                  fill={txtClr}
                >
                  {phase.icon}
                </text>
              )}
              <text
                x={cx} y={PH_LABEL_Y}
                textAnchor="middle" dominantBaseline="hanging"
                fontSize={phLabelSz} fontWeight="bold"
                fill={BLACK}
                clipPath={`url(#clip-ph-${i})`}
              >
                {phase.label}
              </text>
              <text
                x={cx} y={PH_DATE_Y}
                textAnchor="middle" dominantBaseline="hanging"
                fontSize={phDateSz}
                fill={BLACK}
              >
                {fmtRange(phase.start, phase.end)}
              </text>
              {/* Invisible clip so labels don't bleed into neighbours */}
              <defs>
                <clipPath id={`clip-ph-${i}`}>
                  <rect
                    x={cx - labelW / 2} y={PH_LABEL_Y - 2}
                    width={labelW} height={60}
                  />
                </clipPath>
              </defs>
            </g>
          );
        })}

        {/* Milestones */}
        {milestones.map(({ ms, cx, extraUp }, i) => (
          <g key={i}>
            {/* Stem */}
            <line
              x1={cx} y1={MS_STEM_TOP - extraUp}
              x2={cx} y2={MS_STEM_BOTTOM}
              stroke={BLACK} strokeWidth={2}
            />
            {/* Dot */}
            <circle cx={cx} cy={MS_DOT_Y} r={MS_CIRCLE_R} fill={BLACK} />
            {/* Date */}
            <text
              x={cx} y={MS_DATE_Y - extraUp}
              textAnchor="middle" dominantBaseline="hanging"
              fontSize={msDateSz} fill={BLACK}
            >
              {ms.date.replace(/-/g, "/")}
            </text>
            {/* Label */}
            <text
              x={cx} y={MS_LABEL_Y - extraUp}
              textAnchor="middle" dominantBaseline="hanging"
              fontSize={msLabelSz} fontWeight="bold" fill={BLACK}
            >
              {ms.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Keep title position constants alongside the component for clarity
const THEME_TITLE_X = 70;
const THEME_TITLE_Y = 28;
