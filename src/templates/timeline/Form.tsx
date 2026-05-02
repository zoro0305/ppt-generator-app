"use client";

import type { TimelineData } from "./schema";
import BulletFields from "@/components/common/BulletFields";
import MilestoneFields from "./MilestoneFields";
import PhaseFields from "./PhaseFields";

interface Props {
  data: TimelineData;
  onChange: (d: TimelineData) => void;
}

export default function TimelineFormFields({ data, onChange }: Props) {
  function set<K extends keyof TimelineData>(key: K, value: TimelineData[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <>
      <h1 className="text-xl font-bold text-slate-800">Timeline 投影片</h1>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          投影片標題
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="TIMELINE"
        />
      </div>

      <BulletFields bullets={data.bullets} onChange={(v) => set("bullets", v)} />
      <MilestoneFields milestones={data.milestones} onChange={(v) => set("milestones", v)} />
      <PhaseFields phases={data.phases} onChange={(v) => set("phases", v)} />
    </>
  );
}
