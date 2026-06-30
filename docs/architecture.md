# HeyJustPlay Architecture

## Repository Layers

`apps/platform` is the application shell. It mounts React, owns global styles, initializes Firebase services, defines routes, and provides shared layout around game screens.

`games/wordshift` is the first game module. It contains WordShift-specific pages, components, hooks, services, types, data, and utilities. The platform imports its route components through the `@wordshift/*` alias.

`packages/*` are reserved shared package boundaries. They are currently placeholders so the repository structure is ready without changing runtime behavior.

## Runtime Flow

1. `index.html` loads `/apps/platform/src/main.tsx`.
2. `apps/platform/src/App.tsx` creates the router and wraps routes in `Layout`.
3. Platform routes render WordShift screens from `games/wordshift/src/pages`.
4. WordShift hooks and services call platform Firebase helpers through `@platform/lib/firebase`.
5. Firestore remains the realtime persistence layer, and dictionary validation remains a browser-side API call.

## Aliases

- `@platform/*` maps to `apps/platform/src/*`.
- `@wordshift/*` maps to `games/wordshift/src/*`.
- `@games/*` maps to `games/*`.
- `@packages/*` maps to `packages/*`.

## Game Plug-In Direction

A future game should live under `games/<game-id>/src` and expose route components or a registration object. The platform should import those exports directly or through a game registry. Shared capabilities should move into `packages/*` only when they are used by more than one game or define a stable cross-game contract.
