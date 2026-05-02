"use client";

import { useState } from "react";
import type { SlideTemplate } from "@/templates/types";

interface Props<TData> {
  template: SlideTemplate<TData>;
}

export default function SlideShell<TData>({ template }: Props<TData>) {
  const [data, setData]               = useState<TData>(template.defaultData);
  const [error, setError]             = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = template.validate(data);
    if (err) { setError(err); return; }
    setError(null);
    setShowPreview(true);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await template.generate(data);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${template.id}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "下載失敗，請重試");
      setShowPreview(false);
    } finally {
      setDownloading(false);
    }
  }

  const Form    = template.Form;
  const Preview = template.Preview;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <Form data={data} onChange={setData} />

        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          預覽投影片
        </button>
      </form>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="flex w-full max-w-5xl flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">投影片預覽</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            <Preview data={data} />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                繼續編輯
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
              >
                {downloading ? "生成中..." : "下載 .pptx"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
