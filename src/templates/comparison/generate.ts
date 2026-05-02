import PptxGenJS from "pptxgenjs";
import { THEME } from "@/lib/pptx/theme";
import { bi, FONT_EN, FONT_ZH, type Run } from "@/lib/pptx/bilingual";
import { COMPARISON } from "./layout";
import type { ComparisonData } from "./schema";

export async function generate(data: ComparisonData): Promise<Blob> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  const slide = pptx.addSlide();
  slide.background = { color: THEME.white };

  // ── Title ────────────────────────────────────────────────────────────────
  slide.addText(bi(data.title), {
    x: THEME.titleX, y: THEME.titleY, w: 12, h: 0.75,
    fontSize: THEME.titleSize, bold: true, color: THEME.black,
  });

  // ── Intro bullets (optional) ─────────────────────────────────────────────
  const intro = data.intro.filter((b) => b.trim());
  intro.forEach((b, i) => {
    slide.addText(
      [{ text: "●  ", options: { fontFace: FONT_EN } }, ...bi(b)],
      {
        x: THEME.bulletX, y: THEME.bulletY + i * THEME.bulletLineH,
        w: 12, h: 0.42,
        fontSize: THEME.bulletSize, color: THEME.black,
      }
    );
  });

  // ── Table geometry ───────────────────────────────────────────────────────
  const tableTop  = intro.length > 0
    ? THEME.bulletY + intro.length * THEME.bulletLineH + 0.20
    : 1.40;
  const tableLeft = COMPARISON.marginX;
  const tableW    = THEME.slideW - 2 * COMPARISON.marginX;
  const tableH    = COMPARISON.tableMaxBottom - tableTop;

  const headerH = COMPARISON.headerH;
  const bodyH   = tableH - headerH;
  const rowH    = bodyH / data.dimensions.length;

  const dimColW = tableW * COMPARISON.dimColRatio;
  const optColW = (tableW - dimColW) / data.options.length;

  // ── Header background (dark blue across full table width) ────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: tableLeft, y: tableTop, w: tableW, h: headerH,
    fill: { color: THEME.darkBlue },
    line: { color: THEME.darkBlue, width: 0 },
  });

  // ── Header: option columns (icon + label) ────────────────────────────────
  data.options.forEach((o, i) => {
    const cellX = tableLeft + dimColW + i * optColW;

    if (o.icon) {
      slide.addText(o.icon, {
        x: cellX, y: tableTop + 0.05,
        w: optColW, h: headerH * 0.55,
        fontSize: COMPARISON.headerIconSize,
        color: THEME.white,
        align: "center", valign: "middle",
        fontFace: FONT_ZH,
      });
    }
    slide.addText(bi(o.label), {
      x: cellX, y: tableTop + headerH * 0.55,
      w: optColW, h: headerH * 0.45,
      fontSize: COMPARISON.headerLabelSize, bold: true,
      color: THEME.white,
      align: "center", valign: "middle",
    });
  });

  // ── Body rows ────────────────────────────────────────────────────────────
  data.dimensions.forEach((d, rowIdx) => {
    const rowY = tableTop + headerH + rowIdx * rowH;

    // Alternating background (light blue tint on every other row)
    if (rowIdx % 2 === 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: tableLeft, y: rowY, w: tableW, h: rowH,
        fill: { color: THEME.lightBlue },
        line: { color: THEME.lightBlue, width: 0 },
      });
    }

    // Dimension label (left column, bold, left-aligned)
    slide.addText(bi(d.label), {
      x: tableLeft + COMPARISON.cellPadX, y: rowY,
      w: dimColW - 2 * COMPARISON.cellPadX, h: rowH,
      fontSize: COMPARISON.dimLabelSize, bold: true,
      color: THEME.black,
      align: "left", valign: "middle",
    });

    // Per-option cells
    data.options.forEach((o, colIdx) => {
      const cellX = tableLeft + dimColW + colIdx * optColW;
      const value = d.values[o.id] ?? "";
      const isWinner = d.winnerId === o.id;

      const runs: Run[] = [];
      if (isWinner) {
        runs.push({ text: "🏆 ", options: { fontFace: FONT_ZH } });
      }
      runs.push(...bi(value));

      slide.addText(runs, {
        x: cellX + COMPARISON.cellPadX, y: rowY,
        w: optColW - 2 * COMPARISON.cellPadX, h: rowH,
        fontSize: COMPARISON.cellSize,
        color: THEME.black,
        align: "center", valign: "middle",
      });
    });
  });

  return await pptx.write({ outputType: "blob" }) as Blob;
}
