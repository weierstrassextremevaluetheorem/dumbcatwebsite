# dumbcatwebsite

A deliberately dumb doodle AI website built with Next.js.

## Local setup

1. `cp .env.example .env.local`
2. Pick a default backend with `DOODLE_PROVIDER`.
3. Configure that backend:
   - `mock` needs nothing.
   - `openai` needs `OPENAI_API_KEY`.
   - `anthropic-cli`, `openai-cli`, and `gemini-cli` need a local command in the matching `DOODLE_*_CLI_COMMAND` env var.
4. `npm install --cache .npm-cache`
5. `npm run dev`

The UI now has a `brain hookup` selector, so you can switch providers per prompt without restarting the app.

## Subscription-backed CLI use

This app cannot talk directly to a ChatGPT Plus/Pro or Anthropic Pro/Max web subscription as if it were an API key. The supported path is:

- ChatGPT/Codex subscription -> local `codex` CLI login -> this app runs `codex exec`
- Anthropic Pro/Max subscription -> local `claude` CLI login -> this app runs `claude -p`

That is the point of the `openai-cli` and `anthropic-cli` providers.

## CLI provider config

CLI-backed providers run a local command from the Next.js server process and expect valid doodle JSON on stdout.

- `DOODLE_ANTHROPIC_CLI_COMMAND`, `DOODLE_OPENAI_CLI_COMMAND`, `DOODLE_GEMINI_CLI_COMMAND`: executable name or absolute path.
- `DOODLE_*_CLI_ARGS_JSON`: JSON array of args. If you omit `{{full_prompt}}`, the app appends the generated prompt as the last arg.
- `DOODLE_*_CLI_STDIN`: `none` or `full_prompt`.

Available prompt tokens inside `DOODLE_*_CLI_ARGS_JSON`:

- `{{full_prompt}}`: full doodle instructions plus the user prompt.
- `{{user_prompt}}`: only the user-entered text.
- `{{seed}}`: the request seed.
- `{{instructions}}`: the shared doodle system instructions.

Example shapes:

- ChatGPT/Codex subscription preset:

```env
DOODLE_PROVIDER=openai-cli
DOODLE_OPENAI_CLI_COMMAND=codex
DOODLE_OPENAI_CLI_ARGS_JSON=["exec","--skip-git-repo-check","--ephemeral","--color","never","-"]
DOODLE_OPENAI_CLI_STDIN=full_prompt
```

- Anthropic Pro/Max subscription preset:

```env
DOODLE_PROVIDER=anthropic-cli
DOODLE_ANTHROPIC_CLI_COMMAND=claude
DOODLE_ANTHROPIC_CLI_ARGS_JSON=["-p","{{full_prompt}}"]
DOODLE_ANTHROPIC_CLI_STDIN=none
```

- Gemini CLI style:

```env
DOODLE_PROVIDER=gemini-cli
DOODLE_GEMINI_CLI_COMMAND=gemini
DOODLE_GEMINI_CLI_ARGS_JSON=["-p","{{full_prompt}}"]
DOODLE_GEMINI_CLI_STDIN=none
```

Accepted provider aliases include `codex`, `codex-cli`, `chatgpt`, `claude`, and `claude-code` in addition to the canonical provider names.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run typecheck`
