---
name: Clerk Expo setup
description: Environment-specific Clerk Expo package and authentication setup decisions for this project.
---

The Replit package firewall may reject the newest same-day `@clerk/expo` release because it has not reached the configured maturity window. Use the latest mature snapshot compatible with the current Expo SDK, then let `expo install` resolve the SDK-matched native packages.

**Why:** The newest Clerk release was visible in the registry but could not be installed in this workspace until its maturity window elapsed.

**How to apply:** When upgrading Clerk Expo, check release maturity first and preserve the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` forwarding in the Expo dev script and production build environment.

The Replit-managed Clerk password policy is server-side and cannot be relaxed from the app code; this workspace reports dashboard access as requiring a personal Replit Pro subscription.

**Why:** The app can enforce the requested six-character rule locally, but Clerk may still reject the same password remotely under its configured fifteen-character policy.

**How to apply:** Keep the requested local validation in the UI and explain the Clerk limitation instead of changing managed secrets or trying to override the policy in client code.