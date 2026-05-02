"use client";

interface Props {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}

export default function BulletFields({ bullets, onChange }: Props) {
  function update(index: number, value: string) {
    onChange(bullets.map((b, i) => (i === index ? value : b)));
  }

  function add() {
    onChange([...bullets, ""]);
  }

  function remove(index: number) {
    onChange(bullets.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-2">
        說明文字 Bullet Points
      </h2>
      <div className="space-y-2">
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-slate-400 text-sm">•</span>
            <input
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入說明文字"
              value={b}
              onChange={(e) => update(i, e.target.value)}
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
        + 新增說明文字
      </button>
    </section>
  );
}
