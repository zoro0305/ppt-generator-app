export const THEME = {
  // Colors
  darkBlue:  "1F3A6E",
  lightBlue: "BDD0E9",
  dateBlue:  "2F5597",   // date text color (medium blue like reference)
  black:     "0D0D0D",
  white:     "FFFFFF",

  // Slide dimensions (inches, 16:9 LAYOUT_WIDE)
  slideW: 13.33,
  slideH: 7.5,

  // Timeline axis
  axisY:    3.6,    // center y
  axisLeft: 0.75,   // start x
  axisRight: 12.7,  // end x (before arrowhead)
  axisH:    0.20,   // bar height

  // Milestone dot (sits on axis, stem goes up)
  msCircleR: 0.12,
  msStemH:   0.45,  // stem length above dot

  // Phase icon circle (below axis)
  phIconR:   0.30,
  phStemH:   0.48,  // axis-bottom → icon circle top

  // Typography (pt) — larger sizes to match reference
  titleSize:   34,
  bulletSize:  14,
  msLabelSize: 14,
  msDateSize:  12,
  phLabelSize: 12,
  phDateSize:  10,
  phIconSize:  16,  // emoji inside icon circle

  // Layout anchors
  titleX: 0.7,
  titleY: 0.30,
  bulletX: 0.7,
  bulletY: 1.00,
  bulletLineH: 0.42,
} as const;

// Derived constants (computed from THEME so they stay consistent)
export const AXIS_TOP    = THEME.axisY - THEME.axisH / 2;   // 3.50
export const AXIS_BOTTOM = THEME.axisY + THEME.axisH / 2;   // 3.70

// Milestone: dot sits centered on the axis bar
export const MS_DOT_Y = THEME.axisY;                        // 3.60

// Phase icon circle center
export const PH_ICON_Y = AXIS_BOTTOM + THEME.phStemH + THEME.phIconR; // 3.70 + 0.48 + 0.30 = 4.48
