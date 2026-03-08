import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { DoodleProvider } from "@/lib/doodle/contracts";
import { DoodleProviderConfigError } from "@/lib/doodle/errors";
import { buildDoodlePrompt, DOODLE_MODEL_INSTRUCTIONS } from "@/lib/doodle/prompt";
import { doodleSceneSchema } from "@/lib/doodle/schema";

const DEFAULT_MODEL = "gpt-4o-mini";

class OpenAIDoodleProvider implements DoodleProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      throw new DoodleProviderConfigError("OPENAI_API_KEY is required for DOODLE_PROVIDER=openai.");
    }

    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  }

  async generateScene(input: { prompt: string; seed: string }) {
    const response = await this.client.responses.parse({
      model: this.model,
      instructions: DOODLE_MODEL_INSTRUCTIONS,
      input: buildDoodlePrompt(input.prompt, input.seed),
      store: false,
      temperature: 0.8,
      max_output_tokens: 1400,
      text: {
        format: zodTextFormat(doodleSceneSchema, "doodle_scene"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("OpenAI returned no parsed doodle scene.");
    }

    return doodleSceneSchema.parse(response.output_parsed);
  }
}

export function createOpenAIDoodleProvider(): DoodleProvider {
  return new OpenAIDoodleProvider();
}

