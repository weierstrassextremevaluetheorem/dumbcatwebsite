import { z } from "zod";

export const DOODLE_WIDTH = 768;
export const DOODLE_HEIGHT = 576;
export const MAX_ELEMENTS = 18;
export const MAX_POLYLINE_POINTS = 12;

export const DOODLE_COLORS = {
  charcoal: "#27242a",
  blush: "#ea9db4",
  mint: "#b8dfc6",
  banana: "#f6e59b",
  sky: "#9cc9ee",
} as const;

export const colorNameSchema = z.enum(["charcoal", "blush", "mint", "banana", "sky"]);

const pointSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  })
  .strict();

const thicknessSchema = z.number().min(0.002).max(0.03);
const textValueSchema = z.string().trim().min(1).max(24);
const captionSchema = z.string().trim().min(1).max(48).nullable();

const lineElementSchema = z
  .object({
    type: z.literal("line"),
    from: pointSchema,
    to: pointSchema,
    thickness: thicknessSchema,
    color: colorNameSchema,
  })
  .strict();

const polylineElementSchema = z
  .object({
    type: z.literal("polyline"),
    points: z.array(pointSchema).min(2).max(MAX_POLYLINE_POINTS),
    thickness: thicknessSchema,
    color: colorNameSchema,
  })
  .strict();

const circleElementSchema = z
  .object({
    type: z.literal("circle"),
    center: pointSchema,
    radius: z.number().min(0.005).max(0.22),
    thickness: thicknessSchema,
    color: colorNameSchema,
    fillStyle: z.enum(["stroke", "fill"]),
  })
  .strict();

const ellipseElementSchema = z
  .object({
    type: z.literal("ellipse"),
    center: pointSchema,
    radiusX: z.number().min(0.01).max(0.28),
    radiusY: z.number().min(0.01).max(0.24),
    thickness: thicknessSchema,
    color: colorNameSchema,
    fillStyle: z.enum(["stroke", "fill"]),
  })
  .strict();

const textElementSchema = z
  .object({
    type: z.literal("text"),
    at: pointSchema,
    size: z.number().min(0.03).max(0.14),
    value: textValueSchema,
    color: colorNameSchema,
  })
  .strict();

export const doodleElementSchema = z.discriminatedUnion("type", [
  lineElementSchema,
  polylineElementSchema,
  circleElementSchema,
  ellipseElementSchema,
  textElementSchema,
]);

export const doodleSceneSchema = z
  .object({
    width: z.literal(DOODLE_WIDTH),
    height: z.literal(DOODLE_HEIGHT),
    caption: captionSchema,
    elements: z.array(doodleElementSchema).min(1).max(MAX_ELEMENTS),
  })
  .strict();

export type DoodleColorName = z.infer<typeof colorNameSchema>;
export type DoodlePoint = z.infer<typeof pointSchema>;
export type DoodleElement = z.infer<typeof doodleElementSchema>;
export type DoodleScene = z.infer<typeof doodleSceneSchema>;

export function parseDoodleScene(input: unknown): DoodleScene {
  return doodleSceneSchema.parse(input);
}

