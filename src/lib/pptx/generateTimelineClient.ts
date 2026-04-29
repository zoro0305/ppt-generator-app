import PptxGenJS from "pptxgenjs";
import { THEME } from "./theme";
import { bi, FONT_EN, FONT_ZH } from "./bilingual";
import {
  TIMELINE,
  MS_STAGGER_THRESHOLD, MS_STAGGER_SHIFT,
  AXIS_TOP,
  MS_DOT_Y, MS_STEM_TOP,
  MS_DATE_H, MS_DATE_Y, MS_LABEL_H, MS_LABEL_Y,
  PH_ICON_Y, PH_LABEL_Y, PH_DATE_Y,
  dateToRatio, ratioToX, getDateBounds,
  sortedMilestones, sortedPhases,
} from "@/templates/timeline/layout";
import type { TimelineInput } from "@/types/timeline";

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

export async function generateTimelineClient(input: TimelineInput): Promise<Blob> {
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

  const msLabelSz = dyn(TIMELINE.msLabelSize, milestones.length);
  const msDateSz  = dyn(TIMELINE.msDateSize,  milestones.length);
  const phLabelSz = dyn(TIMELINE.phLabelSize, phases.length);
  const phDateSz  = dyn(TIMELINE.phDateSize,  phases.length);

  const pptx  = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const slide = pptx.addSlide();
  slide.background = { color: THEME.white };

  slide.addText(bi(title), {
    x: THEME.titleX, y: THEME.titleY, w: 10, h: 0.75,
    fontSize: THEME.titleSize, bold: true,
    color: THEME.black,
  });

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

  slide.addShape(pptx.ShapeType.rect, {
    x: TIMELINE.axisLeft, y: AXIS_TOP,
    w: TIMELINE.axisRight - TIMELINE.axisLeft, h: TIMELINE.axisH,
    fill: { color: THEME.lightBlue },
    line: { color: THEME.lightBlue, width: 0 },
  });

  const totalAxisW = TIMELINE.axisRight - TIMELINE.axisLeft;
  const phW = phases.length > 0 ? totalAxisW / phases.length : totalAxisW;

  phases.forEach((_, i) => {
    const x1    = TIMELINE.axisLeft + i * phW;
    const color = i % 2 === 0 ? THEME.darkBlue : THEME.lightBlue;
    slide.addShape(pptx.ShapeType.rect, {
      x: x1, y: AXIS_TOP,
      w: phW, h: TIMELINE.axisH,
      fill: { color },
      line: { color, width: 0 },
    });
  });

  const lastColor = phases.length > 0
    ? (phases.length - 1) % 2 === 0 ? THEME.darkBlue : THEME.lightBlue
    : THEME.lightBlue;
  const axisThickPt = Math.round(TIMELINE.axisH * 72);

  slide.addShape(pptx.ShapeType.line, {
    x: TIMELINE.axisRight - 0.05,
    y: TIMELINE.axisY,
    w: 0.45,
    h: 0,
    line: { color: lastColor, width: axisThickPt, endArrowType: "triangle" },
  });

  phases.forEach((phase, i) => {
    const cx   = TIMELINE.axisLeft + (i + 0.5) * phW;
    const segW = phW;

    const isDark   = i % 2 === 0;
    const iconFill = isDark ? THEME.darkBlue : THEME.lightBlue;
    const iconText = isDark ? THEME.white    : THEME.darkBlue;

    const r = TIMELINE.phIconR;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
      fill: { color: iconFill },
      line: { color: THEME.darkBlue, width: isDark ? 0 : 1.5 },
    });

    if (phase.icon) {
      slide.addText(phase.icon, {
        x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
        fontSize: TIMELINE.phIconSize,
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

    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: MS_STEM_TOP - extraUp,
      w: 0, h: TIMELINE.msStemH + extraUp,
      line: { color: THEME.black, width: TIMELINE.msStemWidth },
    });

    const r = TIMELINE.msCircleR;
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

  return await pptx.write({ outputType: "blob" }) as Blob;
}
