import type { AnySlideTemplate } from "./types";
import { timelineTemplate } from "./timeline";

// Templates are registered here in display order.
// Ready templates appear before non-ready ones on the home page.
const templates: AnySlideTemplate[] = [
  timelineTemplate,
];

export default templates;
