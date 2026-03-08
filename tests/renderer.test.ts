import { describe, expect, it } from "vitest";
import { renderSceneToSvg } from "@/lib/doodle/renderer";
import type { DoodleScene } from "@/lib/doodle/schema";

const sampleScene: DoodleScene = {
  width: 768,
  height: 576,
  caption: "tiny cat energy",
  elements: [
    {
      type: "circle",
      center: { x: 0.5, y: 0.45 },
      radius: 0.16,
      thickness: 0.01,
      color: "charcoal",
      fillStyle: "stroke",
    },
    {
      type: "text",
      at: { x: 0.3, y: 0.18 },
      size: 0.06,
      value: "cat <3",
      color: "blush",
    },
  ],
};

describe("renderSceneToSvg", () => {
  it("is deterministic for the same seed", () => {
    const first = renderSceneToSvg(sampleScene, "render-seed");
    const second = renderSceneToSvg(sampleScene, "render-seed");

    expect(first).toBe(second);
  });

  it("changes the wobble when the seed changes", () => {
    const first = renderSceneToSvg(sampleScene, "render-seed");
    const second = renderSceneToSvg(sampleScene, "other-seed");

    expect(first).not.toBe(second);
  });

  it("escapes text content safely", () => {
    const svg = renderSceneToSvg(sampleScene, "render-seed");

    expect(svg).toContain("cat &lt;3");
    expect(svg).not.toContain("cat <3");
  });
});

