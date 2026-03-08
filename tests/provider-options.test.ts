import { describe, expect, it } from "vitest";
import { normalizeDoodleProviderName } from "@/lib/doodle/provider-options";

describe("normalizeDoodleProviderName", () => {
  it("maps subscription-oriented aliases to canonical providers", () => {
    expect(normalizeDoodleProviderName("codex")).toBe("openai-cli");
    expect(normalizeDoodleProviderName("chatgpt")).toBe("openai-cli");
    expect(normalizeDoodleProviderName("claude")).toBe("anthropic-cli");
    expect(normalizeDoodleProviderName("claude-code")).toBe("anthropic-cli");
  });
});
