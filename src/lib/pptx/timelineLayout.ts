import { THEME } from "./theme";
import type { Milestone, Phase } from "@/types/timeline";

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
  const axisWidth = THEME.axisRight - THEME.axisLeft - 0.3; // leave room for arrowhead
  return THEME.axisLeft + ratio * axisWidth;
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
