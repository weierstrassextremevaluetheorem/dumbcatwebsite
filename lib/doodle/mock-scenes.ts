import { createSeededRandom, pickOne, randomBetween } from "@/lib/doodle/random";
import {
  DOODLE_HEIGHT,
  DOODLE_WIDTH,
  type DoodleColorName,
  type DoodleElement,
  type DoodlePoint,
  type DoodleScene,
} from "@/lib/doodle/schema";

type SceneCategory =
  | "cat"
  | "dog"
  | "fish"
  | "house"
  | "tree"
  | "car"
  | "person"
  | "bird"
  | "robot"
  | "ghost"
  | "blob";

export function buildMockScene(prompt: string, seed: string): DoodleScene {
  const rng = createSeededRandom(seed);
  const category = detectCategory(prompt);
  const scene = sceneBuilders[category](prompt, rng);

  return {
    width: DOODLE_WIDTH,
    height: DOODLE_HEIGHT,
    caption: scene.caption,
    elements: scene.elements,
  };
}

export function buildFallbackScene(prompt: string, seed: string): DoodleScene {
  const base = buildMockScene(prompt, `${seed}:fallback`);
  return {
    ...base,
    caption: "model sneezed. here.",
  };
}

export function buildErrorScene(seed: string, label = "uh oh"): DoodleScene {
  const rng = createSeededRandom(`${seed}:error`);
  const elements: DoodleElement[] = [
    {
      type: "circle",
      center: jitterPoint({ x: 0.5, y: 0.43 }, rng, 0.01),
      radius: 0.18,
      thickness: 0.01,
      color: "charcoal",
      fillStyle: "stroke",
    },
    {
      type: "circle",
      center: jitterPoint({ x: 0.44, y: 0.39 }, rng, 0.008),
      radius: 0.011,
      thickness: 0.008,
      color: "charcoal",
      fillStyle: "fill",
    },
    {
      type: "circle",
      center: jitterPoint({ x: 0.56, y: 0.39 }, rng, 0.008),
      radius: 0.011,
      thickness: 0.008,
      color: "charcoal",
      fillStyle: "fill",
    },
    {
      type: "polyline",
      points: [
        jitterPoint({ x: 0.4, y: 0.55 }, rng, 0.01),
        jitterPoint({ x: 0.48, y: 0.5 }, rng, 0.01),
        jitterPoint({ x: 0.6, y: 0.55 }, rng, 0.01),
      ],
      thickness: 0.009,
      color: "charcoal",
    },
    {
      type: "text",
      at: jitterPoint({ x: 0.34, y: 0.77 }, rng, 0.015),
      size: 0.065,
      value: label.slice(0, 18),
      color: "blush",
    },
  ];

  return {
    width: DOODLE_WIDTH,
    height: DOODLE_HEIGHT,
    caption: "computer said nope",
    elements,
  };
}

const sceneBuilders: Record<
  SceneCategory,
  (prompt: string, rng: () => number) => { caption: string | null; elements: DoodleElement[] }
> = {
  cat: buildCatScene,
  dog: buildDogScene,
  fish: buildFishScene,
  house: buildHouseScene,
  tree: buildTreeScene,
  car: buildCarScene,
  person: buildPersonScene,
  bird: buildBirdScene,
  robot: buildRobotScene,
  ghost: buildGhostScene,
  blob: buildBlobScene,
};

function detectCategory(prompt: string): SceneCategory {
  const value = prompt.toLowerCase();

  if (/(cat|kitten|kitty)/.test(value)) return "cat";
  if (/(dog|puppy|shiba|corgi)/.test(value)) return "dog";
  if (/(fish|shark|whale)/.test(value)) return "fish";
  if (/(house|home|castle|hut)/.test(value)) return "house";
  if (/(tree|forest|plant|flower)/.test(value)) return "tree";
  if (/(car|truck|taxi|bus)/.test(value)) return "car";
  if (/(bird|chicken|duck|crow)/.test(value)) return "bird";
  if (/(robot|mech|android)/.test(value)) return "robot";
  if (/(ghost|spooky|monster)/.test(value)) return "ghost";
  if (/(man|woman|person|boy|girl|wizard|pirate)/.test(value)) return "person";

  return "blob";
}

function buildCatScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["tiny cat energy", "cat but lazy", "meow enough"]),
    elements: [
      polyline(
        [
          [0.33, 0.29],
          [0.39, 0.14],
          [0.48, 0.25],
          [0.57, 0.14],
          [0.66, 0.28],
          [0.65, 0.54],
          [0.59, 0.73],
          [0.5, 0.82],
          [0.4, 0.74],
          [0.34, 0.56],
          [0.33, 0.29],
        ],
        rng,
      ),
      circle([0.45, 0.46], 0.01, "charcoal", "fill", rng),
      circle([0.56, 0.46], 0.01, "charcoal", "fill", rng),
      circle([0.51, 0.54], 0.007, "charcoal", "stroke", rng),
      line([0.5, 0.55], [0.49, 0.66], rng),
      line([0.51, 0.55], [0.54, 0.66], rng),
      line([0.42, 0.56], [0.22, 0.48], rng),
      line([0.42, 0.62], [0.17, 0.62], rng),
      line([0.42, 0.68], [0.22, 0.77], rng),
      line([0.58, 0.56], [0.78, 0.46], rng),
      line([0.58, 0.62], [0.83, 0.62], rng),
      line([0.58, 0.68], [0.79, 0.78], rng),
      polyline(
        [
          [0.18, 0.18],
          [0.15, 0.13],
          [0.12, 0.11],
          [0.1, 0.14],
          [0.12, 0.18],
          [0.18, 0.22],
          [0.24, 0.18],
          [0.26, 0.14],
          [0.24, 0.11],
          [0.21, 0.13],
          [0.18, 0.18],
        ],
        rng,
        "blush",
        0.006,
      ),
    ],
  };
}

function buildDogScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["dog shaped somehow", "good enough dog", "woof maybe"]),
    elements: [
      polyline(
        [
          [0.34, 0.26],
          [0.28, 0.17],
          [0.24, 0.33],
          [0.33, 0.38],
          [0.35, 0.65],
          [0.44, 0.8],
          [0.56, 0.8],
          [0.65, 0.64],
          [0.67, 0.38],
          [0.76, 0.33],
          [0.72, 0.17],
          [0.66, 0.26],
          [0.34, 0.26],
        ],
        rng,
      ),
      circle([0.46, 0.47], 0.011, "charcoal", "fill", rng),
      circle([0.56, 0.47], 0.011, "charcoal", "fill", rng),
      ellipse([0.51, 0.58], 0.03, 0.025, "charcoal", "stroke", rng),
      line([0.48, 0.61], [0.45, 0.67], rng),
      line([0.54, 0.61], [0.58, 0.67], rng),
      polyline(
        [
          [0.18, 0.76],
          [0.22, 0.7],
          [0.26, 0.76],
          [0.3, 0.7],
          [0.34, 0.76],
        ],
        rng,
        "banana",
        0.006,
      ),
    ],
  };
}

function buildFishScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["fish but tired", "wet little guy", "blub enough"]),
    elements: [
      ellipse([0.48, 0.52], 0.22, 0.12, "charcoal", "stroke", rng),
      polyline(
        [
          [0.69, 0.52],
          [0.84, 0.38],
          [0.84, 0.66],
          [0.69, 0.52],
        ],
        rng,
      ),
      polyline(
        [
          [0.44, 0.52],
          [0.55, 0.36],
          [0.6, 0.5],
        ],
        rng,
        "sky",
        0.008,
      ),
      circle([0.36, 0.5], 0.012, "charcoal", "fill", rng),
      circle([0.23, 0.28], 0.025, "sky", "stroke", rng),
      circle([0.18, 0.2], 0.016, "sky", "stroke", rng),
      line([0.12, 0.79], [0.88, 0.79], rng, "charcoal", 0.008),
    ],
  };
}

function buildHouseScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["mortgage-free somehow", "tiny weird house", "house enough"]),
    elements: [
      polyline(
        [
          [0.29, 0.38],
          [0.29, 0.72],
          [0.69, 0.72],
          [0.69, 0.38],
          [0.29, 0.38],
        ],
        rng,
      ),
      polyline(
        [
          [0.24, 0.4],
          [0.49, 0.18],
          [0.74, 0.4],
        ],
        rng,
      ),
      polyline(
        [
          [0.44, 0.72],
          [0.44, 0.5],
          [0.55, 0.5],
          [0.55, 0.72],
        ],
        rng,
      ),
      line([0.34, 0.49], [0.42, 0.49], rng),
      line([0.38, 0.45], [0.38, 0.54], rng),
      circle([0.18, 0.22], 0.06, "banana", "stroke", rng),
      line([0.17, 0.1], [0.17, 0.02], rng, "banana", 0.006),
      line([0.08, 0.22], [0.01, 0.22], rng, "banana", 0.006),
      line([0.22, 0.29], [0.27, 0.36], rng, "banana", 0.006),
      line([0.79, 0.77], [0.9, 0.8], rng, "mint", 0.006),
    ],
  };
}

function buildTreeScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["tree i guess", "leaf situation", "nature but dumb"]),
    elements: [
      line([0.47, 0.78], [0.47, 0.45], rng, "charcoal", 0.015),
      line([0.53, 0.78], [0.53, 0.45], rng, "charcoal", 0.015),
      circle([0.5, 0.32], 0.17, "mint", "stroke", rng),
      circle([0.39, 0.37], 0.12, "mint", "stroke", rng),
      circle([0.61, 0.37], 0.12, "mint", "stroke", rng),
      line([0.12, 0.82], [0.88, 0.82], rng),
      polyline(
        [
          [0.75, 0.18],
          [0.79, 0.12],
          [0.83, 0.18],
          [0.79, 0.24],
          [0.75, 0.18],
        ],
        rng,
        "banana",
        0.006,
      ),
    ],
  };
}

function buildCarScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["vroom or whatever", "bad parking art", "car-ish"]),
    elements: [
      polyline(
        [
          [0.24, 0.6],
          [0.31, 0.47],
          [0.6, 0.47],
          [0.72, 0.6],
          [0.78, 0.6],
          [0.78, 0.7],
          [0.24, 0.7],
          [0.24, 0.6],
        ],
        rng,
      ),
      circle([0.37, 0.72], 0.065, "charcoal", "stroke", rng),
      circle([0.65, 0.72], 0.065, "charcoal", "stroke", rng),
      line([0.18, 0.82], [0.84, 0.82], rng),
      line([0.32, 0.48], [0.41, 0.6], rng, "sky", 0.007),
      line([0.58, 0.48], [0.66, 0.59], rng, "sky", 0.007),
      line([0.2, 0.56], [0.14, 0.53], rng, "blush", 0.006),
      line([0.16, 0.53], [0.1, 0.5], rng, "blush", 0.006),
    ],
  };
}

function buildPersonScene(prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["human enough", "one weird little dude", "person, probably"]),
    elements: [
      circle([0.5, 0.28], 0.08, "charcoal", "stroke", rng),
      line([0.5, 0.36], [0.5, 0.63], rng),
      line([0.37, 0.48], [0.63, 0.46], rng),
      line([0.5, 0.63], [0.41, 0.83], rng),
      line([0.5, 0.63], [0.61, 0.83], rng),
      text([0.27, 0.16], cropWord(prompt), rng, "blush", 0.055),
    ],
  };
}

function buildBirdScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["bird with opinions", "tiny flap unit", "tweet-ish"]),
    elements: [
      circle([0.46, 0.46], 0.14, "charcoal", "stroke", rng),
      polyline(
        [
          [0.54, 0.46],
          [0.69, 0.41],
          [0.69, 0.51],
          [0.54, 0.46],
        ],
        rng,
        "banana",
        0.008,
      ),
      line([0.4, 0.43], [0.3, 0.35], rng),
      circle([0.41, 0.42], 0.01, "charcoal", "fill", rng),
      line([0.43, 0.61], [0.41, 0.76], rng),
      line([0.49, 0.61], [0.51, 0.76], rng),
      line([0.33, 0.77], [0.64, 0.77], rng),
    ],
  };
}

function buildRobotScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["robot from 2 dollars", "beep i think", "mechanical enough"]),
    elements: [
      polyline(
        [
          [0.36, 0.22],
          [0.36, 0.48],
          [0.64, 0.48],
          [0.64, 0.22],
          [0.36, 0.22],
        ],
        rng,
      ),
      circle([0.44, 0.33], 0.015, "sky", "fill", rng),
      circle([0.56, 0.33], 0.015, "sky", "fill", rng),
      line([0.43, 0.41], [0.57, 0.41], rng),
      line([0.5, 0.1], [0.5, 0.22], rng),
      circle([0.5, 0.08], 0.02, "blush", "stroke", rng),
      polyline(
        [
          [0.39, 0.48],
          [0.39, 0.73],
          [0.61, 0.73],
          [0.61, 0.48],
          [0.39, 0.48],
        ],
        rng,
      ),
      line([0.39, 0.55], [0.26, 0.62], rng),
      line([0.61, 0.55], [0.74, 0.62], rng),
      line([0.46, 0.73], [0.41, 0.88], rng),
      line([0.54, 0.73], [0.59, 0.88], rng),
    ],
  };
}

function buildGhostScene(_prompt: string, rng: () => number) {
  return {
    caption: pickOne(rng, ["boo but gentle", "spooky blob dept.", "ghost-ish"]),
    elements: [
      polyline(
        [
          [0.34, 0.3],
          [0.39, 0.17],
          [0.5, 0.12],
          [0.62, 0.18],
          [0.66, 0.3],
          [0.66, 0.69],
          [0.59, 0.77],
          [0.53, 0.69],
          [0.47, 0.77],
          [0.41, 0.69],
          [0.34, 0.77],
          [0.34, 0.3],
        ],
        rng,
      ),
      circle([0.45, 0.4], 0.012, "charcoal", "fill", rng),
      circle([0.56, 0.4], 0.012, "charcoal", "fill", rng),
      ellipse([0.5, 0.56], 0.045, 0.03, "blush", "stroke", rng),
      text([0.18, 0.19], "boo", rng, "blush", 0.08),
    ],
  };
}

function buildBlobScene(prompt: string, rng: () => number) {
  const accent = pickOne(rng, ["blush", "sky", "banana"] satisfies readonly DoodleColorName[]);
  return {
    caption: pickOne(rng, ["best i can do", "one weird blob", "art happened"]),
    elements: [
      polyline(
        [
          [0.29, 0.44],
          [0.35, 0.26],
          [0.52, 0.19],
          [0.66, 0.27],
          [0.71, 0.46],
          [0.63, 0.66],
          [0.49, 0.75],
          [0.34, 0.66],
          [0.29, 0.44],
        ],
        rng,
      ),
      circle([0.44, 0.44], 0.013, "charcoal", "fill", rng),
      circle([0.56, 0.44], 0.013, "charcoal", "fill", rng),
      line([0.44, 0.57], [0.56, 0.57], rng),
      text([0.3, 0.16], cropWord(prompt), rng, accent, 0.06),
      polyline(
        [
          [0.72, 0.18],
          [0.77, 0.12],
          [0.82, 0.18],
          [0.77, 0.24],
          [0.72, 0.18],
        ],
        rng,
        accent,
        0.006,
      ),
    ],
  };
}

function polyline(
  points: Array<[number, number]>,
  rng: () => number,
  color: DoodleColorName = "charcoal",
  thickness = 0.009,
): DoodleElement {
  return {
    type: "polyline",
    points: points.map(([x, y]) => jitterPoint({ x, y }, rng, 0.012)),
    thickness,
    color,
  };
}

function line(
  from: [number, number],
  to: [number, number],
  rng: () => number,
  color: DoodleColorName = "charcoal",
  thickness = 0.009,
): DoodleElement {
  return {
    type: "line",
    from: jitterPoint({ x: from[0], y: from[1] }, rng, 0.012),
    to: jitterPoint({ x: to[0], y: to[1] }, rng, 0.012),
    thickness,
    color,
  };
}

function circle(
  center: [number, number],
  radius: number,
  color: DoodleColorName,
  fillStyle: "stroke" | "fill",
  rng: () => number,
): DoodleElement {
  return {
    type: "circle",
    center: jitterPoint({ x: center[0], y: center[1] }, rng, 0.01),
    radius: clamp(radius + randomBetween(rng, -0.004, 0.004), 0.005, 0.22),
    thickness: clamp(0.008 + randomBetween(rng, -0.002, 0.002), 0.002, 0.03),
    color,
    fillStyle,
  };
}

function ellipse(
  center: [number, number],
  radiusX: number,
  radiusY: number,
  color: DoodleColorName,
  fillStyle: "stroke" | "fill",
  rng: () => number,
): DoodleElement {
  return {
    type: "ellipse",
    center: jitterPoint({ x: center[0], y: center[1] }, rng, 0.01),
    radiusX: clamp(radiusX + randomBetween(rng, -0.01, 0.01), 0.01, 0.28),
    radiusY: clamp(radiusY + randomBetween(rng, -0.01, 0.01), 0.01, 0.24),
    thickness: clamp(0.008 + randomBetween(rng, -0.002, 0.002), 0.002, 0.03),
    color,
    fillStyle,
  };
}

function text(
  at: [number, number],
  value: string,
  rng: () => number,
  color: DoodleColorName = "charcoal",
  size = 0.06,
): DoodleElement {
  return {
    type: "text",
    at: jitterPoint({ x: at[0], y: at[1] }, rng, 0.01),
    size,
    value: value.slice(0, 24),
    color,
  };
}

function jitterPoint(point: DoodlePoint, rng: () => number, amount: number): DoodlePoint {
  return {
    x: clamp(point.x + randomBetween(rng, -amount, amount), 0.02, 0.98),
    y: clamp(point.y + randomBetween(rng, -amount, amount), 0.02, 0.98),
  };
}

function cropWord(prompt: string): string {
  const firstWord = prompt
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/\s+/)[0];

  if (!firstWord) {
    return "thing";
  }

  return firstWord.slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number(value.toFixed(4))));
}

