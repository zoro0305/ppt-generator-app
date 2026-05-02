"use client";

import type { Phase } from "./schema";

interface Props {
  phases: Phase[];
  onChange: (phases: Phase[]) => void;
}

export const ICON_OPTIONS = [
  { value: "🔍", label: "🔍 搜尋 / 研究" },
  { value: "📋", label: "📋 規劃 / 清單" },
  { value: "✏️", label: "✏️ 設計 / 草稿" },
  { value: "⚙️", label: "⚙️ 開發 / 設定" },
  { value: "🚀", label: "🚀 發布 / 上線" },
  { value: "🏁", label: "🏁 完成 / 收尾" },
  { value: "📊", label: "📊 分析 / 數據" },
  { value: "💡", label: "💡 創意 / 發想" },
  { value: "🔧", label: "🔧 維護 / 修復" },
  { value: "🔬", label: "🔬 測試 / 驗證" },
  { value: "🎯", label: "🎯 目標 / 里程" },
  { value: "📝", label: "📝 文件 / 記錄" },
  { value: "🌐", label: "🌐 部署 / 上架" },
  { value: "🤝", label: "🤝 協作 / 合作" },
];

export default function PhaseFields({ phases, onChange }: Props) {
  function update(index: number, field: keyof Phase, value: string) {
    onChange(phases.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function add() {
    onChange([...phases, { label: "", start: "", end: "", icon: "📋" }]);
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
          <div key={i} className="flex gap-2 items-center flex-wrap">
            <select
              className="w-36 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={p.icon ?? "📋"}
              onChange={(e) => update(i, "icon", e.target.value)}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              className="flex-1 min-w-28 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
