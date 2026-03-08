"use client";

import { useEffect, useRef, useState } from "react";
import { buildErrorScene } from "@/lib/doodle/mock-scenes";
import { DOODLE_PROVIDER_OPTIONS, type DoodleProviderName } from "@/lib/doodle/provider-options";
import { renderSceneToSvg } from "@/lib/doodle/renderer";
import styles from "./doodle-playground.module.css";

type UiStatus = "idle" | "loading" | "success" | "error";

const MAX_PROMPT_LENGTH = 140;

export function DoodlePlayground({ defaultProvider }: { defaultProvider: DoodleProviderName }) {
  const [prompt, setPrompt] = useState("");
  const [activePrompt, setActivePrompt] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<DoodleProviderName>(defaultProvider);
  const [activeProvider, setActiveProvider] = useState<DoodleProviderName>();
  const [status, setStatus] = useState<UiStatus>("idle");
  const [svg, setSvg] = useState("");
  const [caption, setCaption] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const trimmedPrompt = prompt.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedPrompt || status === "loading") {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setActivePrompt(trimmedPrompt);
    setActiveProvider(selectedProvider);
    setStatus("loading");
    setErrorMessage(undefined);
    setCaption(undefined);

    try {
      const response = await fetch("/api/doodle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmedPrompt, provider: selectedProvider }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | { svg?: string; caption?: string; error?: string }
        | null;

      if (!response.ok || !payload?.svg) {
        throw new Error(payload?.error ?? "The fake brain tripped on a cable.");
      }

      setSvg(payload.svg);
      setCaption(payload.caption);
      setStatus("success");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const seed = crypto.randomUUID();
      const fallbackScene = buildErrorScene(seed, "bad server day");
      setSvg(renderSceneToSvg(fallbackScene, seed));
      setCaption(fallbackScene.caption ?? undefined);
      setErrorMessage(error instanceof Error ? error.message : "The fake brain tripped on a cable.");
      setStatus("error");
    }
  }

  function handleClear() {
    abortRef.current?.abort();
    abortRef.current = null;
    setPrompt("");
    setActivePrompt("");
    setActiveProvider(undefined);
    setStatus("idle");
    setSvg("");
    setCaption(undefined);
    setErrorMessage(undefined);
  }

  const providerMeta =
    DOODLE_PROVIDER_OPTIONS.find((option) => option.value === selectedProvider) ?? DOODLE_PROVIDER_OPTIONS[0];
  const activeProviderMeta = activeProvider
    ? (DOODLE_PROVIDER_OPTIONS.find((option) => option.value === activeProvider) ?? providerMeta)
    : providerMeta;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <ScribbleBadge />
            <div>
              <p className={styles.kicker}>your ai slop bores me</p>
              <h1 className={styles.title}>so i made a worse one</h1>
            </div>
          </div>
          <button className={styles.clearButton} type="button" onClick={handleClear}>
            clear
          </button>
        </header>

        <form className={styles.composer} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="prompt">
            say a thing
          </label>
          <textarea
            id="prompt"
            className={styles.textarea}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={MAX_PROMPT_LENGTH}
            placeholder="cute cat yo"
            rows={3}
          />
          <div className={styles.optionsRow}>
            <div className={styles.fieldStack}>
              <label className={styles.smallLabel} htmlFor="provider">
                brain hookup
              </label>
              <select
                id="provider"
                className={styles.select}
                value={selectedProvider}
                onChange={(event) => setSelectedProvider(event.target.value as DoodleProviderName)}
              >
                {DOODLE_PROVIDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className={styles.providerHint}>{providerMeta.hint}</p>
            </div>
          </div>
          <div className={styles.composerFooter}>
            <span className={styles.helperText}>{prompt.length}/{MAX_PROMPT_LENGTH}</span>
            <button className={styles.generateButton} type="submit" disabled={!trimmedPrompt || status === "loading"}>
              {status === "loading" ? "drawing badly..." : "draw it bad"}
            </button>
          </div>
        </form>

        <section className={styles.stage}>
          {activePrompt ? (
            <div className={styles.userBubble}>
              <span className={styles.smallLabel}>you asked for text with {activeProviderMeta.label}</span>
              <p>{activePrompt}</p>
            </div>
          ) : (
            <div className={styles.idleBubble}>
              <span className={styles.smallLabel}>prompt ideas</span>
              <p>sad wizard cat, fish in love, haunted carrot</p>
            </div>
          )}

          {status === "loading" ? <LoadingCard /> : null}

          {status === "idle" ? <IdleCard /> : null}

          {status === "success" || status === "error" ? (
            <article className={styles.resultCard} aria-live="polite">
              <div className={styles.resultHeader}>
                <div>
                  <span className={styles.smallLabel}>"ai" responded via {activeProviderMeta.label}</span>
                  <p className={styles.resultTitle}>{caption ?? "look what it did"}</p>
                </div>
                {status === "error" ? <span className={styles.errorPill}>scuffed</span> : null}
              </div>
              <div
                className={styles.canvasFrame}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
            </article>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function LoadingCard() {
  return (
    <article className={styles.resultCard} aria-live="polite">
      <div className={styles.resultHeader}>
        <div>
          <span className={styles.smallLabel}>"ai" responded</span>
          <p className={styles.resultTitle}>thinking real hard...</p>
        </div>
      </div>
      <div className={styles.loadingCanvas}>
        <div className={styles.loadingScribble} />
        <p>trying to remember how circles work</p>
      </div>
    </article>
  );
}

function IdleCard() {
  return (
    <article className={styles.resultCard}>
      <div className={styles.resultHeader}>
        <div>
          <span className={styles.smallLabel}>"ai" responded</span>
          <p className={styles.resultTitle}>nothing yet</p>
        </div>
      </div>
      <div className={styles.idleCardBody}>
        <p>type a goofy prompt and it will cough up a fake little doodle.</p>
      </div>
    </article>
  );
}

function ScribbleBadge() {
  return (
    <svg
      aria-hidden="true"
      className={styles.badge}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 52C13 28 41 10 64 16C89 22 107 42 98 68C91 88 67 97 43 92C21 88 15 70 18 52Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M28 39C48 20 86 29 93 55C98 74 71 92 47 83C29 77 22 56 28 39Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M29 56C44 38 76 42 84 61C90 75 69 88 49 82C33 77 22 65 29 56Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
