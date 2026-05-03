import PptxGenJS from "pptxgenjs";
import { THEME } from "@/lib/pptx/theme";
import { bi, FONT_EN } from "@/lib/pptx/bilingual";
import { COMPARISON } from "./layout";
import { CROWN_DATA_URI, CROWN_VIEWBOX } from "./crown";
import type { ComparisonData } from "./schema";

// Slightly lighter blue for alternating rows — matches Preview.tsx LIGHT_BLUE
const LIGHT_BLUE_ALT = "D6E4F4";
const GRID_COLOR     = "8DA3BC";

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

  // ── Intro bullets ────────────────────────────────────────────────────────
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

  const gridLine  = { color: GRID_COLOR, width: COMPARISON.borderPt };
  const outerLine = { color: THEME.darkBlue, width: COMPARISON.borderPt * 1.5 };
  const noLine    = { color: THEME.darkBlue, width: 0 };
  const noLineAlt = { color: LIGHT_BLUE_ALT, width: 0 };

  // ── Header background ────────────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: tableLeft, y: tableTop, w: tableW, h: headerH,
    fill: { color: THEME.darkBlue },
    line: noLine,
  });

  // ── Header labels (centered, white bold) ─────────────────────────────────
  data.options.forEach((o, i) => {
    const cellX = tableLeft + dimColW + i * optColW;
    slide.addText(bi(o.label), {
      x: cellX, y: tableTop, w: optColW, h: headerH,
      fontSize: COMPARISON.headerLabelSize, bold: true,
      color: THEME.white,
      align: "center", valign: "middle",
    });
  });

  // ── Body rows ────────────────────────────────────────────────────────────
  data.dimensions.forEach((d, rowIdx) => {
    const rowY = tableTop + headerH + rowIdx * rowH;

    if (rowIdx % 2 === 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: tableLeft, y: rowY, w: tableW, h: rowH,
        fill: { color: LIGHT_BLUE_ALT },
        line: noLineAlt,
      });
    }

    // Dimension label — dark blue bold (left column)
    slide.addText(bi(d.label), {
      x: tableLeft + COMPARISON.cellPadX, y: rowY,
      w: dimColW - 2 * COMPARISON.cellPadX, h: rowH,
      fontSize: COMPARISON.dimLabelSize, bold: true,
      color: THEME.darkBlue,
      align: "left", valign: "middle",
    });

    data.options.forEach((o, colIdx) => {
      const cellX = tableLeft + dimColW + colIdx * optColW;
      const value = d.values[o.id] ?? "";
      const isWinner = d.winnerIds?.includes(o.id) ?? false;

      slide.addText(bi(value), {
        x: cellX + COMPARISON.cellPadX, y: rowY,
        w: optColW - 2 * COMPARISON.cellPadX, h: rowH,
        fontSize: COMPARISON.cellSize,
        color: THEME.black,
        align: "center", valign: "middle",
      });

      if (isWinner) {
        const cw = COMPARISON.crownW;
        const ch = (cw * CROWN_VIEWBOX.h) / CROWN_VIEWBOX.w;
        slide.addImage({
          data: CROWN_DATA_URI,
          x: cellX + optColW - cw - COMPARISON.crownPadX,
          y: rowY + COMPARISON.crownPadY,
          w: cw, h: ch,
        });
      }
    });
  });

  // ── Grid lines ───────────────────────────────────────────────────────────
  // Internal: header bottom
  slide.addShape(pptx.ShapeType.line, {
    x: tableLeft, y: tableTop + headerH, w: tableW, h: 0,
    line: gridLine,
  });
  // Internal: horizontal row separators
  for (let i = 1; i < data.dimensions.length; i++) {
    slide.addShape(pptx.ShapeType.line, {
      x: tableLeft, y: tableTop + headerH + i * rowH, w: tableW, h: 0,
      line: gridLine,
    });
  }
  // Internal: vertical dim/option boundary
  slide.addShape(pptx.ShapeType.line, {
    x: tableLeft + dimColW, y: tableTop, w: 0, h: tableH,
    line: gridLine,
  });
  // Internal: vertical between option columns
  for (let i = 1; i < data.options.length; i++) {
    slide.addShape(pptx.ShapeType.line, {
      x: tableLeft + dimColW + i * optColW, y: tableTop, w: 0, h: tableH,
      line: gridLine,
    });
  }
  // Outer frame: top, bottom, left, right (dark blue, slightly thicker)
  slide.addShape(pptx.ShapeType.line, { x: tableLeft,           y: tableTop,          w: tableW, h: 0,      line: outerLine });
  slide.addShape(pptx.ShapeType.line, { x: tableLeft,           y: tableTop + tableH, w: tableW, h: 0,      line: outerLine });
  slide.addShape(pptx.ShapeType.line, { x: tableLeft,           y: tableTop,          w: 0,      h: tableH, line: outerLine });
  slide.addShape(pptx.ShapeType.line, { x: tableLeft + tableW,  y: tableTop,          w: 0,      h: tableH, line: outerLine });

  return await pptx.write({ outputType: "blob" }) as Blob;
}
