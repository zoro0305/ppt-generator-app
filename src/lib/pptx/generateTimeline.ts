import PptxGenJS from "pptxgenjs";
import {
  THEME,
  AXIS_TOP, AXIS_BOTTOM,
  MS_DOT_Y, MS_STEM_BOTTOM, MS_STEM_TOP,
  MS_DATE_H, MS_DATE_Y, MS_LABEL_H, MS_LABEL_Y,
  PH_ICON_Y, PH_LABEL_Y, PH_DATE_Y,
} from "./theme";
import {
  dateToRatio,
  ratioToX,
  getDateBounds,
  sortedMilestones,
  sortedPhases,
} from "./timelineLayout";
import type { TimelineInput } from "@/types/timeline";

const FONT_EN  = "Arial";
const FONT_ZH  = "Microsoft JhengHei";

const MS_STAGGER_THRESHOLD = 1.4;
const MS_STAGGER_SHIFT     = 0.45;

// ── Bilingual text run helper ─────────────────────────────────────────────────
// Splits a string into Arial (Latin) + 微軟正黑體 (CJK) runs so PowerPoint
// renders each script with the correct font.
type Run = { text: string; options: { fontFace: string } };

function bi(text: string): Run[] {
  const isCJK = (ch: string) => /[⺀-鿿豈-﫿　-〿]/.test(ch);
  const runs: Run[] = [];
  if (!text) return [{ text: "", options: { fontFace: FONT_EN } }];

  let buf = text[0];
  let cjk = isCJK(text[0]);

  for (let i = 1; i < text.length; i++) {
    const c = isCJK(text[i]);
    if (c !== cjk) {
      runs.push({ text: buf, options: { fontFace: cjk ? FONT_ZH : FONT_EN } });
      buf = text[i];
      cjk = c;
    } else {
      buf += text[i];
    }
  }
  runs.push({ text: buf, options: { fontFace: cjk ? FONT_ZH : FONT_EN } });
  return runs;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function fmtRange(start: string, end: string): string {
  const s = start.replace(/-/g, "/");
  const e = end.replace(/-/g, "/");
  return s.slice(0, 4) === e.slice(0, 4) ? `${s} - ${e.slice(5)}` : `${s} - ${e}`;
}

function dyn(base: number, count: number): number {
  if (count <= 4) return base;
  if (count <= 6) return base - 1;
  return base - 2;
}

// ── Main generator ────────────────────────────────────────────────────────────
export async function generateTimeline(input: TimelineInput): Promise<Buffer> {
  const {
    title = "TIMELINE",
    bullets = [
      "Project milestones and key deliverables",
      "Planned schedule for each phase",
    ],
  } = input;

  const milestones = sortedMilestones(input.milestones);
  const phases     = sortedPhases(input.phases);
  const { min: minDate, max: maxDate } = getDateBounds(milestones, phases);

  const msLabelSz = dyn(THEME.msLabelSize, milestones.length);
  const msDateSz  = dyn(THEME.msDateSize,  milestones.length);
  const phLabelSz = dyn(THEME.phLabelSize, phases.length);
  const phDateSz  = dyn(THEME.phDateSize,  phases.length);

  const pptx  = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const slide = pptx.addSlide();
  slide.background = { color: THEME.white };

  // ── Title (black) ─────────────────────────────────────────────────────────
  slide.addText(bi(title), {
    x: THEME.titleX, y: THEME.titleY, w: 10, h: 0.75,
    fontSize: THEME.titleSize, bold: true,
    color: THEME.black,
  });

  // ── Bullet points (bigger font) ───────────────────────────────────────────
  bullets.filter((b) => b.trim()).forEach((b, i) => {
    slide.addText([
      { text: "●  ", options: { fontFace: FONT_EN } },
      ...bi(b),
    ], {
      x: THEME.bulletX,
      y: THEME.bulletY + i * THEME.bulletLineH,
      w: 10, h: 0.42,
      fontSize: THEME.bulletSize,
      color: THEME.black,
    });
  });

  // ── Axis: light-blue base bar ─────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: THEME.axisLeft, y: AXIS_TOP,
    w: THEME.axisRight - THEME.axisLeft, h: THEME.axisH,
    fill: { color: THEME.lightBlue },
    line: { color: THEME.lightBlue, width: 0 },
  });

  // ── Equal-width alternating phase segments ────────────────────────────────
  const totalAxisW = THEME.axisRight - THEME.axisLeft;
  const phW = phases.length > 0 ? totalAxisW / phases.length : totalAxisW;

  phases.forEach((_, i) => {
    const x1    = THEME.axisLeft + i * phW;
    const color = i % 2 === 0 ? THEME.darkBlue : THEME.lightBlue;
    slide.addShape(pptx.ShapeType.rect, {
      x: x1, y: AXIS_TOP,
      w: phW, h: THEME.axisH,
      fill: { color },
      line: { color, width: 0 },
    });
  });

  // ── Arrow: short thick line at axisRight, color = last phase color ─────────
  const lastColor = phases.length > 0
    ? (phases.length - 1) % 2 === 0 ? THEME.darkBlue : THEME.lightBlue
    : THEME.lightBlue;
  const axisThickPt = Math.round(THEME.axisH * 72); // inches → points

  slide.addShape(pptx.ShapeType.line, {
    x: THEME.axisRight - 0.05,
    y: THEME.axisY,
    w: 0.45,
    h: 0,
    line: { color: lastColor, width: axisThickPt, endArrowType: "triangle" },
  });

  // ── Phase icons + labels (equal-spaced, fixed depth, no stem) ────────────
  phases.forEach((phase, i) => {
    const cx   = THEME.axisLeft + (i + 0.5) * phW;
    const segW = phW;

    const isDark   = i % 2 === 0;
    const iconFill = isDark ? THEME.darkBlue : THEME.lightBlue;
    const iconText = isDark ? THEME.white    : THEME.darkBlue;

    const r = THEME.phIconR;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
      fill: { color: iconFill },
      line: { color: THEME.darkBlue, width: isDark ? 0 : 1.5 },
    });

    if (phase.icon) {
      slide.addText(phase.icon, {
        x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
        fontSize: THEME.phIconSize,
        color: iconText,
        align: "center", valign: "middle",
        fontFace: FONT_ZH,
      });
    }

    const labelW = Math.max(segW - 0.10, 0.9);
    slide.addText(bi(phase.label), {
      x: cx - labelW / 2, y: PH_LABEL_Y,
      w: labelW, h: 0.34,
      fontSize: phLabelSz, bold: true,
      color: THEME.black,
      align: "center", wrap: true,
    });

    slide.addText(bi(fmtRange(phase.start, phase.end)), {
      x: cx - labelW / 2, y: PH_DATE_Y,
      w: labelW, h: 0.26,
      fontSize: phDateSz,
      color: THEME.black,
      align: "center",
    });
  });

  // ── Milestones: small black dot above axis, thicker stem, centered text ───
  let staggerLevel = 0;

  milestones.forEach((ms, i) => {
    const cx     = ratioToX(dateToRatio(ms.date, minDate, maxDate));
    const prevCx = i > 0
      ? ratioToX(dateToRatio(milestones[i - 1].date, minDate, maxDate))
      : -999;

    if (Math.abs(cx - prevCx) < MS_STAGGER_THRESHOLD) {
      staggerLevel = staggerLevel === 0 ? 1 : 0;
    } else {
      staggerLevel = 0;
    }
    const extraUp = staggerLevel * MS_STAGGER_SHIFT;

    // Stem
    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: MS_STEM_TOP - extraUp,
      w: 0, h: THEME.msStemH + extraUp,
      line: { color: THEME.black, width: THEME.msStemWidth },
    });

    // Dot
    const r = THEME.msCircleR;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: MS_DOT_Y - r, w: r * 2, h: r * 2,
      fill: { color: THEME.black },
      line: { color: THEME.black, width: 0 },
    });

    const dateY  = MS_DATE_Y  - extraUp;
    const labelY = MS_LABEL_Y - extraUp;

    slide.addText(bi(ms.date.replace(/-/g, "/")), {
      x: cx - 1.1, y: dateY, w: 2.2, h: MS_DATE_H,
      fontSize: msDateSz,
      color: THEME.black,
      align: "center",
    });

    slide.addText(bi(ms.label), {
      x: cx - 1.1, y: labelY, w: 2.2, h: MS_LABEL_H,
      fontSize: msLabelSz, bold: true,
      color: THEME.black,
      align: "center",
    });
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(buffer as ArrayBuffer);
}
