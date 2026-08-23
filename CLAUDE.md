@AGENTS.md

# Skill Sprout

Elementary education tools app built with React Native / Expo / TypeScript.

## Commands

- `npm test` — run unit tests
- `npx tsc --noEmit` — typecheck
- `npm start` — start Expo dev server
- `npx jest --watch` — run tests in watch mode

## Architecture

- `src/` — all application source code
  - `constants/` — app-wide constants (APP_NAME, version)
  - `types/` — TypeScript interfaces and types
  - `utils/` — pure calculation functions (no React)
  - `db/` — SQLite database layer (expo-sqlite)
  - `state/` — Zustand stores
  - `hooks/` — React hooks (useTheme, useTimer)
  - `theme/` — colors, spacing, typography tokens
  - `components/` — reusable UI components
  - `features/` — feature-specific code (future)
- `app/` — Expo Router screens and layouts

## Key Decisions

- Local-first: all data in SQLite, no backend
- State machine for fluency sessions (idle → running → review → calculated → saved)
- Timestamp-based timer (not interval-based) for accuracy
- Event-based error tracking for proper undo support
- Passage snapshots in reading attempts so history survives edits
