# EffectForge

Visual authoring and compilation environment for creating production-ready interactive web visual effects.

> Create interactive web effects visually. Export production-ready code.

## Status

Early development. Phase 0 (repository bootstrap) and Phase 1 (schema and core project model) are complete. See [STATUS.md](./STATUS.md) for current capabilities.

## Development

### Prerequisites

- Node.js 22+
- pnpm 10+

### Setup

```bash
pnpm install
pnpm build
pnpm test
```

### Run web app

```bash
pnpm dev
```

Open [http://localhost:43123](http://localhost:43123).

### CLI

```bash
pnpm --filter @effectforge/cli build
node apps/cli/dist/index.js inspect
node apps/cli/dist/index.js create
```

## Architecture

EffectForge is a TypeScript monorepo:

```text
apps/          web, desktop, cli, mcp
packages/      schema, core, commands, renderer, ...
tooling/       license-audit, benchmarks, release
docs/          architecture and format documentation
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for package dependency flow.

## License

MIT — see LICENSE file. Third-party attributions in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
