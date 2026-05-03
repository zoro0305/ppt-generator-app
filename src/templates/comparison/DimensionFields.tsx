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

  function toggleWinner(dimIdx: number, optionId: string) {
    const d = dimensions[dimIdx];
    const current = d.winnerIds ?? [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    update(dimIdx, { ...d, winnerIds: next.length > 0 ? next : undefined });
  }

  function add() {
    const values: Record<string, string> = {};
    for (const o of options) values[o.id] = "";
    onChange([...dimensions, { id: newId(), label: "", values, winnerIds: undefined }]);
  }

  function remove(index: number) {
    onChange(dimensions.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-2">
        比較維度 Dimensions ({MIN_DIMENSIONS}–{MAX_DIMENSIONS})
      </h2>

      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b border-r border-slate-300 px-2 py-2 text-left font-medium text-slate-700 w-36">
                維度
              </th>
              {options.map((o) => (
                <th
                  key={o.id}
                  className="border-b border-r border-slate-300 px-2 py-2 text-center font-medium text-slate-700"
                >
                  {o.label || "(未命名)"}
                </th>
              ))}
              <th className="border-b border-slate-300 px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d, i) => (
              <tr key={d.id} className="even:bg-slate-50/60">
                <td className="border-b border-r border-slate-200 p-1 align-top">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="例：學習曲線"
                    value={d.label}
                    onChange={(e) => update(i, { ...d, label: e.target.value })}
                  />
                </td>
                {options.map((o) => {
                  const isWinner = d.winnerIds?.includes(o.id) ?? false;
                  return (
                    <td key={o.id} className="border-b border-r border-slate-200 p-1 align-top">
                      <input
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="值"
                        value={d.values[o.id] ?? ""}
                        onChange={(e) =>
                          update(i, { ...d, values: { ...d.values, [o.id]: e.target.value } })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => toggleWinner(i, o.id)}
                        title={isWinner ? "移除勝者標記" : "標記為勝者"}
                        className={`mt-1 w-full rounded px-1 py-0.5 text-xs flex items-center justify-center gap-1 transition-colors
                          ${isWinner
                            ? "bg-amber-100 text-amber-700 border border-amber-400 font-medium"
                            : "text-slate-400 border border-transparent hover:border-slate-300 hover:text-slate-500"
                          }`}
                      >
                        ♛ {isWinner ? "勝者" : "選為勝者"}
                      </button>
                    </td>
                  );
                })}
                <td className="border-b border-slate-200 p-1 text-center align-top">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-slate-400 hover:text-red-500 text-lg leading-none mt-0.5"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
