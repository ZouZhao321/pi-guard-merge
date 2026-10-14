# pi-guard-merge

A pi extension that turns silent merge and trunk-push actions into an explicit confirmation step. Before a `bash` command that merges a PR, changes branch rules, or pushes to `main` / `master` runs, it asks you to approve it — and denial is the default when you do not answer.

## Install

```bash
pi install git:github.com/ZouZhao321/pi-guard-merge
```

For local development, install the checkout directory itself:

```bash
pi install ./guard-merge
```

## What it does

The extension entry point is `guard-merge.ts`, declared in `package.json` as `pi.extensions`. It registers no tools and no commands. It hooks one event:

- `pi.on("tool_call", ...)` — inspects every `bash` tool call and blocks the commands that match the guarded patterns. Only `bash` calls are considered, via `isToolCallEventType("bash", event)`.

Guarded commands, with the dialog label the extension uses for each one:

| Command | Label |
| --- | --- |
| `gh pr merge ...` | `合并 PR` |
| `gh api .../merge`, `.../protection`, `.../rulesets` | `合并 PR 或改动分支规则` |
| `git push` with no branch argument | `推送（未指定分支）` |
| `git push <remote>` with no branch argument | `推送（未指定分支）` |
| `git push ... main` or `git push ... master` | `推送主干分支` |
| `git push ... --all`, `--mirror`, `--force` or `-f` | `推送全部分支或强制推送` |

Three outcomes:

1. Guarded command, UI available — a confirmation dialog shows the matched label and the command, with a 10 second countdown. It calls `ctx.ui.confirm(..., { timeout: TIMEOUT_MS })`. Approving it calls `ctx.ui.notify` and the command runs; no answer within 10 seconds is treated as a denial and the call is blocked with that reason.
2. Guarded command, no UI (`pi -p`, `--mode json`) — the call is blocked immediately, because a non-interactive session has nobody to authorize it. Anything else would make `-p` a bypass channel.
3. Any other command — passed through untouched.

This is a mechanism for interrupting silent actions, not a security boundary. The extension runs with the same privileges as the agent (see pi's `docs/security.md`, "No Built-in Sandbox"). Regex matching can be sidestepped by string concatenation, and the extension file itself can be rewritten.

## Configuration

There is no configuration file and no environment variable. Every knob is a constant in `guard-merge.ts`:

- `TIMEOUT_MS` (`10_000`) — how long the confirmation dialog waits before it counts as a denial. The prompt text is derived from it as `TIMEOUT_MS / 1000` seconds.
- `GUARDED` — the list of `{ pattern, label }` entries shown in the table above. Entries are tested in order against the raw `bash` command string, and the first match wins.

To change what is guarded, edit those constants and reinstall the extension.

## Development

Requires Node.js >= 22.

```bash
npm install
npm run typecheck     # tsc --noEmit
npm run format        # prettier --write guard-merge.ts scripts/
npm run format:check  # prettier --check guard-merge.ts scripts/
npm test              # node scripts/smoke.mjs
```

`npm test` runs the smoke check: it parses `package.json`, asserts that `license` is `MIT`, and asserts that every path listed in `pi.extensions` exists on disk.

To try a local change inside pi, rerun `pi install ./guard-merge`.

## License

MIT. See [LICENSE](./LICENSE).
