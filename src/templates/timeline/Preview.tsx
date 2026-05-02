"use client";

import { useMemo } from "react";
import {
  dateToRatio,
  ratioToX,
  getDateBounds,
  sortedMilestones,
  sortedPhases,
  TIMELINE,
  MS_STAGGER_THRESHOLD,
  MS_STAGGER_SHIFT,
  AXIS_TOP,
  AXIS_BOTTOM,
  MS_DOT_Y,
  MS_STEM_BOTTOM,
  MS_STEM_TOP,
  MS_DATE_Y,
  MS_LABEL_Y,
  PH_ICON_Y,
  PH_LABEL_Y,
  PH_DATE_Y,
} from "./layout";
import type { TimelineData } from "./schema";

// SVG coordinate system: 1 unit = 0.01 inch → viewBox 1333 × 750
const S = 100;

const DARK_BLUE  = "#1F3A6E";
const LIGHT_BLUE = "#BDD0E9";
const BLACK      = "#111111";
const WHITE      = "#FFFFFF";

const AXIS_LEFT_SVG  = TIMELINE.axisLeft  * S;
const AXIS_RIGHT_SVG = TIMELINE.axisRight * S;
const AXIS_H_SVG     = TIMELINE.axisH     * S;
const AXIS_TOP_SVG   = AXIS_TOP           * S;
const AXIS_BOTTOM_SVG = AXIS_BOTTOM       * S;
const AXIS_Y_SVG     = TIMELINE.axisY     * S;

const MS_CIRCLE_R_SVG    = TIMELINE.msCircleR * S;
const MS_DOT_Y_SVG       = MS_DOT_Y           * S;
const MS_STEM_BOTTOM_SVG = MS_STEM_BOTTOM      * S;
const MS_STEM_TOP_SVG    = MS_STEM_TOP         * S;
const MS_DATE_Y_SVG      = MS_DATE_Y           * S;
const MS_LABEL_Y_SVG     = MS_LABEL_Y          * S;

const PH_ICON_R_SVG  = TIMELINE.phIconR * S;
const PH_ICON_Y_SVG  = PH_ICON_Y        * S;
const PH_LABEL_Y_SVG = PH_LABEL_Y       * S;
const PH_DATE_Y_SVG  = PH_DATE_Y        * S;

const MS_STAGGER_THRESHOLD_SVG = MS_STAGGER_THRESHOLD * S;
const MS_STAGGER_SHIFT_SVG     = MS_STAGGER_SHIFT     * S;

const pt = (p: number) => Math.round((p * S) / 72);
const FS_TITLE    = pt(34);
const FS_BULLET   = pt(18);
const FS_MS_LABEL = pt(14);
const FS_MS_DATE  = pt(12);
const FS_PH_LABEL = pt(14);
const FS_PH_DATE  = pt(12);
const FS_PH_ICON  = pt(16);

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
  data: TimelineData;
}

export default function TimelinePreview({ data }: Props) {
  const computed = useMemo(() => {
    const milestones = sortedMilestones(data.milestones);
    const phases     = sortedPhases(data.phases);

    if (milestones.length === 0 && phases.length === 0) return null;

    const { min: minDate, max: maxDate } = getDateBounds(milestones, phases);

    const totalAxisW = AXIS_RIGHT_SVG - AXIS_LEFT_SVG;
    const phW = phases.length > 0 ? totalAxisW / phases.length : totalAxisW;

    const msLabelSz = dynSvg(14, FS_MS_LABEL, milestones.length);
    const msDateSz  = dynSvg(12, FS_MS_DATE,  milestones.length);
    const phLabelSz = dynSvg(14, FS_PH_LABEL, phases.length);
    const phDateSz  = dynSvg(12, FS_PH_DATE,  phases.length);

    let staggerLevel = 0;
    const msPositioned = milestones.map((ms, i) => {
      const cx     = ratioToX(dateToRatio(ms.date, minDate, maxDate)) * S;
      const prevCx = i > 0
        ? ratioToX(dateToRatio(milestones[i - 1].date, minDate, maxDate)) * S
        : -999;
      if (Math.abs(cx - prevCx) < MS_STAGGER_THRESHOLD_SVG) {
        staggerLevel = staggerLevel === 0 ? 1 : 0;
      } else {
        staggerLevel = 0;
      }
      return { ms, cx, extraUp: staggerLevel * MS_STAGGER_SHIFT_SVG };
    });

    const lastColor = phases.length > 0
      ? (phases.length - 1) % 2 === 0 ? DARK_BLUE : LIGHT_BLUE
      : LIGHT_BLUE;

    const bullets = data.bullets.filter((b) => b.trim());

    return { milestones: msPositioned, phases, phW, lastColor, bullets, msLabelSz, msDateSz, phLabelSz, phDateSz };
  }, [data]);

  if (!computed) return null;

  const { milestones, phases, phW, lastColor, bullets, msLabelSz, msDateSz, phLabelSz, phDateSz } = computed;

  const arrowTip    = AXIS_RIGHT_SVG + 42;
  const arrowPoints = `${AXIS_RIGHT_SVG},${AXIS_TOP_SVG} ${AXIS_RIGHT_SVG},${AXIS_BOTTOM_SVG} ${arrowTip},${AXIS_Y_SVG}`;

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
        <rect x={0} y={0} width={1333} height={750} fill={WHITE} />

        {/* Title */}
        <text x={70} y={28} fontSize={FS_TITLE} fontWeight="bold" fill={BLACK} dominantBaseline="hanging">
          {data.title}
        </text>

        {/* Bullets */}
        {bullets.map((b, i) => (
          <text key={i} x={70} y={100 + i * 44} fontSize={FS_BULLET} fill={BLACK} dominantBaseline="hanging">
            {"●  "}{b}
          </text>
        ))}

        {/* Axis base bar */}
        <rect x={AXIS_LEFT_SVG} y={AXIS_TOP_SVG} width={AXIS_RIGHT_SVG - AXIS_LEFT_SVG} height={AXIS_H_SVG} fill={LIGHT_BLUE} />

        {/* Phase color segments */}
        {phases.map((_, i) => (
          <rect
            key={i}
            x={AXIS_LEFT_SVG + i * phW} y={AXIS_TOP_SVG}
            width={phW} height={AXIS_H_SVG}
            fill={i % 2 === 0 ? DARK_BLUE : LIGHT_BLUE}
          />
        ))}

        {/* Arrow */}
        <polygon points={arrowPoints} fill={lastColor} />

        {/* Phase icons + labels + dates */}
        {phases.map((phase, i) => {
          const cx     = AXIS_LEFT_SVG + (i + 0.5) * phW;
          const isDark = i % 2 === 0;
          const fill   = isDark ? DARK_BLUE : LIGHT_BLUE;
          const txtClr = isDark ? WHITE : DARK_BLUE;
          const labelW = Math.max(phW - 10, 90);

          return (
            <g key={i}>
              <defs>
                <clipPath id={`clip-ph-${i}`}>
                  <rect x={cx - labelW / 2} y={PH_LABEL_Y_SVG - 2} width={labelW} height={60} />
                </clipPath>
              </defs>
              <circle cx={cx} cy={PH_ICON_Y_SVG} r={PH_ICON_R_SVG} fill={fill} stroke={isDark ? "none" : DARK_BLUE} strokeWidth={isDark ? 0 : 1.5} />
              {phase.icon && (
                <text x={cx} y={PH_ICON_Y_SVG} textAnchor="middle" dominantBaseline="central" fontSize={FS_PH_ICON} fill={txtClr}>
                  {phase.icon}
                </text>
              )}
              <text x={cx} y={PH_LABEL_Y_SVG} textAnchor="middle" dominantBaseline="hanging" fontSize={phLabelSz} fontWeight="bold" fill={BLACK} clipPath={`url(#clip-ph-${i})`}>
                {phase.label}
              </text>
              <text x={cx} y={PH_DATE_Y_SVG} textAnchor="middle" dominantBaseline="hanging" fontSize={phDateSz} fill={BLACK}>
                {fmtRange(phase.start, phase.end)}
              </text>
            </g>
          );
        })}

        {/* Milestones */}
        {milestones.map(({ ms, cx, extraUp }, i) => (
          <g key={i}>
            <line x1={cx} y1={MS_STEM_TOP_SVG - extraUp} x2={cx} y2={MS_STEM_BOTTOM_SVG} stroke={BLACK} strokeWidth={2} />
            <circle cx={cx} cy={MS_DOT_Y_SVG} r={MS_CIRCLE_R_SVG} fill={BLACK} />
            <text x={cx} y={MS_DATE_Y_SVG - extraUp} textAnchor="middle" dominantBaseline="hanging" fontSize={msDateSz} fill={BLACK}>
              {ms.date.replace(/-/g, "/")}
            </text>
            <text x={cx} y={MS_LABEL_Y_SVG - extraUp} textAnchor="middle" dominantBaseline="hanging" fontSize={msLabelSz} fontWeight="bold" fill={BLACK}>
              {ms.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
