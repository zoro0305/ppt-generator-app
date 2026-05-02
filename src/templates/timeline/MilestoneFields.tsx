"use client";

import RepeatableList from "@/components/common/RepeatableList";
import type { Milestone } from "./schema";

interface Props {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

export default function MilestoneFields({ milestones, onChange }: Props) {
  return (
    <RepeatableList<Milestone>
      title="里程碑 Milestones"
      items={milestones}
      onChange={onChange}
      newItem={() => ({ label: "", date: "" })}
      addLabel="新增里程碑"
      renderItem={(ms, _, update) => (
        <>
          <input
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="名稱 Label"
            value={ms.label}
            onChange={(e) => update({ ...ms, label: e.target.value })}
          />
          <input
            className="w-36 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="YYYY/MM/DD"
            value={ms.date}
            onChange={(e) => update({ ...ms, date: e.target.value })}
          />
        </>
      )}
    />
  );
}
