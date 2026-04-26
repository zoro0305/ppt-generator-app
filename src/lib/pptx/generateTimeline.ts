import PptxGenJS from "pptxgenjs";
import { THEME } from "./theme";
import {
  dateToRatio,
  ratioToX,
  getDateBounds,
  sortedMilestones,
  sortedPhases,
} from "./timelineLayout";
import type { TimelineInput } from "@/types/timeline";

const AXIS_TOP = THEME.axisY - THEME.axisH / 2;
const AXIS_BOTTOM = THEME.axisY + THEME.axisH / 2;

// Milestone circle sits above the axis connected by a stem
const MS_CIRCLE_Y = AXIS_TOP - THEME.stemH - THEME.circleR;

// Minimum x-gap (inches) before triggering milestone stagger
const MS_STAGGER_THRESHOLD = 1.5;
// Extra upward shift for staggered milestone labels
const MS_STAGGER_SHIFT = 0.38;

// Phase label stagger: odd-indexed phases get this extra stem depth
const PH_STAGGER_EXTRA = 0.40;

/** Pick label/date font sizes based on element count */
function dynamicSizes(count: number) {
  if (count <= 4) return { label: 10, date: 9 };
  if (count <= 6) return { label: 9, date: 8 };
  return { label: 8, date: 7 };
}

/** Format date range: same-year → "YYYY/MM/DD - MM/DD", else full */
function formatDateRange(start: string, end: string): string {
  const s = start.replace(/-/g, "/");
  const e = end.replace(/-/g, "/");
  return s.slice(0, 4) === e.slice(0, 4) ? `${s} - ${e.slice(5)}` : `${s} - ${e}`;
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
  const phases = sortedPhases(input.phases);

  const { min: minDate, max: maxDate } = getDateBounds(milestones, phases);
  const phSizes = dynamicSizes(phases.length);
  const msSizes = dynamicSizes(milestones.length);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const slide = pptx.addSlide();
  slide.background = { color: THEME.white };

  // ── Title ──────────────────────────────────────────────────────────────────
  slide.addText(title, {
    x: THEME.titleX,
    y: THEME.titleY,
    w: 10,
    h: 0.7,
    fontSize: THEME.titleSize,
    bold: true,
    color: THEME.darkBlue,
    fontFace: "Calibri",
  });

  // ── Bullet points ──────────────────────────────────────────────────────────
  const activeBullets = bullets.filter((b) => b.trim());
  activeBullets.forEach((bullet, i) => {
    slide.addText(bullet, {
      x: THEME.bulletX,
      y: THEME.bulletY + i * THEME.bulletLineH,
      w: 9,
      h: 0.35,
      fontSize: THEME.bulletSize,
      color: THEME.black,
      fontFace: "Calibri",
      bullet: { type: "bullet" },
    });
  });

  // ── Axis: light-blue base bar (full width, covers gaps between phases) ─────
  slide.addShape(pptx.ShapeType.rect, {
    x: THEME.axisLeft,
    y: AXIS_TOP,
    w: THEME.axisRight - THEME.axisLeft,
    h: THEME.axisH,
    fill: { color: THEME.lightBlue },
    line: { color: THEME.lightBlue, width: 0 },
  });

  // ── Axis: alternating colored phase segments ───────────────────────────────
  phases.forEach((phase, i) => {
    const x1 = ratioToX(dateToRatio(phase.start, minDate, maxDate));
    const x2 = ratioToX(dateToRatio(phase.end, minDate, maxDate));
    const color = i % 2 === 0 ? THEME.darkBlue : THEME.lightBlue;

    slide.addShape(pptx.ShapeType.rect, {
      x: x1,
      y: AXIS_TOP,
      w: Math.max(x2 - x1, 0.01),
      h: THEME.axisH,
      fill: { color },
      line: { color, width: 0 },
    });
  });

  // ── Axis arrow ─────────────────────────────────────────────────────────────
  slide.addShape(pptx.ShapeType.line, {
    x: THEME.axisLeft,
    y: THEME.axisY,
    w: THEME.axisRight - THEME.axisLeft,
    h: 0,
    line: {
      color: THEME.darkBlue,
      width: 2.5,
      endArrowType: "triangle",
    },
  });

  // ── Phases: labels centered on each segment ────────────────────────────────
  phases.forEach((phase, i) => {
    const x1 = ratioToX(dateToRatio(phase.start, minDate, maxDate));
    const x2 = ratioToX(dateToRatio(phase.end, minDate, maxDate));
    const cx = (x1 + x2) / 2;
    const segW = x2 - x1;

    // Alternate stagger: odd phases get a longer stem so labels sit at two depths
    const staggerExtra = i % 2 === 1 ? PH_STAGGER_EXTRA : 0;
    const stemLen = THEME.stemH + staggerExtra;

    // Vertical stem from axis bottom center
    slide.addShape(pptx.ShapeType.line, {
      x: cx,
      y: AXIS_BOTTOM,
      w: 0,
      h: stemLen,
      line: { color: THEME.black, width: 1 },
    });

    // Label box width = segment width (room for text); min 0.8
    const labelW = Math.max(segW - 0.05, 0.8);
    const labelX = cx - labelW / 2;
    const labelY = AXIS_BOTTOM + stemLen + 0.04;

    slide.addText(phase.label, {
      x: labelX,
      y: labelY,
      w: labelW,
      h: 0.28,
      fontSize: phSizes.label,
      bold: true,
      color: THEME.black,
      fontFace: "Calibri",
      align: "center",
      wrap: true,
    });

    slide.addText(formatDateRange(phase.start, phase.end), {
      x: labelX,
      y: labelY + 0.30,
      w: labelW,
      h: 0.22,
      fontSize: phSizes.date,
      color: "555555",
      fontFace: "Calibri",
      align: "center",
    });
  });

  // ── Milestones: filled circles above axis ──────────────────────────────────
  let staggerLevel = 0;

  milestones.forEach((ms, i) => {
    const ratio = dateToRatio(ms.date, minDate, maxDate);
    const cx = ratioToX(ratio);
    const prevCx =
      i > 0
        ? ratioToX(dateToRatio(milestones[i - 1].date, minDate, maxDate))
        : -999;

    // Detect closeness and toggle stagger level
    if (Math.abs(cx - prevCx) < MS_STAGGER_THRESHOLD) {
      staggerLevel = staggerLevel === 0 ? 1 : 0;
    } else {
      staggerLevel = 0;
    }

    // Stem: circle bottom → axis top
    slide.addShape(pptx.ShapeType.line, {
      x: cx,
      y: MS_CIRCLE_Y + THEME.circleR,
      w: 0,
      h: AXIS_TOP - (MS_CIRCLE_Y + THEME.circleR),
      line: { color: THEME.black, width: 1 },
    });

    // Filled circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - THEME.circleR,
      y: MS_CIRCLE_Y - THEME.circleR,
      w: THEME.circleR * 2,
      h: THEME.circleR * 2,
      fill: { color: THEME.darkBlue },
      line: { color: THEME.darkBlue, width: 1.5 },
    });

    // Label: staggered level 1 pushes text higher
    const extraUp = staggerLevel * MS_STAGGER_SHIFT;
    const textY = MS_CIRCLE_Y - THEME.circleR - 0.55 - extraUp;

    slide.addText(ms.label, {
      x: cx - 0.8,
      y: textY,
      w: 1.6,
      h: 0.25,
      fontSize: msSizes.label,
      bold: true,
      color: THEME.black,
      fontFace: "Calibri",
      align: "center",
    });

    slide.addText(ms.date.replace(/-/g, "/"), {
      x: cx - 0.8,
      y: textY + 0.27,
      w: 1.6,
      h: 0.22,
      fontSize: msSizes.date,
      color: "555555",
      fontFace: "Calibri",
      align: "center",
    });
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(buffer as ArrayBuffer);
}
