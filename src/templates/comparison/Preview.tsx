"use client";

import type { ComparisonData } from "./schema";

interface Props {
  data: ComparisonData;
}

export default function ComparisonPreview({ data }: Props) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg shadow-lg"
      style={{ aspectRatio: "16/9", background: "#FFFFFF" }}
    >
      <p className="text-2xl font-bold text-slate-800">{data.title || "Comparison"}</p>
      <p className="text-sm text-slate-500">預覽尚未實作</p>
    </div>
  );
}
