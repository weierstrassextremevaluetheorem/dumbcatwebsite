import { spawn } from "node:child_process";
import type { DoodleProvider } from "@/lib/doodle/contracts";
import { DoodleProviderConfigError } from "@/lib/doodle/errors";
import { buildCliDoodlePrompt, DOODLE_MODEL_INSTRUCTIONS } from "@/lib/doodle/prompt";
import { doodleSceneSchema } from "@/lib/doodle/schema";

const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_CHARS = 200_000;

type CliProviderName = "anthropic-cli" | "openai-cli" | "gemini-cli";
type CliStdinMode = "none" | "full_prompt";

interface CliProviderDefinition {
  envPrefix: string;
  label: string;
  name: CliProviderName;
}

const CLI_PROVIDER_DEFINITIONS: Record<CliProviderName, CliProviderDefinition> = {
  "anthropic-cli": {
    envPrefix: "DOODLE_ANTHROPIC_CLI",
    label: "Anthropic CLI",
    name: "anthropic-cli",
  },
  "openai-cli": {
    envPrefix: "DOODLE_OPENAI_CLI",
    label: "OpenAI CLI",
    name: "openai-cli",
  },
  "gemini-cli": {
    envPrefix: "DOODLE_GEMINI_CLI",
    label: "Gemini CLI",
    name: "gemini-cli",
  },
};

class CliDoodleProvider implements DoodleProvider {
  constructor(private readonly definition: CliProviderDefinition) {}

  async generateScene(input: { prompt: string; seed: string }) {
    const { args, command, stdin } = this.resolveCommand(input);
    const stdout = await runCliCommand({
      args,
      command,
      input: stdin,
      label: this.definition.label,
    });
    const jsonText = extractJsonPayload(stdout);

    try {
      return doodleSceneSchema.parse(JSON.parse(jsonText));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown parse error";
      throw new Error(`${this.definition.label} returned invalid doodle JSON: ${detail}`);
    }
  }

  private resolveCommand(input: { prompt: string; seed: string }) {
    const commandVar = `${this.definition.envPrefix}_COMMAND`;
    const argsVar = `${this.definition.envPrefix}_ARGS_JSON`;
    const stdinVar = `${this.definition.envPrefix}_STDIN`;
    const rawCommand = process.env[commandVar]?.trim();

    if (!rawCommand) {
      throw new DoodleProviderConfigError(
        `${commandVar} is required for DOODLE_PROVIDER=${this.definition.name}.`,
      );
    }

    const configuredArgs = parseArgsJson(process.env[argsVar], argsVar);
    const stdinMode = parseStdinMode(process.env[stdinVar], stdinVar);
    const fullPrompt = buildCliDoodlePrompt(input.prompt, input.seed);
    const replacements: Record<string, string> = {
      "{{full_prompt}}": fullPrompt,
      "{{instructions}}": DOODLE_MODEL_INSTRUCTIONS,
      "{{seed}}": input.seed,
      "{{user_prompt}}": input.prompt,
    };
    let promptWasInterpolated = false;

    const args = configuredArgs.map((arg) => {
      let nextArg = arg;

      for (const [token, value] of Object.entries(replacements)) {
        if (nextArg.includes(token)) {
          nextArg = nextArg.split(token).join(value);

          if (token === "{{full_prompt}}" || token === "{{user_prompt}}") {
            promptWasInterpolated = true;
          }
        }
      }

      return nextArg;
    });

    if (stdinMode === "none" && !promptWasInterpolated) {
      args.push(fullPrompt);
    }

    return {
      args,
      command: rawCommand,
      stdin: stdinMode === "full_prompt" ? fullPrompt : undefined,
    };
  }
}

function parseArgsJson(rawValue: string | undefined, envVar: string): string[] {
  if (!rawValue?.trim()) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new DoodleProviderConfigError(`${envVar} must be valid JSON containing an array of strings.`);
  }

  if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== "string")) {
    throw new DoodleProviderConfigError(`${envVar} must be a JSON array of strings.`);
  }

  return parsed;
}

function parseStdinMode(rawValue: string | undefined, envVar: string): CliStdinMode {
  if (!rawValue?.trim()) {
    return "none";
  }

  const normalized = rawValue.trim().toLowerCase();

  if (normalized === "none" || normalized === "full_prompt") {
    return normalized;
  }

  throw new DoodleProviderConfigError(`${envVar} must be either "none" or "full_prompt".`);
}

async function runCliCommand(options: {
  args: string[];
  command: string;
  input?: string;
  label: string;
}): Promise<string> {
  const { args, command, input, label } = options;

  return await new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      callback();
    };

    const timeoutId = setTimeout(() => {
      child.kill("SIGTERM");
      settle(() => reject(new Error(`${label} timed out after ${DEFAULT_TIMEOUT_MS}ms.`)));
    }, DEFAULT_TIMEOUT_MS);

    child.on("error", (error) => {
      settle(() => {
        reject(new Error(`${label} could not start "${command}": ${error.message}`));
      });
    });

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();

      if (stdout.length > MAX_OUTPUT_CHARS) {
        child.kill("SIGTERM");
        settle(() => reject(new Error(`${label} produced too much output.`)));
      }
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();

      if (stderr.length > MAX_OUTPUT_CHARS) {
        child.kill("SIGTERM");
        settle(() => reject(new Error(`${label} produced too much stderr output.`)));
      }
    });

    child.on("close", (code) => {
      settle(() => {
        if (code === 0) {
          resolve(stdout);
          return;
        }

        reject(
          new Error(
            `${label} exited with code ${code}.${formatCliDetail(stderr) || formatCliDetail(stdout)}`,
          ),
        );
      });
    });

    if (input) {
      child.stdin.write(input);
    }

    child.stdin.end();
  });
}

function formatCliDetail(output: string): string {
  const trimmed = output.trim();

  if (!trimmed) {
    return "";
  }

  return ` ${trimmed.slice(0, 220)}`;
}

function extractJsonPayload(output: string): string {
  const trimmed = output.trim();

  if (!trimmed) {
    throw new Error("CLI returned no output.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function createAnthropicCliDoodleProvider(): DoodleProvider {
  return new CliDoodleProvider(CLI_PROVIDER_DEFINITIONS["anthropic-cli"]);
}

export function createOpenAICliDoodleProvider(): DoodleProvider {
  return new CliDoodleProvider(CLI_PROVIDER_DEFINITIONS["openai-cli"]);
}

export function createGeminiCliDoodleProvider(): DoodleProvider {
  return new CliDoodleProvider(CLI_PROVIDER_DEFINITIONS["gemini-cli"]);
}
