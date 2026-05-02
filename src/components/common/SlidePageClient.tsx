"use client";

import { notFound } from "next/navigation";
import SlideShell from "./SlideShell";
import templates from "@/templates/registry";

interface Props {
  id: string;
}

export default function SlidePageClient({ id }: Props) {
  const template = templates.find((t) => t.id === id);
  if (!template) notFound();
  return <SlideShell template={template} />;
}
