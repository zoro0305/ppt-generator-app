# Timeline PPTX Generator — Feature Spec

## 概覽

生成符合圖片風格的專案時程投影片（.pptx）。版面包含：
- 標題區（TIMELINE）+ 說明子彈點
- 水平時間軸（藍色漸層橫條 + 右側箭頭）
- **里程碑（Milestone）**：時間軸上方，實心藍圓 + 名稱 + 日期
- **階段（Phase）**：時間軸下方，空心圓 + 名稱 + 起訖日期範圍
- 已完成段落用深藍色橫條，待進行段落用淡藍色橫條

---

## 1. 建議檔案架構

```
src/
├── app/
│   ├── page.tsx                        # 首頁（表單入口）
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       └── generate-timeline/
│           └── route.ts                # API Route：接收資料、產生 PPTX、回傳檔案
│
├── components/
│   └── timeline/
│       ├── TimelineForm.tsx            # 使用者輸入表單（里程碑 + 階段）
│       ├── MilestoneFields.tsx         # 里程碑欄位群組（可新增 / 刪除列）
│       ├── PhaseFields.tsx             # 階段欄位群組（可新增 / 刪除列）
│       └── DownloadButton.tsx          # 觸發下載的按鈕元件
│
├── lib/
│   └── pptx/
│       ├── generateTimeline.ts         # 核心：用 pptxgenjs 繪製投影片
│       ├── timelineLayout.ts           # 座標計算與比例換算邏輯
│       └── theme.ts                    # 顏色、字型、尺寸常數
│
└── types/
    └── timeline.ts                     # TypeScript 型別定義
```

`docs/features/timeline.md` — 本文件

---

## 2. 每個檔案的功能

| 檔案 | 職責 |
|------|------|
| `app/api/generate-timeline/route.ts` | 接收 POST body（JSON），呼叫 `generateTimeline`，將 PPTX buffer 以 `application/vnd.openxmlformats-officedocument.presentationml.presentation` 回傳 |
| `components/timeline/TimelineForm.tsx` | 管理整份表單 state，組合 MilestoneFields + PhaseFields，送出後觸發下載 |
| `components/timeline/MilestoneFields.tsx` | 動態列表：每列含「名稱」+「日期」輸入框；可新增 / 刪除 |
| `components/timeline/PhaseFields.tsx` | 動態列表：每列含「名稱」+「開始日期」+「結束日期」；可新增 / 刪除 |
| `components/timeline/DownloadButton.tsx` | 接收 blob，產生臨時 `<a>` 觸發 `.pptx` 下載 |
| `lib/pptx/generateTimeline.ts` | 主要繪圖邏輯：呼叫 pptxgenjs API，依序繪製背景、橫條、圓點、文字 |
| `lib/pptx/timelineLayout.ts` | 純函式：將日期換算為時間軸上的 x 座標比例（`dateToX`）、計算段落寬度 |
| `lib/pptx/theme.ts` | 顏色常數（深藍 `#1F3A6E`、淡藍 `#BDD0E9`）、字型大小、邊距、橫條 y 座標 |
| `types/timeline.ts` | `Milestone`、`Phase`、`TimelineInput` 介面 |

---

## 3. 實作步驟

### Step 1 — 安裝依賴
```bash
npm install pptxgenjs
npm install -D @types/pptxgenjs   # 若套件本身未附型別
```

### Step 2 — 定義型別（`types/timeline.ts`）
```ts
export interface Milestone {
  label: string;   // "Project Kickoff"
  date: string;    // "2026/01/01"
}

export interface Phase {
  label: string;    // "Research & Planning"
  start: string;   // "2026/01/01"
  end: string;     // "2026/02/10"
}

export interface TimelineInput {
  title?: string;          // 預設 "TIMELINE"
  bullets?: string[];      // 說明子彈點
  milestones: Milestone[];
  phases: Phase[];
}
```

### Step 3 — 座標計算（`lib/pptx/timelineLayout.ts`）
```ts
// 將日期映射到時間軸 x 比例 (0–1)
export function dateToRatio(date: string, minDate: Date, maxDate: Date): number {
  const d = new Date(date).getTime();
  return (d - minDate.getTime()) / (maxDate.getTime() - minDate.getTime());
}
```
- `minDate` = 所有 milestone/phase 中最早日期，`maxDate` = 最晚日期
- x 座標 = `AXIS_LEFT + ratio * AXIS_WIDTH`（英吋，pptxgenjs 單位）

### Step 4 — 佈景主題常數（`lib/pptx/theme.ts`）
```ts
export const THEME = {
  darkBlue:  "1F3A6E",
  lightBlue: "BDD0E9",
  black:     "0D0D0D",
  slideW:    13.33,   // 英吋（16:9）
  slideH:    7.5,
  axisY:     4.1,     // 橫條中心 y
  axisLeft:  0.8,     // 橫條起點 x
  axisRight: 12.5,    // 橫條終點 x（箭頭前）
  axisH:     0.12,    // 橫條高度
  circleR:   0.13,    // 圓點半徑（英吋）
  stemH:     0.45,    // 連接線高度
};
```

### Step 5 — 核心繪圖（`lib/pptx/generateTimeline.ts`）

繪製順序（避免 z-order 問題）：
1. 新增投影片、設白色背景
2. 標題文字（左上，Geist / Calibri Bold，深藍）
3. 說明子彈點（標題下方）
4. 畫淡藍底橫條（全軸寬）
5. 對每個 Phase：若「今日 ≥ phase.start」畫深藍段落橫條，否則保留淡藍
6. 畫箭頭（右端三角形 shape 或 line with arrow end）
7. 對每個 Phase：畫空心圓（position = phase start x）、連接線（下方）、名稱 + 日期範圍文字
8. 對每個 Milestone：畫實心圓（filled）、連接線（上方）、名稱 + 日期文字

### Step 6 — API Route（`app/api/generate-timeline/route.ts`）
```ts
import { NextRequest, NextResponse } from "next/server";
import { generateTimeline } from "@/lib/pptx/generateTimeline";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const buffer = await generateTimeline(body);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": 'attachment; filename="timeline.pptx"',
    },
  });
}
```

### Step 7 — 表單 UI（`components/timeline/TimelineForm.tsx`）
- 使用 React `useState` 管理 milestones / phases 陣列
- `fetch("/api/generate-timeline", { method: "POST", body: JSON.stringify(data) })`
- 取得 blob → `URL.createObjectURL` → 模擬點擊下載

### Step 8 — 整合首頁
在 `app/page.tsx` render `<TimelineForm />`

---

## 4. PPTX 版面實作重點

### 座標系統
pptxgenjs 使用**英吋**為單位，投影片 16:9 = 13.33 × 7.5 英吋。所有 x/y/w/h 都需預先換算。

### 時間軸橫條
- 用兩層 `slide.addShape(pptx.ShapeType.rect, {...})`：底層淡藍（全寬）、上層深藍（已完成段落）
- 避免使用圖片；全程向量繪製，縮放不失真

### 圓點
```ts
// 實心（Milestone）
slide.addShape(pptx.ShapeType.ellipse, {
  x: cx - r, y: THEME.axisY - r, w: r*2, h: r*2,
  fill: { color: THEME.darkBlue },
  line: { color: THEME.darkBlue, width: 1.5 },
});
// 空心（Phase）
slide.addShape(pptx.ShapeType.ellipse, {
  x: cx - r, y: THEME.axisY - r, w: r*2, h: r*2,
  fill: { type: "none" },
  line: { color: THEME.darkBlue, width: 1.5 },
});
```

### 連接線（Stem）
```ts
slide.addShape(pptx.ShapeType.line, {
  x: cx, y: milestoneTextBottom, w: 0, h: THEME.stemH,
  line: { color: THEME.black, width: 1 },
});
```

### 文字對齊
- Milestone 文字：`align: "center"`，`valign: "bottom"`，錨點在圓點正上方
- Phase 文字：`align: "center"`，`valign: "top"`，錨點在圓點正下方
- 若相鄰 milestone 日期重疊，自動交錯 y 偏移（odd/even index）

### 箭頭
```ts
slide.addShape(pptx.ShapeType.line, {
  x: THEME.axisLeft, y: THEME.axisY,
  w: THEME.axisRight - THEME.axisLeft, h: 0,
  line: { color: THEME.darkBlue, width: 3, endArrowType: "triangle" },
});
```

### 字型
優先 Calibri（PPTX 原生支援），fallback Arial；標題 Bold 28pt，子標題 12pt，時間軸標籤 10pt Bold，日期 9pt Regular。

---

## 5. 可能風險

| 風險 | 說明 | 對策 |
|------|------|------|
| **pptxgenjs SSR 相容性** | 套件內部可能使用 `window` / `document`，在 Next.js Server Component / API Route 執行時崩潰 | API Route 已是 Node.js 環境，確認使用 `pptx.write("nodebuffer")` 而非 blob；若仍有問題改用動態 import |
| **文字標籤重疊** | 里程碑日期過近時，上方標籤互相覆蓋 | 偵測相鄰 milestone x 間距 < threshold 時，交錯 y 偏移（+0.3 英吋）|
| **日期排序錯誤** | 使用者輸入順序不一，座標計算出現負值或超出邊界 | 在 `generateTimeline` 入口對 milestones/phases 按日期排序後再計算 |
| **階段數量過多** | 6 個以上 phase 時，底部標籤擠到幻燈片邊緣 | 限制最多 8 個 phase；或縮小 axisLeft/axisRight 邊距動態計算字型大小 |
| **今日判斷時區問題** | `new Date()` 在 server 端依 Node.js 時區，可能與使用者預期不同 | 接受前端傳入 `today` 欄位（ISO string），server 不自行取當前時間 |
| **大型 buffer 記憶體** | 並行請求同時產生多份 PPTX | API Route 本身為無狀態；若需限流可加 rate-limit middleware |
| **Next.js 16 Route Handler 型別** | Next.js 16 可能調整 `NextResponse` API | 先讀 `node_modules/next/dist/docs/` 確認正確用法再實作 |

---

## 6. 驗證方式

### 功能驗證
- [ ] 下載的 `.pptx` 可在 PowerPoint / LibreOffice Impress 正常開啟
- [ ] 投影片尺寸為 16:9（33.87 × 19.05 cm）
- [ ] 里程碑圓點位置與輸入日期成比例
- [ ] 已完成階段（today ≥ phase.start）顯示深藍橫條，未完成顯示淡藍
- [ ] 所有文字無截斷、無重疊（至少預設 3 milestone + 6 phase 案例）

### 邊界情境
- [ ] 只有 1 個 milestone + 1 個 phase
- [ ] Milestone 與 Phase 起始日期相同（圓點重疊處理）
- [ ] 輸入日期格式為 `YYYY-MM-DD`（非 `YYYY/MM/DD`）
- [ ] 表單欄位全空時送出 → 應顯示驗證錯誤，不呼叫 API

### 自動化測試
```ts
// lib/pptx/timelineLayout.test.ts
import { dateToRatio } from "./timelineLayout";

test("起點日期 ratio = 0", () => {
  const min = new Date("2026-01-01");
  const max = new Date("2026-06-20");
  expect(dateToRatio("2026-01-01", min, max)).toBe(0);
});

test("終點日期 ratio = 1", () => {
  const min = new Date("2026-01-01");
  const max = new Date("2026-06-20");
  expect(dateToRatio("2026-06-20", min, max)).toBe(1);
});
```

---

*Last updated: 2026-04-26*
