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

      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b border-r border-slate-300 px-2 py-2 text-left font-medium text-slate-700 w-40">
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
              <th className="border-b border-r border-slate-300 px-2 py-2 text-center font-medium text-slate-700 w-32">
                勝者
              </th>
              <th className="border-b border-slate-300 px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d, i) => (
              <tr key={d.id} className="even:bg-slate-50/60">
                <td className="border-b border-r border-slate-200 p-1">
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="例：學習曲線"
                    value={d.label}
                    onChange={(e) => update(i, { ...d, label: e.target.value })}
                  />
                </td>
                {options.map((o) => (
                  <td key={o.id} className="border-b border-r border-slate-200 p-1">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="值"
                      value={d.values[o.id] ?? ""}
                      onChange={(e) =>
                        update(i, { ...d, values: { ...d.values, [o.id]: e.target.value } })
                      }
                    />
                  </td>
                ))}
                <td className="border-b border-r border-slate-200 p-1">
                  <select
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={d.winnerId ?? ""}
                    onChange={(e) => update(i, { ...d, winnerId: e.target.value || undefined })}
                    title="選擇此維度的勝者（會加上皇冠圖示）"
                  >
                    <option value="">—</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label || "(未命名)"}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-slate-200 p-1 text-center">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-slate-400 hover:text-red-500 text-lg leading-none"
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
