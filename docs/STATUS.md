# HeyJustPlay Status

Last updated: 2026-06-29

## Current State

HeyJustPlay is a Vite, React, TypeScript, Tailwind CSS, Firebase Auth, and Cloud Firestore platform with WordShift as the first game implementation.

The repository has been reorganized around a platform shell, game modules, and future shared packages:

```text
.
├── apps
│   └── platform
│       └── src
├── games
│   └── wordshift
│       └── src
├── packages
│   ├── auth
│   ├── dictionary
│   ├── firebase
│   ├── game-sdk
│   ├── realtime
│   ├── shared
│   └── ui
├── docs
├── scripts
├── index.html
├── package.json
├── tsconfig*.json
├── vite.config.ts
└── tailwind.config.js
```

## Implemented

- Root `npm run dev`, `npm run build`, `npm run preview`, and `npm run lint` commands remain the app entrypoints.
- `apps/platform` owns React bootstrapping, routing, global styles, Firebase initialization, the landing page, and the shared layout.
- `games/wordshift` owns the WordShift pages, hooks, service layer, components, data, types, and game rules.
- Path aliases connect the platform to game modules without changing user-facing routes.
- Placeholder package shells exist for future shared functionality.

## Remaining Work

- Move reusable UI primitives from WordShift into `packages/ui` once another game needs them.
- Move Firebase wrappers from `apps/platform` into `packages/firebase` after package boundaries are formalized.
- Extract dictionary access into `packages/dictionary`.
- Introduce an explicit game registration API in `packages/game-sdk`.
- Add automated tests for WordShift rules, Firestore service behavior, and route-level flows.
- Add Firestore security rules, index documentation, and deployment workflow documentation.
