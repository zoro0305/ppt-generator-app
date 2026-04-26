"use client";

import type { Milestone } from "@/types/timeline";

interface Props {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

export default function MilestoneFields({ milestones, onChange }: Props) {
  function update(index: number, field: keyof Milestone, value: string) {
    const next = milestones.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    onChange(next);
  }

  function add() {
    onChange([...milestones, { label: "", date: "" }]);
  }

  function remove(index: number) {
    onChange(milestones.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-2">
        里程碑 Milestones
      </h2>
      <div className="space-y-2">
        {milestones.map((ms, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名稱 Label"
              value={ms.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <input
              className="w-36 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY/MM/DD"
              value={ms.date}
              onChange={(e) => update(i, "date", e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-slate-400 hover:text-red-500 text-lg leading-none"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        + 新增里程碑
      </button>
    </section>
  );
}
