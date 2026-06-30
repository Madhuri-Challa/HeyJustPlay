# HeyJustPlay

HeyJustPlay is a React and Firebase game platform. The platform shell lives separately from individual game implementations so new games can be added without mixing game logic into app bootstrapping and shared infrastructure.

## Repository Structure

```text
apps/platform      React app shell, routing, layout, global styles, Firebase initialization
games/wordshift    WordShift game implementation
packages           Placeholder shared package boundaries
docs               Project status, architecture notes, roadmap, and migration summary
scripts            Future automation and maintenance scripts
```

## Development

```sh
npm install
npm run dev
npm run build
```

The root npm scripts remain the main entrypoint. Vite loads `apps/platform/src/main.tsx` from the root `index.html`.

## How Games Plug In

Games live under `games/<game-id>`. A game owns its pages, components, hooks, services, data, types, and rules. The platform imports game route components through aliases such as `@wordshift/*` and mounts them in `apps/platform/src/App.tsx`.

As the platform grows, common capabilities should move into `packages/*` only after a second game needs them or after a stable cross-game API is clear.
