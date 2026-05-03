"use client";

import type { ComparisonData, ComparisonOption } from "./schema";
import BulletFields from "@/components/common/BulletFields";
import OptionFields from "./OptionFields";
import DimensionFields from "./DimensionFields";

interface Props {
  data: ComparisonData;
  onChange: (d: ComparisonData) => void;
}

export default function ComparisonFormFields({ data, onChange }: Props) {
  // When options change, sync each dimension's values + winnerIds so the data
  // never references a deleted option and new options always have a (blank) cell.
  function setOptions(newOptions: ComparisonOption[]) {
    const validIds = new Set(newOptions.map((o) => o.id));
    const syncedDimensions = data.dimensions.map((d) => {
      const values: Record<string, string> = {};
      for (const o of newOptions) {
        values[o.id] = d.values[o.id] ?? "";
      }
      const winnerIds = (d.winnerIds ?? []).filter((id) => validIds.has(id));
      return { ...d, values, winnerIds: winnerIds.length > 0 ? winnerIds : undefined };
    });
    onChange({ ...data, options: newOptions, dimensions: syncedDimensions });
  }

  return (
    <>
      <h1 className="text-xl font-bold text-slate-800">Comparison 投影片</h1>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          投影片標題
        </label>
        <input
          className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="比較表標題"
        />
      </div>

      <BulletFields
        bullets={data.intro}
        onChange={(v) => onChange({ ...data, intro: v })}
      />

      <OptionFields options={data.options} onChange={setOptions} />

      <DimensionFields
        options={data.options}
        dimensions={data.dimensions}
        onChange={(v) => onChange({ ...data, dimensions: v })}
      />
    </>
  );
}
