# Contributing to Volt Renderer

## Scripts

| Command | Purpose |
|---------|---------|
| `yarn build` | Build the renderer with Vite |
| `yarn compile` / `yarn compile:fast` | Type check (`tsc` / `tsgo`) |
| `yarn eslint` / `yarn eslint-fix` | Lint |
| `yarn test` / `yarn test:watch` | Vitest |
| `yarn test:coverage` | Tests with coverage |
| `yarn test:e2e:inventory`, `yarn test:e2e:login-reconnect`, `yarn test:e2e:messenger` | End-to-end tests |
| `yarn test:planes` | Plane check |

Follow [AGENTS.md](AGENTS.md) for commits and pull requests. Packet details are in `docs/protocol/`.

## Releases

A release is started by hand. Run **Actions > Build & Publish Renderer Release** on `main`. The optional `commit` input selects the exact commit to build.

- The release is tagged `renderer-v<package version>-<short sha>` and has `volt-renderer.zip` (the contents of `dist/`), plus GitHub's source archives.
- Release runs queue instead of replacing waiting runs (up to GitHub's limit of 100).
- Assets upload to a draft first. If a run fails, run it again and it continues the same draft. An already published tag stays unchanged.
