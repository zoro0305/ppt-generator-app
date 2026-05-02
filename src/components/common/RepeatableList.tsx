"use client";

import type { ReactNode } from "react";

interface Props<T> {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  addLabel: string;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
}

export default function RepeatableList<T>({
  title,
  items,
  onChange,
  newItem,
  addLabel,
  renderItem,
}: Props<T>) {
  function update(index: number, next: T) {
    onChange(items.map((it, i) => (i === index ? next : it)));
  }

  function add() {
    onChange([...items, newItem()]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-2">{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center flex-wrap">
            {renderItem(item, i, (next) => update(i, next))}
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
        + {addLabel}
      </button>
    </section>
  );
}
