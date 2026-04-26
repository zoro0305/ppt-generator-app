"use client";

import { useState } from "react";
import type { Milestone, Phase } from "@/types/timeline";
import MilestoneFields from "./MilestoneFields";
import PhaseFields from "./PhaseFields";
import BulletFields from "./BulletFields";
import DownloadButton from "./DownloadButton";

const DEFAULT_MILESTONES: Milestone[] = [
  { label: "Project Kickoff", date: "2026/01/01" },
  { label: "Design Review", date: "2026/03/05" },
  { label: "Launch Prep", date: "2026/05/20" },
];

const DEFAULT_PHASES: Phase[] = [
  { label: "Research & Planning",    start: "2026/01/01", end: "2026/02/10", icon: "🔍" },
  { label: "Requirement Definition", start: "2026/02/11", end: "2026/03/02", icon: "📋" },
  { label: "Design & Prototype",     start: "2026/03/03", end: "2026/04/10", icon: "✏️" },
  { label: "Development",            start: "2026/04/11", end: "2026/05/15", icon: "⚙️" },
  { label: "Testing & Launch",       start: "2026/05/16", end: "2026/06/05", icon: "🚀" },
  { label: "Review & Wrap-up",       start: "2026/06/06", end: "2026/06/20", icon: "🏁" },
];

const DEFAULT_BULLETS = [
  "Project milestones and key deliverables",
  "Planned schedule for each phase",
];

export default function TimelineForm() {
  const [title, setTitle] = useState("TIMELINE");
  const [bullets, setBullets] = useState<string[]>(DEFAULT_BULLETS);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!title.trim()) return "請填寫標題";
    if (milestones.length === 0 && phases.length === 0)
      return "請至少新增一個里程碑或階段";
    for (const m of milestones) {
      if (!m.label.trim() || !m.date.trim())
        return "每個里程碑都需要填寫名稱和日期";
    }
    for (const p of phases) {
      if (!p.label.trim() || !p.start.trim() || !p.end.trim())
        return "每個階段都需要填寫名稱和起訖日期";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bullets: bullets.filter((b) => b.trim()),
          milestones,
          phases,
          today: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "伺服器錯誤");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "timeline.pptx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "下載失敗，請重試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h1 className="text-xl font-bold text-slate-800">Timeline 投影片</h1>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          投影片標題
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="TIMELINE"
        />
      </div>

      <BulletFields bullets={bullets} onChange={setBullets} />
      <MilestoneFields milestones={milestones} onChange={setMilestones} />
      <PhaseFields phases={phases} onChange={setPhases} />

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <DownloadButton loading={loading} />
    </form>
  );
}
