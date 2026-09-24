---
name: Expo audio challenges
description: Constraints for native Listening and Speaking challenges in the Expo mobile app.
---

Use Expo's first-party audio modules for device-compatible practice: `expo-audio` needs `expo-asset` as a direct peer and an `expo-audio` config plugin with a microphone permission message for native builds. `expo-speech` can provide self-contained listening prompts without remote audio URLs.

**Why:** The mobile app must work in Expo Go and native builds without relying on external media hosting, while microphone access must be declared for permission prompts.

**How to apply:** Keep recording permission denial actionable, clean up speech playback when leaving the mission, and preserve a visible review/evaluation step before applying Speaking progress.