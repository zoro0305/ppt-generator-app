import type { SlideTemplate } from "@/templates/types";
import type { ComparisonData } from "./schema";
import { DEFAULT_DATA, validate } from "./schema";
import Form from "./Form";
import Preview from "./Preview";
import { generate } from "./generate";

export type { ComparisonData };

export const comparisonTemplate: SlideTemplate<ComparisonData> = {
  id:          "comparison",
  title:       "Comparison",
  description: "方案 / 技術選型比較表",
  emoji:       "⚖️",
  ready:       true,
  defaultData: DEFAULT_DATA,
  validate,
  Form,
  Preview,
  generate,
};
