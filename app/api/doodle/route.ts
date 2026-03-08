import { NextResponse } from "next/server";
import { DoodleProviderConfigError, PromptValidationError } from "@/lib/doodle/errors";
import { normalizeDoodleProviderName } from "@/lib/doodle/provider-options";
import { resolveDoodleProvider } from "@/lib/doodle/provider";
import { generateDoodlePayload } from "@/lib/doodle/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const prompt = typeof body === "object" && body !== null && "prompt" in body ? body.prompt : undefined;
  const rawProvider = typeof body === "object" && body !== null && "provider" in body ? body.provider : undefined;

  if (typeof prompt !== "string") {
    return NextResponse.json({ error: "Request body must include a string prompt." }, { status: 400 });
  }

  if (rawProvider !== undefined && typeof rawProvider !== "string") {
    return NextResponse.json({ error: "Provider must be a string when supplied." }, { status: 400 });
  }

  const providerName = normalizeDoodleProviderName(rawProvider);

  if (rawProvider?.trim() && !providerName) {
    return NextResponse.json({ error: `Unsupported doodle provider: ${rawProvider}` }, { status: 400 });
  }

  try {
    const payload = await generateDoodlePayload(prompt, {
      provider: resolveDoodleProvider(providerName),
    });
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof PromptValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof DoodleProviderConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json({ error: "The doodle engine spilled juice on itself." }, { status: 500 });
  }
}
