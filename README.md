# 投影片生成器

自動產生 `.pptx` 投影片的 Next.js 應用程式，目前支援 **Timeline** 樣式。

---

## 功能

- 首頁列出可用的投影片樣式
- Timeline：輸入里程碑與階段後下載 `.pptx`
  - 水平時間軸，依 Phase 交錯深藍 / 淺藍配色
  - 里程碑（上方實心圓）、階段標籤（置中於各段落）
  - 相鄰標籤自動交錯排列，避免重疊
  - 字型大小依元素數量動態調整

---

## 技術堆疊

| 項目 | 版本 |
|------|------|
| Next.js | 16.2.4 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| pptxgenjs | ^3 |

---

## 啟動服務

### 前置需求

- Node.js 18 以上
- npm 9 以上

### 步驟

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

### 其他指令

```bash
# 型別檢查 + 建置（確認可正確編譯）
npm run build

# 在 build 後啟動 production server
npm start

# Lint 檢查
npm run lint
```

---

## 專案結構

```
src/
├── app/
│   ├── page.tsx                        # 首頁（樣式選擇）
│   ├── timeline/
│   │   └── page.tsx                    # Timeline 功能頁
│   └── api/
│       └── generate-timeline/
│           └── route.ts                # POST API：產生 PPTX 並回傳
├── components/
│   └── timeline/
│       ├── TimelineForm.tsx            # 主表單
│       ├── BulletFields.tsx            # 說明文字欄位
│       ├── MilestoneFields.tsx         # 里程碑欄位
│       ├── PhaseFields.tsx             # 階段欄位
│       └── DownloadButton.tsx          # 下載按鈕
├── lib/
│   └── pptx/
│       ├── generateTimeline.ts         # 核心繪圖邏輯
│       ├── timelineLayout.ts           # 日期 → 座標換算
│       └── theme.ts                    # 顏色、字型、尺寸常數
└── types/
    └── timeline.ts                     # 型別定義
```

---

## API

### `POST /api/generate-timeline`

**Request Body（JSON）：**

```json
{
  "title": "TIMELINE",
  "bullets": ["說明文字 1", "說明文字 2"],
  "milestones": [
    { "label": "Project Kickoff", "date": "2026/01/01" }
  ],
  "phases": [
    { "label": "Research", "start": "2026/01/01", "end": "2026/02/10" }
  ],
  "today": "2026-04-26"
}
```

**Response：** `application/vnd.openxmlformats-officedocument.presentationml.presentation`（`.pptx` 二進位）

---

## 授權

MIT
