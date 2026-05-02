"use client";

import RepeatableList from "@/components/common/RepeatableList";
import type { ComparisonOption } from "./schema";
import { MAX_OPTIONS, MIN_OPTIONS } from "./schema";

interface Props {
  options: ComparisonOption[];
  onChange: (options: ComparisonOption[]) => void;
}

function newId() {
  return `opt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function OptionFields({ options, onChange }: Props) {
  return (
    <RepeatableList<ComparisonOption>
      title={`比較選項 Options (${MIN_OPTIONS}–${MAX_OPTIONS})`}
      items={options}
      onChange={onChange}
      newItem={() => ({ id: newId(), label: "" })}
      addLabel="新增選項"
      renderItem={(o, _, update) => (
        <input
          className="flex-1 min-w-32 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="名稱（例：React）"
          value={o.label}
          onChange={(e) => update({ ...o, label: e.target.value })}
        />
      )}
    />
  );
}
