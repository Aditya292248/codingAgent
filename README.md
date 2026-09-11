# codingAgent

A VS Code coding assistant backed by a local repository graph.

This repository currently contains **infrastructure only**: package
boundaries, shared contracts, build tooling, and executable entry points.
There is no chat UI, no model integration, no graph indexing, no agent loop,
and no file editing yet. Nothing here requires model API credentials.

## Requirements

- Node.js >= 22.12.0 (see [.nvmrc](.nvmrc))
- pnpm 10.24.0 (`corepack enable` will pick this up from `packageManager`)

## Setup

```bash
pnpm install
```

```bash
pnpm build
```

## Commands

All commands are run from the repository root.

| Command | What it does |
| --- | --- |
| `pnpm build` | Builds every package with `tsc --build`, then bundles the extension with esbuild. |
| `pnpm typecheck` | Type-checks the workspace and the fixture repository. |
| `pnpm lint` | Runs ESLint, including the package-boundary rules. |
| `pnpm test` | Runs the `node:test` smoke checks against **built** output. |
| `pnpm clean` | Removes build output. |

`pnpm test` requires `pnpm build` first: the tests load compiled output and
the extension bundle on purpose, so they fail if package exports or
cross-package resolution regress.

## Packages

The dependency direction is one-way; ESLint enforces the two hard rules.

```
shared  <-  graph-core  <-  graph-cli
   ^            ^
   |            |
   +--  agent-core
   |            |
   +------------+---------  apps/vscode-extension
```

| Package | Owns | Must not |
| --- | --- | --- |
| [apps/vscode-extension](apps/vscode-extension) | VS Code activation, commands, editor integration. | — |
| [packages/agent-core](packages/agent-core) | Model communication and agent execution. | import `vscode` |
| [packages/graph-core](packages/graph-core) | Local parsing, indexing, and graph queries. | import `vscode` or `agent-core` |
| [packages/graph-cli](packages/graph-cli) | CLI over `graph-core`. | import `vscode` |
| [packages/shared](packages/shared) | Small contracts genuinely shared across packages. | become a utility grab-bag |

`shared` is deliberately narrow: source locations, graph nodes and edges, and
tool results. Anything used by only one package belongs in that package.

### Module strategy

Every package compiles to CommonJS (`lib/`) with declarations, and is wired
together with TypeScript project references, so cross-package imports resolve
from built output rather than from source. `strict` mode is on, along with
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Shared settings
live in [tsconfig.base.json](tsconfig.base.json).

The extension is bundled to a single CommonJS file by
[esbuild.mjs](apps/vscode-extension/esbuild.mjs), with `vscode` marked
external because the editor supplies it at runtime.

### Coordinate conventions

Defined once in
[packages/shared/src/source-location.ts](packages/shared/src/source-location.ts):

- Lines and columns are **zero-based**; columns count UTF-16 code units, which
  matches the VS Code position model.
- Ranges are **half-open**: `start` inclusive, `end` exclusive.
- Paths are **repository-relative**, forward-slash separated, with no leading
  `./`, and are compared case-sensitively. Use `normalizeRepoPath` to produce
  a conforming value.

## Developing the extension

1. `pnpm install && pnpm build`
2. Open this repository in VS Code.
3. Press <kbd>F5</kbd> (or pick **Run Extension** in the Run and Debug view).
   This bundles the extension and opens an Extension Development Host.
4. In that window, run **Repository Graph: Show Status** from the Command
   Palette.

The command reports the active workspace, the fact that no index has been
built, and the configured model name. It exists to confirm activation and
that the non-editor packages are reachable from the bundle — it does not
pretend to query a graph.

For an incremental loop, run `pnpm --filter vscode-extension run bundle:watch`
and use **Developer: Reload Window** in the host.

## Using the CLI

```bash
node packages/graph-cli/lib/bin.js --help
```

Indexing and query commands land in a later change; `--help` and `--version`
work today, and an unknown command exits with code 2.

## Fixture repository

[fixtures/typescript-repo](fixtures/typescript-repo) is a small TypeScript
project used by future graph and editing tests: an exported function, a
cross-file caller, a class with one method, and an unrelated function that
shares a name in a different scope. It is type-checked with its own
`tsconfig.json` and excluded from workspace compilation and linting, so it
never affects the build of the packages.

It contains no intentional errors.

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) installs with
`pnpm install --frozen-lockfile` and then runs build, typecheck, lint, and
test on every push to `main` and every pull request.
