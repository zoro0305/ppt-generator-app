"use client";

interface Props {
  loading: boolean;
}

export default function DownloadButton({ loading }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
    >
      {loading ? "生成中..." : "下載 timeline.pptx"}
    </button>
  );
}
