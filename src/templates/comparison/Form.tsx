"use client";

import type { ComparisonData } from "./schema";

interface Props {
  data: ComparisonData;
  onChange: (d: ComparisonData) => void;
}

export default function ComparisonFormFields({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Comparison 投影片</h1>
      <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-700">
        🚧 此版型仍在開發中，編輯介面尚未完成。
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          投影片標題
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>
    </div>
  );
}
