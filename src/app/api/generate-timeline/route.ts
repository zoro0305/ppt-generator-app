import { generateTimeline } from "@/lib/pptx/generateTimeline";
import type { TimelineInput } from "@/types/timeline";

export async function POST(request: Request) {
  let body: TimelineInput;

  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!Array.isArray(body.milestones) || !Array.isArray(body.phases)) {
    return new Response("milestones and phases are required", { status: 400 });
  }

  if (body.milestones.length === 0 && body.phases.length === 0) {
    return new Response("At least one milestone or phase is required", { status: 400 });
  }

  try {
    const buffer = await generateTimeline(body);
    // Convert Node Buffer → Uint8Array for the Web API Response
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="timeline.pptx"',
      },
    });
  } catch (err) {
    console.error("PPTX generation failed:", err);
    return new Response("Failed to generate PPTX", { status: 500 });
  }
}
