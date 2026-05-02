import type { AnySlideTemplate } from "./types";
import { timelineTemplate } from "./timeline";
import { comparisonTemplate } from "./comparison";

// Templates are registered here in display order.
// Ready templates appear before non-ready ones on the home page.
const templates: AnySlideTemplate[] = [
  timelineTemplate,
  comparisonTemplate,
];

export default templates;
