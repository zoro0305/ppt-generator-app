// Comparison-specific geometry (inches) and typography (pt).
export const COMPARISON = {
  // Table position
  marginX:        0.70, // matches THEME.titleX
  tableMaxBottom: 7.00, // leaves a 0.5" footer margin

  // Column proportions (relative to table width)
  dimColRatio: 0.22,

  // Row heights (inches)
  headerH: 0.85,

  // Typography (pt)
  headerLabelSize: 16,
  headerIconSize:  28,
  dimLabelSize:    14,
  cellSize:        13,

  // Padding inside cells (inches)
  cellPadX: 0.10,
} as const;
