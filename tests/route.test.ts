import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMockScene } from "@/lib/doodle/mock-scenes";
import type { DoodleProvider } from "@/lib/doodle/contracts";
import { POST } from "@/app/api/doodle/route";
import { resolveDoodleProvider } from "@/lib/doodle/provider";

vi.mock("@/lib/doodle/provider", () => ({
  resolveDoodleProvider: vi.fn(),
}));

describe("POST /api/doodle", () => {
  const mockedResolveProvider = vi.mocked(resolveDoodleProvider);

  beforeEach(() => {
    mockedResolveProvider.mockReset();
  });

  it("returns a doodle payload on success", async () => {
    mockedResolveProvider.mockReturnValue(makeProvider(buildMockScene("cute cat yo", "route-seed")));

    const response = await POST(
      new Request("http://localhost/api/doodle", {
        method: "POST",
        body: JSON.stringify({ prompt: "cute cat yo", provider: "gemini-cli" }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockedResolveProvider).toHaveBeenCalledWith("gemini-cli");
    expect(payload.prompt).toBe("cute cat yo");
    expect(payload.seed).toBeTypeOf("string");
    expect(payload.svg).toContain("<svg");
  });

  it("rejects an empty prompt", async () => {
    const response = await POST(
      new Request("http://localhost/api/doodle", {
        method: "POST",
        body: JSON.stringify({ prompt: "   " }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Prompt cannot be empty.",
    });
  });

  it("rejects an oversized prompt", async () => {
    const response = await POST(
      new Request("http://localhost/api/doodle", {
        method: "POST",
        body: JSON.stringify({ prompt: "x".repeat(141) }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Prompt must be 140 characters or fewer.",
    });
  });

  it("rejects an unsupported provider", async () => {
    const response = await POST(
      new Request("http://localhost/api/doodle", {
        method: "POST",
        body: JSON.stringify({ prompt: "cute cat yo", provider: "banana-core" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Unsupported doodle provider: banana-core",
    });
  });

  it("falls back when the provider returns malformed JSON", async () => {
    mockedResolveProvider.mockReturnValue(
      makeProvider({
        width: 768,
        height: 576,
        caption: "oops",
        elements: [{ type: "not-real" }],
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/doodle", {
        method: "POST",
        body: JSON.stringify({ prompt: "cute cat yo" }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.caption).toBe("model sneezed. here.");
    expect(payload.svg).toContain("<svg");
  });

  it("falls back when the provider throws", async () => {
    mockedResolveProvider.mockReturnValue({
      generateScene: vi.fn().mockRejectedValue(new Error("network exploded")),
    });

    const response = await POST(
      new Request("http://localhost/api/doodle", {
        method: "POST",
        body: JSON.stringify({ prompt: "cute cat yo" }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.caption).toBe("model sneezed. here.");
    expect(payload.svg).toContain("<svg");
  });
});

function makeProvider(scene: unknown): DoodleProvider {
  return {
    generateScene: vi.fn().mockResolvedValue(scene),
  };
}
