"use client";

import RepeatableList from "./RepeatableList";

interface Props {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}

export default function BulletFields({ bullets, onChange }: Props) {
  return (
    <RepeatableList<string>
      title="說明文字 Bullet Points"
      items={bullets}
      onChange={onChange}
      newItem={() => ""}
      addLabel="新增說明文字"
      renderItem={(b, _, update) => (
        <>
          <span className="text-slate-400 text-sm">•</span>
          <input
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="輸入說明文字"
            value={b}
            onChange={(e) => update(e.target.value)}
          />
        </>
      )}
    />
  );
}
