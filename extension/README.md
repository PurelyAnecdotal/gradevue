# GradeCompass Companion

Unpacked Chrome MV3 extension. Build with `bun run extension:build` from the repo root, then load `extension/dist` at `chrome://extensions`.

The background worker is the only process that fetches StudentVUE. The content script only relays messages from GradeCompass pages.
