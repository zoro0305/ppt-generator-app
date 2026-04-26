export interface Milestone {
  label: string;
  date: string; // "YYYY/MM/DD" or "YYYY-MM-DD"
}

export interface Phase {
  label: string;
  start: string;
  end: string;
}

export interface TimelineInput {
  title?: string;
  bullets?: string[];
  milestones: Milestone[];
  phases: Phase[];
  today?: string; // ISO date string; server uses this instead of new Date()
}
