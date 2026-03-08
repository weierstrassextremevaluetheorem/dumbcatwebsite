import type { DoodleProvider } from "@/lib/doodle/contracts";
import { DoodleProviderConfigError } from "@/lib/doodle/errors";
import type { DoodleProviderName } from "@/lib/doodle/provider-options";
import { normalizeDoodleProviderName } from "@/lib/doodle/provider-options";
import { mockDoodleProvider } from "@/lib/doodle/providers/mock";
import {
  createAnthropicCliDoodleProvider,
  createGeminiCliDoodleProvider,
  createOpenAICliDoodleProvider,
} from "@/lib/doodle/providers/cli";
import { createOpenAIDoodleProvider } from "@/lib/doodle/providers/openai";

export function getConfiguredDoodleProviderName(): DoodleProviderName {
  const providerName = normalizeDoodleProviderName(process.env.DOODLE_PROVIDER);

  if (process.env.DOODLE_PROVIDER?.trim() && !providerName) {
    throw new DoodleProviderConfigError(`Unsupported doodle provider: ${process.env.DOODLE_PROVIDER}`);
  }

  return providerName || "mock";
}

export function resolveDoodleProvider(requestedProviderName?: DoodleProviderName): DoodleProvider {
  const providerName = requestedProviderName || getConfiguredDoodleProviderName();

  switch (providerName) {
    case "mock":
      return mockDoodleProvider;
    case "openai":
      return createOpenAIDoodleProvider();
    case "anthropic-cli":
      return createAnthropicCliDoodleProvider();
    case "openai-cli":
      return createOpenAICliDoodleProvider();
    case "gemini-cli":
      return createGeminiCliDoodleProvider();
    default:
      throw new DoodleProviderConfigError(`Unsupported doodle provider: ${providerName}`);
  }
}
