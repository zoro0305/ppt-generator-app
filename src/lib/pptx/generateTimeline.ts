import PptxGenJS from "pptxgenjs";
import {
  THEME,
  AXIS_TOP, AXIS_BOTTOM,
  MS_DOT_Y, MS_STEM_BOTTOM, MS_STEM_TOP,
  MS_DATE_H, MS_DATE_Y, MS_LABEL_H, MS_LABEL_Y,
} from "./theme";
import {
  dateToRatio,
  ratioToX,
  getDateBounds,
  sortedMilestones,
  sortedPhases,
} from "./timelineLayout";
import type { TimelineInput } from "@/types/timeline";

// Minimum x-gap (inches) before staggering adjacent milestone labels
const MS_STAGGER_THRESHOLD = 1.4;
const MS_STAGGER_SHIFT     = 0.45;

/** Same-year date range: "YYYY/MM/DD - MM/DD", else full */
function fmtRange(start: string, end: string): string {
  const s = start.replace(/-/g, "/");
  const e = end.replace(/-/g, "/");
  return s.slice(0, 4) === e.slice(0, 4) ? `${s} - ${e.slice(5)}` : `${s} - ${e}`;
}

/** Reduce font size when many elements are present */
function dynSize(base: number, count: number): number {
  if (count <= 4) return base;
  if (count <= 6) return base - 1;
  return base - 2;
}

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

  const msLabelSz = dynSize(THEME.msLabelSize, milestones.length);
  const msDateSz  = dynSize(THEME.msDateSize,  milestones.length);
  const phLabelSz = dynSize(THEME.phLabelSize, phases.length);
  const phDateSz  = dynSize(THEME.phDateSize,  phases.length);

  const pptx  = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const slide = pptx.addSlide();
  slide.background = { color: THEME.white };

  // ── Title ─────────────────────────────────────────────────────────────────
  slide.addText(title, {
    x: THEME.titleX, y: THEME.titleY, w: 10, h: 0.75,
    fontSize: THEME.titleSize, bold: true,
    color: THEME.darkBlue, fontFace: "Calibri",
  });

  // ── Bullet points (use ● prefix for reliable rendering) ───────────────────
  bullets.filter((b) => b.trim()).forEach((b, i) => {
    slide.addText(`●  ${b}`, {
      x: THEME.bulletX,
      y: THEME.bulletY + i * THEME.bulletLineH,
      w: 10, h: 0.38,
      fontSize: THEME.bulletSize,
      color: THEME.darkBlue,
      fontFace: "Calibri",
    });
  });

  // ── Axis: light-blue base bar ─────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: THEME.axisLeft, y: AXIS_TOP,
    w: THEME.axisRight - THEME.axisLeft, h: THEME.axisH,
    fill: { color: THEME.lightBlue },
    line: { color: THEME.lightBlue, width: 0 },
  });

  // ── Axis: alternating colored phase segments ──────────────────────────────
  phases.forEach((phase, i) => {
    const x1    = ratioToX(dateToRatio(phase.start, minDate, maxDate));
    const x2    = ratioToX(dateToRatio(phase.end,   minDate, maxDate));
    const color = i % 2 === 0 ? THEME.darkBlue : THEME.lightBlue;
    slide.addShape(pptx.ShapeType.rect, {
      x: x1, y: AXIS_TOP,
      w: Math.max(x2 - x1, 0.01), h: THEME.axisH,
      fill: { color },
      line: { color, width: 0 },
    });
  });

  // ── Arrow tip only (no full-width line crossing the bars) ─────────────────
  // A short thick line starting right at axisRight with a triangular arrowhead
  const lastColor = phases.length > 0
    ? (phases.length - 1) % 2 === 0 ? THEME.darkBlue : THEME.lightBlue
    : THEME.lightBlue;
  const axisThicknessPt = Math.round(THEME.axisH * 72); // inches → points

  slide.addShape(pptx.ShapeType.line, {
    x: THEME.axisRight - 0.05,
    y: THEME.axisY,
    w: 0.45,
    h: 0,
    line: {
      color: lastColor,
      width: axisThicknessPt,
      endArrowType: "triangle",
    },
  });

  // ── Phase icons + labels (below axis, odd rows staggered deeper) ──────────
  phases.forEach((phase, i) => {
    const x1   = ratioToX(dateToRatio(phase.start, minDate, maxDate));
    const x2   = ratioToX(dateToRatio(phase.end,   minDate, maxDate));
    const cx   = (x1 + x2) / 2;
    const segW = x2 - x1;

    // Odd phases go deeper (stagger)
    const extraDepth = i % 2 === 1 ? THEME.phStagger : 0;
    const iconCenterY = AXIS_BOTTOM + THEME.phStemH + THEME.phIconR + extraDepth;

    const isDark   = i % 2 === 0;
    const iconFill = isDark ? THEME.darkBlue : THEME.lightBlue;
    const iconBorder= THEME.darkBlue;
    const iconText = isDark ? THEME.white    : THEME.darkBlue;

    // Stem: axis-bottom → icon top
    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: AXIS_BOTTOM,
      w: 0, h: THEME.phStemH + extraDepth,
      line: { color: "999999", width: 1 },
    });

    // Icon circle
    const r = THEME.phIconR;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: iconCenterY - r, w: r * 2, h: r * 2,
      fill: { color: iconFill },
      line: { color: iconBorder, width: isDark ? 0 : 1.5 },
    });

    // Emoji inside circle
    if (phase.icon) {
      slide.addText(phase.icon, {
        x: cx - r, y: iconCenterY - r, w: r * 2, h: r * 2,
        fontSize: THEME.phIconSize,
        color: iconText,
        align: "center", valign: "middle",
        fontFace: "Segoe UI Emoji",
      });
    }

    // Label below icon
    const labelW = Math.max(segW - 0.06, 0.9);
    const labelY = iconCenterY + r + 0.08;
    slide.addText(phase.label, {
      x: cx - labelW / 2, y: labelY,
      w: labelW, h: 0.32,
      fontSize: phLabelSz, bold: true,
      color: THEME.darkBlue, fontFace: "Calibri",
      align: "center", wrap: true,
    });

    // Date range
    slide.addText(fmtRange(phase.start, phase.end), {
      x: cx - labelW / 2, y: labelY + 0.34,
      w: labelW, h: 0.25,
      fontSize: phDateSz,
      color: THEME.dateBlue, fontFace: "Calibri",
      align: "center",
    });
  });

  // ── Milestones: dot floats above axis, label+date above dot ───────────────
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

    // Stem: from label area bottom down to dot top
    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: MS_STEM_TOP - extraUp,
      w: 0, h: THEME.msStemH + extraUp,
      line: { color: "999999", width: 1 },
    });

    // Filled dot (floats above axis bar)
    const r = THEME.msCircleR;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: MS_DOT_Y - r, w: r * 2, h: r * 2,
      fill: { color: THEME.darkBlue },
      line: { color: THEME.darkBlue, width: 0 },
    });

    const dateY  = MS_DATE_Y  - extraUp;
    const labelY = MS_LABEL_Y - extraUp;

    // Date (blue, below label)
    slide.addText(ms.date.replace(/-/g, "/"), {
      x: cx - 1.0, y: dateY, w: 2.0, h: MS_DATE_H,
      fontSize: msDateSz,
      color: THEME.dateBlue, fontFace: "Calibri",
      align: "left",
    });

    // Label (bold, dark blue)
    slide.addText(ms.label, {
      x: cx - 1.0, y: labelY, w: 2.0, h: MS_LABEL_H,
      fontSize: msLabelSz, bold: true,
      color: THEME.darkBlue, fontFace: "Calibri",
      align: "left",
    });
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(buffer as ArrayBuffer);
}
