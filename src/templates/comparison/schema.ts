export interface ComparisonOption {
  id: string;     // stable internal key referenced by dimensions[].values + winnerId
  label: string;
  icon?: string;  // emoji
}

export interface ComparisonDimension {
  id: string;
  label: string;
  values: Record<string, string>; // optionId -> cell text
  winnerId?: string;              // optionId that wins this dimension; trophy 🏆
}

export interface ComparisonData {
  title: string;
  intro: string[]; // bullets above the table (optional, can be empty)
  options: ComparisonOption[];
  dimensions: ComparisonDimension[];
}

export const MIN_OPTIONS    = 2;
export const MAX_OPTIONS    = 4;
export const MIN_DIMENSIONS = 3;
export const MAX_DIMENSIONS = 6;

export const DEFAULT_DATA: ComparisonData = {
  title: "前端框架選型",
  intro: [
    "比較主流前端框架的優缺點",
    "依專案需求選擇最適合的方案",
  ],
  options: [
    { id: "react",  label: "React",  icon: "⚛️" },
    { id: "vue",    label: "Vue",    icon: "💚" },
    { id: "svelte", label: "Svelte", icon: "🔥" },
  ],
  dimensions: [
    { id: "learning",    label: "學習曲線",   values: { react: "中等", vue: "平緩", svelte: "平緩" },     winnerId: "vue" },
    { id: "ecosystem",   label: "生態系",     values: { react: "最大", vue: "完整", svelte: "成長中" },   winnerId: "react" },
    { id: "performance", label: "效能",       values: { react: "良好", vue: "優秀", svelte: "卓越" },     winnerId: "svelte" },
    { id: "hiring",      label: "招募難度",   values: { react: "容易", vue: "中等", svelte: "困難" },     winnerId: "react" },
    { id: "enterprise",  label: "企業採用度", values: { react: "高",   vue: "中",   svelte: "低" },       winnerId: "react" },
  ],
};

export function validate(data: ComparisonData): string | null {
  if (!data.title.trim()) return "請填寫標題";

  if (data.options.length < MIN_OPTIONS)
    return `至少需要 ${MIN_OPTIONS} 個比較選項`;
  if (data.options.length > MAX_OPTIONS)
    return `最多 ${MAX_OPTIONS} 個比較選項`;

  if (data.dimensions.length < MIN_DIMENSIONS)
    return `至少需要 ${MIN_DIMENSIONS} 個比較維度`;
  if (data.dimensions.length > MAX_DIMENSIONS)
    return `最多 ${MAX_DIMENSIONS} 個比較維度`;

  const optionIds = new Set<string>();
  for (const o of data.options) {
    if (!o.label.trim())               return "每個選項都需要填寫名稱";
    if (!o.id || optionIds.has(o.id))  return "選項 ID 重複或為空";
    optionIds.add(o.id);
  }

  for (const d of data.dimensions) {
    if (!d.label.trim()) return "每個比較維度都需要填寫名稱";
    for (const o of data.options) {
      const v = d.values[o.id];
      if (v == null || !v.trim())
        return `「${d.label}」的「${o.label}」欄位尚未填寫`;
    }
    if (d.winnerId && !optionIds.has(d.winnerId))
      return `「${d.label}」的勝者指向不存在的選項`;
  }

  return null;
}
