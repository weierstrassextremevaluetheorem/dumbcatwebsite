export const DOODLE_PROVIDER_NAMES = [
  "mock",
  "openai",
  "anthropic-cli",
  "openai-cli",
  "gemini-cli",
] as const;

export type DoodleProviderName = (typeof DOODLE_PROVIDER_NAMES)[number];

export const DOODLE_PROVIDER_OPTIONS: Array<{
  value: DoodleProviderName;
  label: string;
  hint: string;
}> = [
  {
    value: "mock",
    label: "local fake brain",
    hint: "fast dumb placeholder drawings",
  },
  {
    value: "openai",
    label: "OpenAI API",
    hint: "uses OPENAI_API_KEY on the server",
  },
  {
    value: "anthropic-cli",
    label: "Anthropic Pro/Max",
    hint: "uses your local Claude Code login in the terminal",
  },
  {
    value: "openai-cli",
    label: "ChatGPT/Codex",
    hint: "uses your local Codex login instead of an API key",
  },
  {
    value: "gemini-cli",
    label: "Gemini CLI",
    hint: "runs your local Gemini command",
  },
];

const DOODLE_PROVIDER_ALIASES: Record<string, DoodleProviderName> = {
  codex: "openai-cli",
  "codex-cli": "openai-cli",
  chatgpt: "openai-cli",
  "chatgpt-cli": "openai-cli",
  claude: "anthropic-cli",
  "claude-cli": "anthropic-cli",
  "claude-code": "anthropic-cli",
};

export function normalizeDoodleProviderName(value: string | null | undefined): DoodleProviderName | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  return DOODLE_PROVIDER_NAMES.find((providerName) => providerName === normalized) ?? DOODLE_PROVIDER_ALIASES[normalized];
}
