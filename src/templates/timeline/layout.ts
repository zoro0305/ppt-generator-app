import type { Milestone, Phase } from "@/types/timeline";

// Timeline-specific geometry (inches) and typography (pt).
export const TIMELINE = {
  // Axis
  axisY:     3.65,
  axisLeft:  0.75,
  axisRight: 12.30, // bars end here; arrow extends past
  axisH:     0.20,

  // Milestone dot
  msCircleR:   0.08,
  msAxisGap:   0.07, // gap between axis top and dot bottom
  msStemWidth: 2,    // pt
  msStemH:     0.42,

  // Phase icon
  phIconR:   0.30,
  phIconGap: 0.28, // axis-bottom → icon top

  // Typography (pt)
  msLabelSize: 14,
  msDateSize:  12,
  phLabelSize: 14,
  phDateSize:  12,
  phIconSize:  16,
} as const;

// Stagger constants: when two milestones are < threshold apart, lift one upward.
export const MS_STAGGER_THRESHOLD = 1.4;  // inches
export const MS_STAGGER_SHIFT     = 0.45; // inches

// ── Derived layout constants ─────────────────────────────────────────────────
export const AXIS_TOP    = TIMELINE.axisY - TIMELINE.axisH / 2;   // 3.55
export const AXIS_BOTTOM = TIMELINE.axisY + TIMELINE.axisH / 2;   // 3.75

// Milestone dot center: sits above axis with a small gap
export const MS_DOT_Y       = AXIS_TOP - TIMELINE.msAxisGap - TIMELINE.msCircleR;  // 3.40
export const MS_STEM_BOTTOM = MS_DOT_Y - TIMELINE.msCircleR;                       // 3.32
export const MS_STEM_TOP    = MS_STEM_BOTTOM - TIMELINE.msStemH;                   // 2.90

export const MS_DATE_H  = 0.28;
export const MS_DATE_Y  = MS_STEM_TOP - MS_DATE_H - 0.04;   // 2.58
export const MS_LABEL_H = 0.36;
export const MS_LABEL_Y = MS_DATE_Y - MS_LABEL_H - 0.04;    // 2.18

// Phase icon: fixed Y, no stem
export const PH_ICON_Y  = AXIS_BOTTOM + TIMELINE.phIconGap + TIMELINE.phIconR; // 4.33
export const PH_LABEL_Y = PH_ICON_Y + TIMELINE.phIconR + 0.10;                 // 4.73
export const PH_DATE_Y  = PH_LABEL_Y + 0.34;                                    // 5.07

// ── Date utilities ───────────────────────────────────────────────────────────
export function parseDate(s: string): Date {
  // Accept "YYYY/MM/DD" or "YYYY-MM-DD"
  return new Date(s.replace(/\//g, "-"));
}

export function dateToRatio(date: string, minDate: Date, maxDate: Date): number {
  const t = parseDate(date).getTime();
  const min = minDate.getTime();
  const max = maxDate.getTime();
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (t - min) / (max - min)));
}

export function ratioToX(ratio: number): number {
  const axisWidth = TIMELINE.axisRight - TIMELINE.axisLeft - 0.3; // leave room for arrowhead
  return TIMELINE.axisLeft + ratio * axisWidth;
}

export function getDateBounds(milestones: Milestone[], phases: Phase[]): { min: Date; max: Date } {
  const dates: Date[] = [
    ...milestones.map((m) => parseDate(m.date)),
    ...phases.flatMap((p) => [parseDate(p.start), parseDate(p.end)]),
  ];
  return {
    min: new Date(Math.min(...dates.map((d) => d.getTime()))),
    max: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };
}

export function sortedMilestones(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );
}

export function sortedPhases(phases: Phase[]): Phase[] {
  return [...phases].sort(
    (a, b) => parseDate(a.start).getTime() - parseDate(b.start).getTime()
  );
}
