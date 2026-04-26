import Link from "next/link";

const SLIDE_TYPES = [
  {
    id: "timeline",
    title: "Timeline",
    description: "專案時程、里程碑與階段規劃",
    href: "/timeline",
    emoji: "📅",
    ready: true,
  },
];

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          投影片生成器
        </h1>
        <p className="text-slate-500 mb-10 text-base">
          選擇投影片樣式，填入資料後即可下載 .pptx
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SLIDE_TYPES.map((type) =>
            type.ready ? (
              <Link key={type.id} href={type.href}>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-300 cursor-pointer">
                  <span className="text-3xl">{type.emoji}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {type.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {type.description}
                    </p>
                  </div>
                  <span className="mt-auto text-xs font-medium text-blue-600">
                    開始製作 →
                  </span>
                </div>
              </Link>
            ) : (
              <div
                key={type.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6 opacity-50 cursor-not-allowed"
              >
                <span className="text-3xl">{type.emoji}</span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-500">
                    {type.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {type.description}
                  </p>
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
