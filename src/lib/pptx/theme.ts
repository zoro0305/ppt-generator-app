export const THEME = {
  darkBlue: "1F3A6E",
  lightBlue: "BDD0E9",
  black: "0D0D0D",
  white: "FFFFFF",

  // Slide dimensions (inches, 16:9)
  slideW: 13.33,
  slideH: 7.5,

  // Timeline axis
  axisY: 4.1,       // center y of the axis bar
  axisLeft: 0.8,    // x where axis starts
  axisRight: 12.6,  // x where arrow tip ends
  axisH: 0.22,      // bar height (thicker)

  // Nodes
  circleR: 0.13,    // radius in inches
  stemH: 0.45,      // length of the vertical connecting line

  // Typography (pt)
  titleSize: 28,
  bulletSize: 12,
  labelSize: 10,
  dateSize: 9,

  // Layout
  titleX: 0.7,
  titleY: 0.35,
  bulletX: 0.7,
  bulletY: 1.05,
  bulletLineH: 0.38,
} as const;
