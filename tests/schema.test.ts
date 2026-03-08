import { describe, expect, it } from "vitest";
import { buildMockScene } from "@/lib/doodle/mock-scenes";
import { MAX_ELEMENTS, parseDoodleScene } from "@/lib/doodle/schema";

describe("doodle scene schema", () => {
  it("accepts a valid scene", () => {
    const scene = buildMockScene("cute cat yo", "schema-seed");
    expect(parseDoodleScene(scene)).toEqual(scene);
  });

  it("rejects out-of-bounds coordinates", () => {
    const scene = buildMockScene("cute cat yo", "schema-seed");
    const invalid = structuredClone(scene);

    invalid.elements[0] = {
      type: "line",
      from: { x: -0.2, y: 0.5 },
      to: { x: 1.2, y: 0.7 },
      thickness: 0.01,
      color: "charcoal",
    };

    expect(() => parseDoodleScene(invalid)).toThrow();
  });

  it("rejects scenes with too many elements", () => {
    const scene = buildMockScene("cute cat yo", "schema-seed");
    const invalid = structuredClone(scene);

    invalid.elements = Array.from({ length: MAX_ELEMENTS + 1 }, () => invalid.elements[0]);

    expect(() => parseDoodleScene(invalid)).toThrow();
  });

  it("rejects over-complex polylines", () => {
    const scene = buildMockScene("cute cat yo", "schema-seed");
    const invalid = structuredClone(scene);

    invalid.elements[0] = {
      type: "polyline",
      color: "charcoal",
      thickness: 0.01,
      points: Array.from({ length: 18 }, (_, index) => ({
        x: index / 20,
        y: index / 20,
      })),
    };

    expect(() => parseDoodleScene(invalid)).toThrow();
  });
});

