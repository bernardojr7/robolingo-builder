---
name: Clerk Expo setup
description: Environment-specific Clerk Expo package and authentication setup decisions for this project.
---

The Replit package firewall may reject the newest same-day `@clerk/expo` release because it has not reached the configured maturity window. Use the latest mature snapshot compatible with the current Expo SDK, then let `expo install` resolve the SDK-matched native packages.

**Why:** The newest Clerk release was visible in the registry but could not be installed in this workspace until its maturity window elapsed.

**How to apply:** When upgrading Clerk Expo, check release maturity first and preserve the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` forwarding in the Expo dev script and production build environment.