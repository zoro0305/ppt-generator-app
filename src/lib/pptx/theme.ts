export const THEME = {
  // Colors
  darkBlue:  "1F3A6E",   // title only
  lightBlue: "BDD0E9",   // light phase segments
  black:     "111111",   // all body text
  white:     "FFFFFF",

  // Slide (inches, 16:9)
  slideW: 13.33,
  slideH: 7.5,

  // Timeline axis
  axisY:     3.65,
  axisLeft:  0.75,
  axisRight: 12.30,   // bars end here; arrow extends past
  axisH:     0.20,

  // Milestone dot
  msCircleR:   0.08,   // small
  msAxisGap:   0.07,   // gap between axis top and dot bottom
  msStemWidth: 2,      // pt — thicker stem
  msStemH:     0.42,

  // Phase icon (no stem — fixed distance below axis)
  phIconR:   0.30,
  phIconGap: 0.28,   // axis-bottom → icon top

  // Typography (pt)
  titleSize:   34,
  bulletSize:  14,
  msLabelSize: 14,
  msDateSize:  12,
  phLabelSize: 14,
  phDateSize:  12,
  phIconSize:  16,

  titleX:      0.70,
  titleY:      0.28,
  bulletX:     0.70,
  bulletY:     1.00,
  bulletLineH: 0.44,
} as const;

// ── Derived layout constants ──────────────────────────────────────────────────
export const AXIS_TOP    = THEME.axisY - THEME.axisH / 2;   // 3.55
export const AXIS_BOTTOM = THEME.axisY + THEME.axisH / 2;   // 3.75

// Milestone dot center: sits above axis with a small gap
// (dot bottom = AXIS_TOP - msAxisGap)
export const MS_DOT_Y       = AXIS_TOP - THEME.msAxisGap - THEME.msCircleR;  // 3.40
export const MS_STEM_BOTTOM = MS_DOT_Y  - THEME.msCircleR;                   // 3.32
export const MS_STEM_TOP    = MS_STEM_BOTTOM - THEME.msStemH;                 // 2.90

export const MS_DATE_H  = 0.28;
export const MS_DATE_Y  = MS_STEM_TOP - MS_DATE_H - 0.04;   // 2.58
export const MS_LABEL_H = 0.36;
export const MS_LABEL_Y = MS_DATE_Y  - MS_LABEL_H - 0.04;   // 2.18

// Phase icon: fixed Y, no stem
export const PH_ICON_Y  = AXIS_BOTTOM + THEME.phIconGap + THEME.phIconR;    // 4.33
export const PH_LABEL_Y = PH_ICON_Y   + THEME.phIconR   + 0.10;             // 4.73
export const PH_DATE_Y  = PH_LABEL_Y  + 0.34;                                // 5.07
