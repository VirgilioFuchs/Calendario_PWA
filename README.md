# Calendar PWA (Anglo Calendar)

React + Vite application for viewing an academic calendar in **year**, **month**, **day**, and **event detail** formats, with **PWA** support, **Service Worker** caching, and local **IndexedDB** cache.

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- Framer Motion
- ESLint 9
- vite-plugin-pwa
- IndexedDB (local event cache)

## Requirements

- Node.js 20+ (recommended)
- npm

## Installation

```bash
npm ci
```

## Scripts

```bash
npm run dev      # development environment
npm run build    # production build (tsc + vite)
npm run lint     # ESLint
npm run preview  # local build preview
```

## Project structure

```text
src/
  app/                    # main app composition
  components/common/      # shared UI components
  features/
    year/                 # yearly view
    month/                # monthly view
    day/                  # daily view
    event/                # event detail
  shared/
    hooks/                # reusable hooks
    services/             # API and cache integration
    types/                # domain types and constants
    utils/                # date/event utility functions
```

## Navigation flow

The main state is in `src/app/App.tsx` and controls these levels:

- `year_list`
- `month_detail`
- `day_detail`
- `event_detail`

It also controls:

- light/dark theme (persisted in `localStorage`)
- orientation (`portrait`/`landscape`)
- Framer Motion transitions

## Data and API

Requests are in `src/shared/services`:

- `apiCache.ts`: main service with range fetch + ETag revalidation
- `eventCacheIDB.ts`: IndexedDB cache with expiration
- `apiNoCache.ts`: no-cache alternative

### Expected endpoint

The app expects an API with routes like:

- `GET /api/events_list_cache?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /events_list`
- `POST /events_create`
- `GET /health`

> Note: base URLs are hardcoded in service files and should be adjusted for your environment.

## PWA and cache

Configured in `vite.config.ts` with `vite-plugin-pwa`:

- `generateSW` strategy
- `autoUpdate` registration
- runtime caching for API and healthcheck

## Known current status

- There is no automated test suite in `package.json`.
- `npm run build` is working.
- `npm run lint` has pre-existing errors in the codebase.

## Reviewed branches (excluding codex)

The branches below were reviewed remotely, explicitly excluding `codex/*` branches:

- `master` — current base (same commit as `copilot/add-project-documentation` at that time).
- `agenda1.1` — initial evolution with many structural changes and the default Vite template README.
- `agenda2.0` — visual evolution continuation, also with the default Vite template README.
- `agenda3.0` — later version with component reorganization and optimization merges.
- `copilot/add-documentation-for-repository` — documentation-focused branch (full README).
- `copilot/add-project-documentation` — current working branch.
