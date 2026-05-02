"use client";

import type { ComparisonDimension, ComparisonOption } from "./schema";
import { MAX_DIMENSIONS, MIN_DIMENSIONS } from "./schema";

interface Props {
  options: ComparisonOption[];
  dimensions: ComparisonDimension[];
  onChange: (dimensions: ComparisonDimension[]) => void;
}

function newId() {
  return `dim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function DimensionFields({ options, dimensions, onChange }: Props) {
  function update(index: number, next: ComparisonDimension) {
    onChange(dimensions.map((d, i) => (i === index ? next : d)));
  }

  function add() {
    const values: Record<string, string> = {};
    for (const o of options) values[o.id] = "";
    onChange([...dimensions, { id: newId(), label: "", values, winnerId: undefined }]);
  }

  function remove(index: number) {
    onChange(dimensions.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-2">
        比較維度 Dimensions ({MIN_DIMENSIONS}–{MAX_DIMENSIONS})
      </h2>
      <div className="space-y-3">
        {dimensions.map((d, i) => (
          <div key={d.id} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50">
            {/* Header: label + winner + delete */}
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="維度名稱（例：學習曲線）"
                value={d.label}
                onChange={(e) => update(i, { ...d, label: e.target.value })}
              />
              <select
                className="w-40 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={d.winnerId ?? ""}
                onChange={(e) => update(i, { ...d, winnerId: e.target.value || undefined })}
                title="選擇此維度的勝者（會加上 🏆）"
              >
                <option value="">勝者：—</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    🏆 {o.label || "(未命名)"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-slate-400 hover:text-red-500 text-lg leading-none"
                aria-label="Remove"
              >
                ×
              </button>
            </div>

            {/* Per-option cell inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 border-l-2 border-slate-200">
              {options.map((o) => (
                <div key={o.id} className="flex gap-2 items-center">
                  <span className="w-24 shrink-0 truncate text-xs text-slate-600">
                    {o.icon} {o.label || "(未命名)"}
                  </span>
                  <input
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="值"
                    value={d.values[o.id] ?? ""}
                    onChange={(e) =>
                      update(i, { ...d, values: { ...d.values, [o.id]: e.target.value } })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        + 新增比較維度
      </button>
    </section>
  );
}
