// Shared theme constants for all slide templates.
// Template-specific geometry (axis, milestone, etc.) lives in each template's layout.ts.

export const THEME = {
  // Colors
  darkBlue:  "1F3A6E",
  lightBlue: "BDD0E9",
  black:     "111111",
  white:     "FFFFFF",

  // Slide (inches, 16:9)
  slideW: 13.33,
  slideH: 7.5,

  // Typography (pt)
  titleSize:  34,
  bulletSize: 18,

  // Title + bullet positions (inches)
  titleX:      0.70,
  titleY:      0.28,
  bulletX:     0.70,
  bulletY:     1.00,
  bulletLineH: 0.44,
} as const;
