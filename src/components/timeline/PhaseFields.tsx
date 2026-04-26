"use client";

import type { Phase } from "@/types/timeline";

interface Props {
  phases: Phase[];
  onChange: (phases: Phase[]) => void;
}

export default function PhaseFields({ phases, onChange }: Props) {
  function update(index: number, field: keyof Phase, value: string) {
    const next = phases.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(next);
  }

  function add() {
    onChange([...phases, { label: "", start: "", end: "" }]);
  }

  function remove(index: number) {
    onChange(phases.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-2">
        階段 Phases
      </h2>
      <div className="space-y-2">
        {phases.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名稱 Label"
              value={p.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <input
              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="開始 YYYY/MM/DD"
              value={p.start}
              onChange={(e) => update(i, "start", e.target.value)}
            />
            <input
              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="結束 YYYY/MM/DD"
              value={p.end}
              onChange={(e) => update(i, "end", e.target.value)}
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
        + 新增階段
      </button>
    </section>
  );
}
