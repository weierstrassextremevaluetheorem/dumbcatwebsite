import type { DoodleScene } from "@/lib/doodle/schema";

export interface DoodleProvider {
  generateScene(input: { prompt: string; seed: string }): Promise<DoodleScene>;
}

export interface DoodleApiResponse {
  prompt: string;
  seed: string;
  scene: DoodleScene;
  svg: string;
  caption?: string;
}

