@AGENTS.md

# Architecture Overview

## Static Export

`next.config.ts` sets `output: "export"`. All pages are pre-rendered to `./out/`.
Deploy runs via `.github/workflows/deploy.yml` on push to `main`.

`basePath` is `/ppt-generator-app` in production (GitHub Pages repo sub-path), empty in dev.

## Template Registry Pattern

Each slide type lives in `src/templates/<id>/` and is registered in `src/templates/registry.ts`.

```
src/templates/
  types.ts          # SlideTemplate<TData> interface
  registry.ts       # export const TEMPLATES: AnySlideTemplate[]
  timeline/
    schema.ts       # data types + DEFAULT_DATA + validate()
    layout.ts       # geometry/typography constants
    Form.tsx        # "use client" fields component
    Preview.tsx     # SVG preview component
    generate.ts     # returns Promise<Blob> via pptxgenjs
    index.ts        # assembles SlideTemplate object
  comparison/       # same structure
```

### Adding a New Template

1. Create `src/templates/<id>/` with the files above.
2. Export a `SlideTemplate<YourData>` from `index.ts` with `ready: false`.
3. Import and add it to the array in `src/templates/registry.ts`.
4. Set `ready: true` when the template is complete.

The home page and dynamic route `app/[slide]/page.tsx` pick it up automatically.

### `SlideTemplate<TData>` Interface

```ts
interface SlideTemplate<TData> {
  id:          string;           // URL segment, PPTX filename stem
  title:       string;
  description: string;
  emoji:       string;
  ready:       boolean;          // false = hidden from home page
  defaultData: TData;
  validate:    (data: TData) => string | null;
  Form:        ComponentType<{ data: TData; onChange: (d: TData) => void }>;
  Preview:     ComponentType<{ data: TData }>;
  generate:    (data: TData) => Promise<Blob>;
}
```

## Shared Utilities

| Path | Contents |
|------|----------|
| `src/lib/pptx/theme.ts` | Slide dimensions, colors, title/bullet positions |
| `src/lib/pptx/bilingual.ts` | `bi()`, `FONT_EN`, `FONT_ZH`, `Run` type |
| `src/components/common/SlideShell.tsx` | State, validation, preview modal, download |
| `src/components/common/RepeatableList.tsx` | Generic add/remove list with render-prop |
| `src/components/common/BulletFields.tsx` | Intro bullet list (uses RepeatableList) |

## SVG Preview Convention

- ViewBox: `1333 × 750` (16:9, 1 unit = 0.01 inch)
- Scale factor `S = 100`; convert inches → SVG units by multiplying by S
- Mirror geometry from the corresponding `layout.ts` and `generate.ts`
- Font sizes: `pt → SVG units` via `Math.round((pt * S) / 72)`

## PPTX Generation

- Uses `pptxgenjs` browser-side; `pptx.write({ outputType: "blob" })`
- `pptx.layout = "LAYOUT_WIDE"` (13.33 × 7.5 inches)
- Bilingual text: `bi(str)` returns `Run[]` splitting Latin (Arial) and CJK (Microsoft JhengHei) runs
- Emoji glyphs: use `fontFace: FONT_ZH` (Microsoft JhengHei renders emoji in pptxgenjs)
