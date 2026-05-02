import { notFound } from "next/navigation";
import Link from "next/link";
import SlidePageClient from "@/components/common/SlidePageClient";
import templates from "@/templates/registry";

export function generateStaticParams() {
  return templates.map((t) => ({ slide: t.id }));
}

export default async function SlidePage({
  params,
}: {
  params: Promise<{ slide: string }>;
}) {
  const { slide } = await params;
  const exists = templates.some((t) => t.id === slide);
  if (!exists) notFound();

  return (
    <main className="flex min-h-full flex-col items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          ← 回首頁
        </Link>
        <SlidePageClient id={slide} />
      </div>
    </main>
  );
}
