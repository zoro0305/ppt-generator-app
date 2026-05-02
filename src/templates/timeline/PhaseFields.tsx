"use client";

import RepeatableList from "@/components/common/RepeatableList";
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
  return (
    <RepeatableList<Phase>
      title="階段 Phases"
      items={phases}
      onChange={onChange}
      newItem={() => ({ label: "", start: "", end: "", icon: "📋" })}
      addLabel="新增階段"
      renderItem={(p, _, update) => (
        <>
          <select
            className="w-36 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={p.icon ?? "📋"}
            onChange={(e) => update({ ...p, icon: e.target.value })}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            className="flex-1 min-w-28 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="名稱 Label"
            value={p.label}
            onChange={(e) => update({ ...p, label: e.target.value })}
          />
          <input
            className="w-32 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="開始 YYYY/MM/DD"
            value={p.start}
            onChange={(e) => update({ ...p, start: e.target.value })}
          />
          <input
            className="w-32 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="結束 YYYY/MM/DD"
            value={p.end}
            onChange={(e) => update({ ...p, end: e.target.value })}
          />
        </>
      )}
    />
  );
}
