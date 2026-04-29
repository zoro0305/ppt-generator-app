"use client";

import { useState } from "react";
import type { Milestone, Phase, TimelineInput } from "@/types/timeline";
import MilestoneFields from "./MilestoneFields";
import PhaseFields from "./PhaseFields";
import BulletFields from "./BulletFields";
import DownloadButton from "./DownloadButton";
import SlidePreview from "./SlidePreview";
import { generateTimelineClient } from "@/lib/pptx/generateTimelineClient";

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
  const [title, setTitle]           = useState("TIMELINE");
  const [bullets, setBullets]       = useState<string[]>(DEFAULT_BULLETS);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [phases, setPhases]         = useState<Phase[]>(DEFAULT_PHASES);
  const [error, setError]           = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function buildInput(): TimelineInput {
    return {
      title,
      bullets: bullets.filter((b) => b.trim()),
      milestones,
      phases,
    };
  }

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setShowPreview(true);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await generateTimelineClient(buildInput());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "timeline.pptx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "下載失敗，請重試");
      setShowPreview(false);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
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

        <DownloadButton />
      </form>

      {/* Preview modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="flex w-full max-w-5xl flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">投影片預覽</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            {/* Slide preview */}
            <SlidePreview input={buildInput()} />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                繼續編輯
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
              >
                {downloading ? "生成中..." : "下載 .pptx"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
