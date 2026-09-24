---
name: Scoped workspace dependencies
description: Package installation behavior for this pnpm monorepo when a dependency belongs to one workspace package.
---

Use the package manager's workspace filter when adding a dependency to a single artifact or library; an unscoped install targets the repository root and is rejected by the workspace guard.

**Why:** The repository intentionally prevents accidental root dependency additions, and server-only packages should not leak into mobile or unrelated artifacts.

**How to apply:** Run the equivalent of `pnpm --filter <workspace-package> add <dependency>` and verify both that package's manifest and the lockfile changed, while unrelated project configuration remains unchanged.