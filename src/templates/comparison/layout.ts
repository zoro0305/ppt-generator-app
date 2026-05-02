// Comparison-specific geometry (inches) and typography (pt).
export const COMPARISON = {
  // Table position
  marginX:        0.70, // matches THEME.titleX
  tableMaxBottom: 7.00, // leaves a 0.5" footer margin

  // Column proportions (relative to table width)
  dimColRatio: 0.22,

  // Row heights (inches)
  headerH: 0.70,

  // Typography (pt)
  headerLabelSize: 18,
  dimLabelSize:    14,
  cellSize:        13,

  // Padding inside cells (inches)
  cellPadX: 0.10,

  // Grid border line width (pt for PPTX, also used as SVG stroke-width baseline)
  borderPt: 0.75,

  // Crown icon (inches) shown on the winning cell
  crownW: 0.34,
  crownPadX: 0.06,
  crownPadY: 0.06,
} as const;
