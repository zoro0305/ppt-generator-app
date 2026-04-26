import PptxGenJS from "pptxgenjs";
import { THEME, AXIS_TOP, AXIS_BOTTOM, MS_DOT_Y, PH_ICON_Y } from "./theme";
import {
  dateToRatio,
  ratioToX,
  getDateBounds,
  sortedMilestones,
  sortedPhases,
} from "./timelineLayout";
import type { TimelineInput } from "@/types/timeline";

// Milestone label/date area sits above the dot.
// From dot top, go up by msStemH; then place date box, then label box.
const MS_STEM_BOTTOM = MS_DOT_Y - THEME.msCircleR;           // 3.48
const MS_STEM_TOP    = MS_STEM_BOTTOM - THEME.msStemH;       // 3.03
const MS_DATE_H      = 0.27;
const MS_LABEL_H     = 0.35;
const MS_DATE_Y      = MS_STEM_TOP - MS_DATE_H - 0.04;       // 2.72
const MS_LABEL_Y     = MS_DATE_Y - MS_LABEL_H - 0.04;        // 2.33

// Minimum x-gap before staggering milestone labels upward
const MS_STAGGER_THRESHOLD = 1.4;
const MS_STAGGER_SHIFT     = 0.45;

// Phase label/date below icon circle
const PH_LABEL_Y = PH_ICON_Y + THEME.phIconR + 0.10;        // 4.88
const PH_LABEL_H = 0.30;
const PH_DATE_Y  = PH_LABEL_Y + PH_LABEL_H + 0.04;          // 5.22

/** Same-year date range: "YYYY/MM/DD - MM/DD", else full */
function fmtRange(start: string, end: string): string {
  const s = start.replace(/-/g, "/");
  const e = end.replace(/-/g, "/");
  return s.slice(0, 4) === e.slice(0, 4) ? `${s} - ${e.slice(5)}` : `${s} - ${e}`;
}

/** Dynamic label font size based on element count */
function dynSize(base: number, count: number): number {
  if (count <= 4) return base;
  if (count <= 6) return base - 1;
  return base - 2;
}

export async function generateTimeline(input: TimelineInput): Promise<Buffer> {
  const {
    title = "TIMELINE",
    bullets = ["Project milestones and key deliverables", "Planned schedule for each phase"],
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

  // ── Title ────────────────────────────────────────────────────────────────
  slide.addText(title, {
    x: THEME.titleX, y: THEME.titleY, w: 10, h: 0.75,
    fontSize: THEME.titleSize, bold: true,
    color: THEME.darkBlue, fontFace: "Calibri",
  });

  // ── Bullet points ─────────────────────────────────────────────────────────
  bullets.filter((b) => b.trim()).forEach((b, i) => {
    slide.addText(b, {
      x: THEME.bulletX,
      y: THEME.bulletY + i * THEME.bulletLineH,
      w: 10, h: 0.38,
      fontSize: THEME.bulletSize,
      color: THEME.darkBlue,
      fontFace: "Calibri",
      bullet: { type: "bullet" },
    });
  });

  // ── Axis: light-blue base bar ─────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.rect, {
    x: THEME.axisLeft, y: AXIS_TOP,
    w: THEME.axisRight - THEME.axisLeft, h: THEME.axisH,
    fill: { color: THEME.lightBlue },
    line: { color: THEME.lightBlue, width: 0 },
  });

  // ── Axis: alternating phase segments ──────────────────────────────────────
  phases.forEach((phase, i) => {
    const x1 = ratioToX(dateToRatio(phase.start, minDate, maxDate));
    const x2 = ratioToX(dateToRatio(phase.end,   minDate, maxDate));
    const color = i % 2 === 0 ? THEME.darkBlue : THEME.lightBlue;
    slide.addShape(pptx.ShapeType.rect, {
      x: x1, y: AXIS_TOP,
      w: Math.max(x2 - x1, 0.01), h: THEME.axisH,
      fill: { color },
      line: { color, width: 0 },
    });
  });

  // ── Axis arrow ────────────────────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.line, {
    x: THEME.axisLeft, y: THEME.axisY,
    w: THEME.axisRight - THEME.axisLeft, h: 0,
    line: { color: THEME.darkBlue, width: 2.5, endArrowType: "triangle" },
  });

  // ── Phase icons + labels (below axis) ─────────────────────────────────────
  phases.forEach((phase, i) => {
    const x1  = ratioToX(dateToRatio(phase.start, minDate, maxDate));
    const x2  = ratioToX(dateToRatio(phase.end,   minDate, maxDate));
    const cx  = (x1 + x2) / 2;
    const segW = x2 - x1;

    const isDark   = i % 2 === 0;
    const iconFill = isDark ? THEME.darkBlue : THEME.lightBlue;
    const iconLine = isDark ? THEME.darkBlue : THEME.darkBlue;
    const iconText = isDark ? THEME.white : THEME.darkBlue;

    // Stem: axis-bottom → icon circle top
    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: AXIS_BOTTOM,
      w: 0, h: THEME.phStemH,
      line: { color: "888888", width: 1 },
    });

    // Icon circle
    const r = THEME.phIconR;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
      fill: { color: iconFill },
      line: { color: iconLine, width: isDark ? 0 : 1.5 },
    });

    // Emoji inside circle
    if (phase.icon) {
      slide.addText(phase.icon, {
        x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
        fontSize: THEME.phIconSize,
        color: iconText,
        align: "center",
        valign: "middle",
        fontFace: "Segoe UI Emoji",
      });
    }

    // Phase label — width = segment width (min 0.9")
    const labelW = Math.max(segW - 0.08, 0.9);
    slide.addText(phase.label, {
      x: cx - labelW / 2, y: PH_LABEL_Y,
      w: labelW, h: PH_LABEL_H,
      fontSize: phLabelSz, bold: true,
      color: THEME.darkBlue, fontFace: "Calibri",
      align: "center", wrap: true,
    });

    // Date range
    slide.addText(fmtRange(phase.start, phase.end), {
      x: cx - labelW / 2, y: PH_DATE_Y,
      w: labelW, h: 0.25,
      fontSize: phDateSz,
      color: THEME.dateBlue, fontFace: "Calibri",
      align: "center",
    });
  });

  // ── Milestones: dot on axis, label+date above, stem ───────────────────────
  let staggerLevel = 0;

  milestones.forEach((ms, i) => {
    const cx      = ratioToX(dateToRatio(ms.date, minDate, maxDate));
    const prevCx  = i > 0
      ? ratioToX(dateToRatio(milestones[i - 1].date, minDate, maxDate))
      : -999;

    // Toggle stagger when too close to previous
    if (Math.abs(cx - prevCx) < MS_STAGGER_THRESHOLD) {
      staggerLevel = staggerLevel === 0 ? 1 : 0;
    } else {
      staggerLevel = 0;
    }
    const extraUp = staggerLevel * MS_STAGGER_SHIFT;

    // Stem: from label area down to dot top
    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: MS_STEM_TOP - extraUp,
      w: 0, h: THEME.msStemH + extraUp,
      line: { color: "888888", width: 1 },
    });

    // Filled dot on axis
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - THEME.msCircleR, y: MS_DOT_Y - THEME.msCircleR,
      w: THEME.msCircleR * 2, h: THEME.msCircleR * 2,
      fill: { color: THEME.darkBlue },
      line: { color: THEME.darkBlue, width: 0 },
    });

    const dateY  = MS_DATE_Y  - extraUp;
    const labelY = MS_LABEL_Y - extraUp;

    // Date (smaller, blue)
    slide.addText(ms.date.replace(/-/g, "/"), {
      x: cx - 0.9, y: dateY, w: 1.8, h: MS_DATE_H,
      fontSize: msDateSz,
      color: THEME.dateBlue, fontFace: "Calibri",
      align: "center",
    });

    // Label (bold, dark blue)
    slide.addText(ms.label, {
      x: cx - 0.9, y: labelY, w: 1.8, h: MS_LABEL_H,
      fontSize: msLabelSz, bold: true,
      color: THEME.darkBlue, fontFace: "Calibri",
      align: "center",
    });
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(buffer as ArrayBuffer);
}
