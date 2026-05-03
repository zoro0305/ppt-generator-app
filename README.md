# 投影片生成器

瀏覽器端產生 `.pptx` 投影片的 Next.js 靜態應用程式，目前支援 **Timeline** 與 **Comparison** 兩種樣式。

部署於 GitHub Pages：`https://zoro0305.github.io/ppt-generator-app/`

---

## 功能

### Timeline
- 水平時間軸，依里程碑與階段規劃佈局
- 里程碑（上方實心圓）+ 階段標籤（置中於各段落）
- 相鄰標籤自動交錯排列，避免重疊
- 字型大小依元素數量動態調整

### Comparison（比較表）
- 多欄方案比較表（2–4 個選項 × 3–6 個比較維度）
- 深藍色表頭、交錯淡藍列、深藍粗體維度標籤
- 每個維度可單獨選擇一或多個勝者，勝者欄右上角顯示精緻皇冠圖示
- 表格填寫介面採直覺表格式輸入，欄即選項、列即維度

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

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

```bash
# 型別檢查 + 建置
npm run build

# Lint 檢查
npm run lint
```

---

## 專案結構

```
src/
├── app/
│   ├── page.tsx                # 首頁（樣式選擇）
│   └── [slide]/page.tsx        # 動態路由：/timeline, /comparison
├── templates/
│   ├── types.ts                # SlideTemplate<TData> 介面
│   ├── registry.ts             # 樣式清單（TEMPLATES[]）
│   ├── timeline/               # Timeline 樣式
│   │   ├── schema.ts           # 資料型別 + 驗證 + 預設值
│   │   ├── layout.ts           # 幾何常數（英吋）與字型大小（pt）
│   │   ├── Form.tsx            # 表單元件
│   │   ├── Preview.tsx         # SVG 預覽元件（viewBox 1333×750）
│   │   ├── generate.ts         # 產生 PPTX（回傳 Blob）
│   │   └── index.ts            # 組裝 SlideTemplate 物件
│   └── comparison/             # Comparison 樣式（同上結構）
├── components/
│   └── common/
│       ├── SlideShell.tsx      # 通用外殼：狀態、驗證、預覽 Modal、下載
│       ├── RepeatableList.tsx  # 可新增/刪除清單（render-prop）
│       └── BulletFields.tsx    # 說明文字子彈清單
└── lib/
    └── pptx/
        ├── theme.ts            # 共用顏色、尺寸、文字位置常數
        └── bilingual.ts        # bi()、FONT_EN、FONT_ZH（中英雙語分 run）
```

---

## 新增樣式

1. 建立 `src/templates/<id>/` 資料夾，按上述結構建立六個檔案
2. 在 `index.ts` 以 `ready: false` 匯出 `SlideTemplate<YourData>`
3. 在 `src/templates/registry.ts` import 並加入陣列
4. 完成後將 `ready` 改為 `true`

首頁與動態路由會自動偵測並顯示。

---

## 授權

MIT
