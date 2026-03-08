import type { DoodleApiResponse, DoodleProvider } from "@/lib/doodle/contracts";
import { DoodleProviderConfigError, PromptValidationError } from "@/lib/doodle/errors";
import { buildFallbackScene } from "@/lib/doodle/mock-scenes";
import { resolveDoodleProvider } from "@/lib/doodle/provider";
import { renderSceneToSvg } from "@/lib/doodle/renderer";
import { parseDoodleScene } from "@/lib/doodle/schema";

const MAX_PROMPT_LENGTH = 140;
const PROVIDER_TIMEOUT_MS = 15_000;

export interface GenerateDoodleOptions {
  provider?: DoodleProvider;
  seed?: string;
}

export async function generateDoodlePayload(
  promptInput: string,
  options: GenerateDoodleOptions = {},
): Promise<DoodleApiResponse> {
  const prompt = promptInput.trim();

  if (!prompt) {
    throw new PromptValidationError("Prompt cannot be empty.");
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new PromptValidationError(`Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`);
  }

  const seed = options.seed ?? crypto.randomUUID();
  const provider = options.provider ?? resolveDoodleProvider();

  try {
    const maybeScene = await withTimeout(provider.generateScene({ prompt, seed }), PROVIDER_TIMEOUT_MS);
    const scene = parseDoodleScene(maybeScene);
    return toApiResponse(prompt, seed, scene);
  } catch (error) {
    if (error instanceof PromptValidationError || error instanceof DoodleProviderConfigError) {
      throw error;
    }

    const fallbackScene = buildFallbackScene(prompt, seed);
    return toApiResponse(prompt, seed, fallbackScene);
  }
}

function toApiResponse(prompt: string, seed: string, scene: ReturnType<typeof parseDoodleScene>): DoodleApiResponse {
  const payload: DoodleApiResponse = {
    prompt,
    seed,
    scene,
    svg: renderSceneToSvg(scene, seed),
  };

  if (scene.caption) {
    payload.caption = scene.caption;
  }

  return payload;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Provider timed out after ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
