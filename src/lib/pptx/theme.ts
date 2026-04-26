export const THEME = {
  // Colors
  darkBlue:  "1F3A6E",
  lightBlue: "BDD0E9",
  dateBlue:  "2F5597",
  black:     "0D0D0D",
  white:     "FFFFFF",

  // Slide dimensions (inches, 16:9)
  slideW: 13.33,
  slideH: 7.5,

  // Timeline axis
  axisY:     3.65,
  axisLeft:  0.75,
  axisRight: 12.55,  // right edge of colored bars (arrow tip extends past)
  axisH:     0.20,

  // Milestone dot sits ABOVE the axis bar (stem connects dot-top → label)
  msCircleR: 0.12,
  msStemH:   0.42,   // from dot top upward to label area

  // Phase icon circle (below axis)
  phIconR:   0.30,
  phStemH:   0.48,   // axis-bottom → icon top (even rows)
  phStagger: 0.50,   // extra depth for odd-indexed phases

  // Typography
  titleSize:   34,
  bulletSize:  14,
  msLabelSize: 14,
  msDateSize:  12,
  phLabelSize: 14,   // same as milestone
  phDateSize:  12,
  phIconSize:  16,

  // Layout anchors
  titleX:      0.70,
  titleY:      0.28,
  bulletX:     0.70,
  bulletY:     1.00,
  bulletLineH: 0.44,
} as const;

export const AXIS_TOP    = THEME.axisY - THEME.axisH / 2;  // 3.55
export const AXIS_BOTTOM = THEME.axisY + THEME.axisH / 2;  // 3.75

// Milestone dot: bottom of dot touches the top of the axis bar (floats above)
export const MS_DOT_Y       = AXIS_TOP - THEME.msCircleR;   // 3.43  (dot center)
export const MS_STEM_BOTTOM = MS_DOT_Y  - THEME.msCircleR;  // 3.31  (top of dot = stem end)
export const MS_STEM_TOP    = MS_STEM_BOTTOM - THEME.msStemH; // 2.89

export const MS_DATE_H  = 0.28;
export const MS_DATE_Y  = MS_STEM_TOP - MS_DATE_H - 0.04;  // 2.57
export const MS_LABEL_H = 0.35;
export const MS_LABEL_Y = MS_DATE_Y  - MS_LABEL_H - 0.04;  // 2.18
