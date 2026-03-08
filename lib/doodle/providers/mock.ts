import type { DoodleProvider } from "@/lib/doodle/contracts";
import { buildMockScene } from "@/lib/doodle/mock-scenes";

export const mockDoodleProvider: DoodleProvider = {
  async generateScene({ prompt, seed }) {
    return buildMockScene(prompt, seed);
  },
};

