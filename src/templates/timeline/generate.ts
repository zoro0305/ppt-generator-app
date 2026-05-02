import PptxGenJS from "pptxgenjs";
import { THEME } from "@/lib/pptx/theme";
import { bi, FONT_EN, FONT_ZH } from "@/lib/pptx/bilingual";
import {
  TIMELINE,
  MS_STAGGER_THRESHOLD, MS_STAGGER_SHIFT,
  AXIS_TOP,
  MS_DOT_Y, MS_STEM_TOP,
  MS_DATE_H, MS_DATE_Y, MS_LABEL_H, MS_LABEL_Y,
  PH_ICON_Y, PH_LABEL_Y, PH_DATE_Y,
  dateToRatio, ratioToX, getDateBounds,
  sortedMilestones, sortedPhases,
} from "./layout";
import type { TimelineData } from "./schema";

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

export async function generate(data: TimelineData): Promise<Blob> {
  const bullets = data.bullets.filter((b) => b.trim());

  const milestones = sortedMilestones(data.milestones);
  const phases     = sortedPhases(data.phases);
  const { min: minDate, max: maxDate } = getDateBounds(milestones, phases);

  const msLabelSz = dyn(TIMELINE.msLabelSize, milestones.length);
  const msDateSz  = dyn(TIMELINE.msDateSize,  milestones.length);
  const phLabelSz = dyn(TIMELINE.phLabelSize, phases.length);
  const phDateSz  = dyn(TIMELINE.phDateSize,  phases.length);

  const pptx  = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const slide = pptx.addSlide();
  slide.background = { color: THEME.white };

  slide.addText(bi(data.title), {
    x: THEME.titleX, y: THEME.titleY, w: 10, h: 0.75,
    fontSize: THEME.titleSize, bold: true,
    color: THEME.black,
  });

  bullets.forEach((b, i) => {
    slide.addText(
      [{ text: "●  ", options: { fontFace: FONT_EN } }, ...bi(b)],
      { x: THEME.bulletX, y: THEME.bulletY + i * THEME.bulletLineH, w: 10, h: 0.42, fontSize: THEME.bulletSize, color: THEME.black }
    );
  });

  // Axis base bar
  slide.addShape(pptx.ShapeType.rect, {
    x: TIMELINE.axisLeft, y: AXIS_TOP,
    w: TIMELINE.axisRight - TIMELINE.axisLeft, h: TIMELINE.axisH,
    fill: { color: THEME.lightBlue }, line: { color: THEME.lightBlue, width: 0 },
  });

  const totalAxisW = TIMELINE.axisRight - TIMELINE.axisLeft;
  const phW = phases.length > 0 ? totalAxisW / phases.length : totalAxisW;

  // Phase segments
  phases.forEach((_, i) => {
    const color = i % 2 === 0 ? THEME.darkBlue : THEME.lightBlue;
    slide.addShape(pptx.ShapeType.rect, {
      x: TIMELINE.axisLeft + i * phW, y: AXIS_TOP,
      w: phW, h: TIMELINE.axisH,
      fill: { color }, line: { color, width: 0 },
    });
  });

  const lastColor = phases.length > 0
    ? (phases.length - 1) % 2 === 0 ? THEME.darkBlue : THEME.lightBlue
    : THEME.lightBlue;

  // Arrow
  slide.addShape(pptx.ShapeType.line, {
    x: TIMELINE.axisRight - 0.05, y: TIMELINE.axisY, w: 0.45, h: 0,
    line: { color: lastColor, width: Math.round(TIMELINE.axisH * 72), endArrowType: "triangle" },
  });

  // Phase icons + labels + dates
  phases.forEach((phase, i) => {
    const cx     = TIMELINE.axisLeft + (i + 0.5) * phW;
    const isDark = i % 2 === 0;
    const r      = TIMELINE.phIconR;
    const labelW = Math.max(phW - 0.10, 0.9);

    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
      fill: { color: isDark ? THEME.darkBlue : THEME.lightBlue },
      line: { color: THEME.darkBlue, width: isDark ? 0 : 1.5 },
    });
    if (phase.icon) {
      slide.addText(phase.icon, {
        x: cx - r, y: PH_ICON_Y - r, w: r * 2, h: r * 2,
        fontSize: TIMELINE.phIconSize,
        color: isDark ? THEME.white : THEME.darkBlue,
        align: "center", valign: "middle", fontFace: FONT_ZH,
      });
    }
    slide.addText(bi(phase.label), {
      x: cx - labelW / 2, y: PH_LABEL_Y, w: labelW, h: 0.34,
      fontSize: phLabelSz, bold: true, color: THEME.black, align: "center", wrap: true,
    });
    slide.addText(bi(fmtRange(phase.start, phase.end)), {
      x: cx - labelW / 2, y: PH_DATE_Y, w: labelW, h: 0.26,
      fontSize: phDateSz, color: THEME.black, align: "center",
    });
  });

  // Milestones
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
    const r       = TIMELINE.msCircleR;

    slide.addShape(pptx.ShapeType.line, {
      x: cx, y: MS_STEM_TOP - extraUp, w: 0, h: TIMELINE.msStemH + extraUp,
      line: { color: THEME.black, width: TIMELINE.msStemWidth },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx - r, y: MS_DOT_Y - r, w: r * 2, h: r * 2,
      fill: { color: THEME.black }, line: { color: THEME.black, width: 0 },
    });
    slide.addText(bi(ms.date.replace(/-/g, "/")), {
      x: cx - 1.1, y: MS_DATE_Y - extraUp, w: 2.2, h: MS_DATE_H,
      fontSize: msDateSz, color: THEME.black, align: "center",
    });
    slide.addText(bi(ms.label), {
      x: cx - 1.1, y: MS_LABEL_Y - extraUp, w: 2.2, h: MS_LABEL_H,
      fontSize: msLabelSz, bold: true, color: THEME.black, align: "center",
    });
  });

  return await pptx.write({ outputType: "blob" }) as Blob;
}
