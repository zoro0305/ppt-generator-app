import type { SlideTemplate } from "@/templates/types";
import type { TimelineData } from "./schema";
import { DEFAULT_DATA, validate } from "./schema";
import Form from "./Form";
import Preview from "./Preview";
import { generate } from "./generate";

export type { TimelineData };

export const timelineTemplate: SlideTemplate<TimelineData> = {
  id:          "timeline",
  title:       "Timeline",
  description: "專案時程、里程碑與階段規劃",
  emoji:       "📅",
  ready:       true,
  defaultData: DEFAULT_DATA,
  validate,
  Form,
  Preview,
  generate,
};
