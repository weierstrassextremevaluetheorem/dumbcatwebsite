import { createSeededRandom, randomBetween } from "@/lib/doodle/random";
import {
  DOODLE_COLORS,
  DOODLE_HEIGHT,
  DOODLE_WIDTH,
  type DoodleColorName,
  type DoodleElement,
  type DoodlePoint,
  type DoodleScene,
} from "@/lib/doodle/schema";

type PixelPoint = { x: number; y: number };

export function renderSceneToSvg(scene: DoodleScene, seed: string): string {
  const rng = createSeededRandom(`${seed}:render`);
  const renderedElements = scene.elements.map((element, index) => renderElement(element, rng, index)).join("");
  const label = escapeAttribute(scene.caption ?? "dumb doodle");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DOODLE_WIDTH} ${DOODLE_HEIGHT}" role="img" aria-label="${label}">`,
    `<rect width="${DOODLE_WIDTH}" height="${DOODLE_HEIGHT}" rx="28" fill="#fcfbf7" stroke="#d8d4d0" stroke-width="3" />`,
    `<g stroke-linecap="round" stroke-linejoin="round">`,
    renderedElements,
    `</g>`,
    `</svg>`,
  ].join("");
}

function renderElement(element: DoodleElement, rng: () => number, index: number): string {
  const key = `e${index}`;

  switch (element.type) {
    case "line": {
      const points = makeLinePoints(toPixels(element.from), toPixels(element.to), rng);
      return pathTag(points, strokeWidth(element.thickness), element.color, key);
    }
    case "polyline": {
      const points = makePolylinePoints(element.points.map(toPixels), rng);
      return pathTag(points, strokeWidth(element.thickness), element.color, key);
    }
    case "circle": {
      const points = makeEllipsePoints(
        toPixels(element.center),
        element.radius * DOODLE_WIDTH,
        element.radius * DOODLE_HEIGHT,
        rng,
      );
      return pathTag(points, strokeWidth(element.thickness), element.color, key, element.fillStyle);
    }
    case "ellipse": {
      const points = makeEllipsePoints(
        toPixels(element.center),
        element.radiusX * DOODLE_WIDTH,
        element.radiusY * DOODLE_HEIGHT,
        rng,
      );
      return pathTag(points, strokeWidth(element.thickness), element.color, key, element.fillStyle);
    }
    case "text": {
      const anchor = toPixels(element.at);
      const tilt = randomBetween(rng, -6, 6);
      const size = Number((element.size * DOODLE_HEIGHT).toFixed(2));
      return `<text data-key="${key}" x="${anchor.x.toFixed(2)}" y="${anchor.y.toFixed(
        2,
      )}" fill="${DOODLE_COLORS[element.color]}" font-size="${size}" font-family="'Patrick Hand', 'Comic Sans MS', cursive" transform="rotate(${tilt.toFixed(
        2,
      )} ${anchor.x.toFixed(2)} ${anchor.y.toFixed(2)})">${escapeText(element.value)}</text>`;
    }
  }
}

function pathTag(
  points: PixelPoint[],
  width: number,
  color: DoodleColorName,
  key: string,
  fillStyle: "stroke" | "fill" = "stroke",
): string {
  const d = pointsToPath(points);
  const stroke = DOODLE_COLORS[color];
  const fill = fillStyle === "fill" ? `${stroke}22` : "none";

  return `<path data-key="${key}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width.toFixed(
    2,
  )}" />`;
}

function pointsToPath(points: PixelPoint[]): string {
  const [first, ...rest] = points;

  if (!first) {
    return "";
  }

  return [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`, ...rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)].join(
    " ",
  );
}

function makeLinePoints(start: PixelPoint, end: PixelPoint, rng: () => number): PixelPoint[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const normal = { x: -dy / length, y: dx / length };
  const tangent = { x: dx / length, y: dy / length };
  const points: PixelPoint[] = [];

  for (let step = 0; step <= 5; step += 1) {
    const t = step / 5;
    const base = {
      x: start.x + dx * t,
      y: start.y + dy * t,
    };
    const offset = step === 0 || step === 5 ? 0 : randomBetween(rng, -8, 8);
    const slide = step === 0 || step === 5 ? 0 : randomBetween(rng, -3, 3);
    points.push(clampPoint({
      x: base.x + normal.x * offset + tangent.x * slide,
      y: base.y + normal.y * offset + tangent.y * slide,
    }));
  }

  return points;
}

function makePolylinePoints(points: PixelPoint[], rng: () => number): PixelPoint[] {
  const stitched: PixelPoint[] = [];

  points.forEach((point, index) => {
    const nudge = clampPoint({
      x: point.x + randomBetween(rng, -5, 5),
      y: point.y + randomBetween(rng, -5, 5),
    });

    if (index === 0) {
      stitched.push(nudge);
      return;
    }

    const previous = stitched[stitched.length - 1]!;
    const midpoint = clampPoint({
      x: (previous.x + nudge.x) / 2 + randomBetween(rng, -6, 6),
      y: (previous.y + nudge.y) / 2 + randomBetween(rng, -6, 6),
    });

    stitched.push(midpoint, nudge);
  });

  return stitched;
}

function makeEllipsePoints(center: PixelPoint, radiusX: number, radiusY: number, rng: () => number): PixelPoint[] {
  const points: PixelPoint[] = [];

  for (let step = 0; step <= 18; step += 1) {
    const angle = (Math.PI * 2 * step) / 18;
    const wobbleX = radiusX * randomBetween(rng, -0.08, 0.08);
    const wobbleY = radiusY * randomBetween(rng, -0.08, 0.08);
    points.push(
      clampPoint({
        x: center.x + Math.cos(angle) * (radiusX + wobbleX),
        y: center.y + Math.sin(angle) * (radiusY + wobbleY),
      }),
    );
  }

  return points;
}

function toPixels(point: DoodlePoint): PixelPoint {
  return {
    x: point.x * DOODLE_WIDTH,
    y: point.y * DOODLE_HEIGHT,
  };
}

function strokeWidth(thickness: number): number {
  return Math.max(2.5, thickness * DOODLE_WIDTH);
}

function clampPoint(point: PixelPoint): PixelPoint {
  return {
    x: clamp(point.x, 10, DOODLE_WIDTH - 10),
    y: clamp(point.y, 10, DOODLE_HEIGHT - 10),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;");
}

