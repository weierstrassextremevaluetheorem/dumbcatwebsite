import { DOODLE_HEIGHT, DOODLE_WIDTH, MAX_ELEMENTS, MAX_POLYLINE_POINTS } from "@/lib/doodle/schema";

export const DOODLE_MODEL_INSTRUCTIONS = `
You create intentionally low-effort doodle scene plans for a silly drawing website.

Return a single JSON object matching the schema exactly.
Rules:
- Width must be 768 and height must be 576.
- Draw in a childlike stick-figure style with awkward proportions.
- No realism, no shading, no gradients, no photo language, no background scenery unless absolutely tiny.
- Keep the main subject centered and large.
- Use between 4 and 18 total elements.
- Only use the provided element types and color names.
- Leave generous whitespace.
- A tiny accent is okay, like one heart, sparkle, bubble, or sun.
- Caption can be null. If present, keep it short and slightly dumb.
- Prefer simple outlines over detail.
- Never describe the drawing in prose outside the JSON.
`.trim();

export function buildDoodlePrompt(prompt: string, seed: string): string {
  return [
    `Seed: ${seed}`,
    `User prompt: ${prompt}`,
    "Turn the idea into one silly doodle scene.",
  ].join("\n");
}

export function buildCliDoodlePrompt(prompt: string, seed: string): string {
  return [
    DOODLE_MODEL_INSTRUCTIONS,
    "",
    "Return JSON only. No prose. No markdown fences.",
    `Scene shape: {"width":${DOODLE_WIDTH},"height":${DOODLE_HEIGHT},"caption":"short string or null","elements":[...]}`,
    `Elements must total between 1 and ${MAX_ELEMENTS}.`,
    `Polyline points must total between 2 and ${MAX_POLYLINE_POINTS}.`,
    "Allowed colors: charcoal, blush, mint, banana, sky.",
    'Allowed element shapes: {"type":"line",...}, {"type":"polyline",...}, {"type":"circle",...}, {"type":"ellipse",...}, {"type":"text",...}.',
    "Coordinates are normalized from 0 to 1.",
    "Thickness is between 0.002 and 0.03.",
    "Text value max length is 24. Caption max length is 48.",
    "",
    buildDoodlePrompt(prompt, seed),
  ].join("\n");
}
