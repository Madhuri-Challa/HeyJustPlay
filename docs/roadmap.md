# HeyJustPlay Roadmap

## Platform

- Add a game registry so new games can declare routes, labels, cards, and metadata without editing every platform page.
- Move shared auth and Firebase helpers into package boundaries.
- Add deployment workflow documentation and environment setup checks.

## WordShift

- Add automated tests for word validation, chain building, and room lifecycle logic.
- Document Firestore rules and required indexes.
- Improve room lifecycle handling for disconnects, host transfer, replay, and cleanup.

## Packages

- `packages/ui`: shared design primitives once reused across games.
- `packages/auth`: auth state and identity helpers.
- `packages/firebase`: Firebase app/service initialization.
- `packages/realtime`: shared realtime room primitives.
- `packages/game-sdk`: game registration and platform integration contracts.
- `packages/dictionary`: dictionary validation and definition lookup.
- `packages/shared`: cross-cutting types and utilities.
