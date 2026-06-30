# Migration Summary

## Files Moved

- `src/main.tsx` -> `apps/platform/src/main.tsx`
- `src/App.tsx` -> `apps/platform/src/App.tsx`
- `src/styles.css` -> `apps/platform/src/styles.css`
- `src/vite-env.d.ts` -> `apps/platform/src/vite-env.d.ts`
- `src/lib/firebase.ts` -> `apps/platform/src/lib/firebase.ts`
- `src/components/Layout.tsx` -> `apps/platform/src/components/Layout.tsx`
- `src/pages/LandingPage.tsx` -> `apps/platform/src/pages/LandingPage.tsx`
- `src/components/*` except `Layout.tsx` -> `games/wordshift/src/components/*`
- `src/pages/*` except `LandingPage.tsx` -> `games/wordshift/src/pages/*`
- `src/hooks/*` -> `games/wordshift/src/hooks/*`
- `src/services/*` -> `games/wordshift/src/services/*`
- `src/data/*` -> `games/wordshift/src/data/*`
- `src/types/*` -> `games/wordshift/src/types/*`
- `src/utils/*` -> `games/wordshift/src/utils/*`
- `STATUS.md` -> `docs/STATUS.md`

## Configuration Changes

- `index.html` now loads `/apps/platform/src/main.tsx`.
- `vite.config.ts` defines aliases for `@platform`, `@wordshift`, `@games`, and `@packages`.
- `tsconfig.app.json` includes `apps/platform/src`, `games`, and `packages`, and mirrors the Vite path aliases.
- `tsconfig.node.json` includes root config files.
- `tailwind.config.js` scans `apps`, `games`, and `packages`.
- `package.json` and `package-lock.json` were renamed from `wordshift` to `heyjustplay`.

## Remaining Cleanup Tasks

- Extract reusable UI from WordShift into `packages/ui` when another game needs it.
- Move Firebase service initialization into `packages/firebase` after a stable package API is chosen.
- Move dictionary lookup into `packages/dictionary`.
- Add a formal game registry in `packages/game-sdk`.
- Add tests around the game rules and route integration.

## Assumptions

- The existing landing page is platform-owned because it lists games rather than implementing WordShift gameplay.
- The current Button, Card, Input, and game panels remain in WordShift to avoid functionality or UI changes during this refactor.
- Root-level npm scripts should remain the primary developer commands.
