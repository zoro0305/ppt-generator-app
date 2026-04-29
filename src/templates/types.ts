import type { ComponentType } from "react";

export interface SlideTemplate<TData> {
  id: string;
  title: string;
  description: string;
  emoji: string;
  ready: boolean;
  defaultData: TData;
  validate: (data: TData) => string | null;
  Form: ComponentType<{ data: TData; onChange: (d: TData) => void }>;
  Preview: ComponentType<{ data: TData }>;
  generate: (data: TData) => Promise<Blob>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySlideTemplate = SlideTemplate<any>;
