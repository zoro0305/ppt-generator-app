export interface Milestone {
  label: string;
  date: string; // "YYYY/MM/DD" or "YYYY-MM-DD"
}

export interface Phase {
  label: string;
  start: string;
  end: string;
  icon?: string; // emoji character
}

export interface TimelineData {
  title: string;
  bullets: string[];
  milestones: Milestone[];
  phases: Phase[];
}

export const DEFAULT_DATA: TimelineData = {
  title: "TIMELINE",
  bullets: [
    "Project milestones and key deliverables",
    "Planned schedule for each phase",
  ],
  milestones: [
    { label: "Project Kickoff", date: "2026/01/01" },
    { label: "Design Review",   date: "2026/03/05" },
    { label: "Launch Prep",     date: "2026/05/20" },
  ],
  phases: [
    { label: "Research & Planning",    start: "2026/01/01", end: "2026/02/10", icon: "🔍" },
    { label: "Requirement Definition", start: "2026/02/11", end: "2026/03/02", icon: "📋" },
    { label: "Design & Prototype",     start: "2026/03/03", end: "2026/04/10", icon: "✏️" },
    { label: "Development",            start: "2026/04/11", end: "2026/05/15", icon: "⚙️" },
    { label: "Testing & Launch",       start: "2026/05/16", end: "2026/06/05", icon: "🚀" },
    { label: "Review & Wrap-up",       start: "2026/06/06", end: "2026/06/20", icon: "🏁" },
  ],
};

export function validate(data: TimelineData): string | null {
  if (!data.title.trim()) return "請填寫標題";
  if (data.milestones.length === 0 && data.phases.length === 0)
    return "請至少新增一個里程碑或階段";
  for (const m of data.milestones) {
    if (!m.label.trim() || !m.date.trim())
      return "每個里程碑都需要填寫名稱和日期";
  }
  for (const p of data.phases) {
    if (!p.label.trim() || !p.start.trim() || !p.end.trim())
      return "每個階段都需要填寫名稱和起訖日期";
  }
  return null;
}
