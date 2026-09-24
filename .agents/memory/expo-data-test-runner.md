---
name: Expo data test runner
description: How to run pure Expo data-module tests in this workspace without depending on Metro path resolution.
---

When a pure TypeScript test from the Expo artifact is executed through the API workspace's `tsx`, its tsconfig path aliases are not reliably applied. Use relative imports for the data module's runtime and type-only dependencies, and expose the command through the Expo package script.

**Why:** The API workspace provides the available Node test runner, but it resolves the test from its own package context rather than the Expo app's Metro configuration.

**How to apply:** Keep data tests independent of React Native runtime modules and run them with the existing API workspace `tsx`; keep Expo bundle typechecking separate from Node test typing.