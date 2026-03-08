// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DoodlePlayground } from "@/components/doodle-playground";

describe("DoodlePlayground", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits a prompt, shows loading, renders the result, and clears it", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<Response>();
    const fetchMock = vi.fn().mockReturnValue(deferred.promise);

    vi.stubGlobal("fetch", fetchMock);

    render(<DoodlePlayground defaultProvider="openai-cli" />);

    await user.type(screen.getByLabelText("say a thing"), "cute cat yo");
    await user.selectOptions(screen.getByLabelText("brain hookup"), "anthropic-cli");
    await user.click(screen.getByRole("button", { name: "draw it bad" }));

    expect(screen.getByText("thinking real hard...")).toBeInTheDocument();
    expect(screen.getByText("you asked for text with Anthropic Pro/Max")).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      prompt: "cute cat yo",
      provider: "anthropic-cli",
    });

    deferred.resolve(
      new Response(
        JSON.stringify({
          svg: `<svg xmlns="http://www.w3.org/2000/svg"><text>cat</text></svg>`,
          caption: "cat but lazy",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    expect(await screen.findByText("cat but lazy")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "clear" }));

    expect(screen.getByDisplayValue("")).toBeInTheDocument();
    expect(screen.queryByText("cute cat yo")).not.toBeInTheDocument();
    expect(screen.getByLabelText("brain hookup")).toHaveValue("anthropic-cli");
  });
});

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
