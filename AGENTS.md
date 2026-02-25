# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

MyRN is a React Native / Expo mobile app (with web support) using TypeScript, file-based routing via `expo-router`, and `@shopify/react-native-skia` for 2D graphics. No backend, database, or Docker is needed.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `yarn install` |
| Lint | `yarn lint` (runs `expo lint`) |
| Dev server (web) | `npx expo start --web --port 8081` |
| Dev server (all) | `yarn start` (interactive platform picker) |

### Caveats

- **No test framework configured.** There are no unit/integration tests in this repo. `jest` is not set up.
- **Web is the easiest test target** on a headless Linux VM. Use `npx expo start --web --port 8081` (non-interactive) rather than `yarn start` which opens an interactive CLI picker.
- The `postinstall` script copies `canvaskit.wasm` to `public/`. The `mkdir public` may warn "File exists" on re-install — this is harmless.
- ESLint uses flat config (`eslint.config.js`). Prettier is integrated as an ESLint rule, not run separately.
- First web bundle takes ~15 s; subsequent rebuilds are fast via Metro hot-reload.
