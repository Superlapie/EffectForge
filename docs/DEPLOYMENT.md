# Deployment

## GitHub (public repository)

This project is currently hosted on Cursor Origin. To publish as a **public GitHub repository**:

1. Click **Publish** in the Cursor agent view (or use **Reconnect to GitHub** if prompted).
2. Choose a repository name (recommended: `effectforge`).
3. Set visibility to **Public**.
4. Confirm — Cursor will create the GitHub repo and push the current branch.

The agent environment cannot create a GitHub repository without your connected GitHub account.

## Vercel

The web app lives at `apps/web`. Vercel configuration is in `apps/web/vercel.json`.

### Recommended: Git integration

After the GitHub repository exists:

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `apps/web`.
3. Framework preset: **Next.js** (install/build commands are already configured in `vercel.json`).
4. Deploy.

### Monorepo notes

- Root `.npmrc` uses `node-linker=hoisted` for Vercel compatibility with pnpm workspaces.
- Production builds use `next build --webpack` to avoid Turbopack monorepo resolution issues during CI/Vercel builds.

### CLI (requires login)

```bash
cd apps/web
pnpm dlx vercel login
pnpm dlx vercel link
pnpm dlx vercel deploy --prod
```

Anonymous `vercel deploy --temporary` may fail on pnpm symlink layouts; use Git integration or an authenticated CLI session.
