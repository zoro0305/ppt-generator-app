import Link from "next/link";
import templates from "@/templates/registry";

export default function Home() {
  const sorted = [...templates].sort((a, b) => Number(b.ready) - Number(a.ready));

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">投影片生成器</h1>
        <p className="text-slate-500 mb-10 text-base">
          選擇投影片樣式，填入資料後即可下載 .pptx
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((t) =>
            t.ready ? (
              <Link key={t.id} href={`/${t.id}`}>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-300 cursor-pointer">
                  <span className="text-3xl">{t.emoji}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{t.title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
                  </div>
                  <span className="mt-auto text-xs font-medium text-blue-600">開始製作 →</span>
                </div>
              </Link>
            ) : (
              <div
                key={t.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6 opacity-50 cursor-not-allowed"
              >
                <span className="text-3xl">{t.emoji}</span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-500">{t.title}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{t.description}</p>
                </div>
                <span className="mt-auto text-xs text-slate-400">即將推出</span>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
