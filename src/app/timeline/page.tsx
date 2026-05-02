"use client";

import Link from "next/link";
import SlideShell from "@/components/common/SlideShell";
import { timelineTemplate } from "@/templates/timeline";

export default function TimelinePage() {
  return (
    <main className="flex min-h-full flex-col items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          ← 回首頁
        </Link>
        <SlideShell template={timelineTemplate} />
      </div>
    </main>
  );
}
