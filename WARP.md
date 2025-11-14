# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository layout

- `inspection-platform-frontend/`: Vite + React + TypeScript single-page app for the智能巡检平台 (inspection platform).
  - `src/`
    - `main.tsx`: React entry point; mounts `<App />`.
    - `App.tsx`: Sets up React Query, global layout routing, and initializes the mock-authenticated user via `useAppStore` and `mockUser`.
    - `lib/`
      - `router.tsx`: Primary route configuration using `createBrowserRouter` and lazy-loaded feature modules.
      - `simple-router.tsx`: Alternative, simplified router with a minimal dashboard/devices/tasks experience.
      - `api.ts`: API abstraction built on axios plus in-memory/mock data.
    - `stores/`: Global state via Zustand (`useAppStore`, `useDeviceStore`, `useTaskStore`).
    - `features/`: Feature-specific screens grouped by domain (devices, planning, monitoring, reports, analytics/statistics, messages, platform-config, etc.).
    - `components/`: Shared layout and UI components (e.g. `components/layout/Layout`, `components/ui/*`).
    - `types/`: Shared TypeScript types (e.g. `User`, `Device`, `InspectionTask`, `ApiResponse`, etc.).

## Tooling & common commands

All commands below are run from `inspection-platform-frontend/`.

### Environment

- Node.js: 18+
- Package manager: `npm` (others possible but not configured here).

### Install dependencies

- Install:
  - `npm install`

### Development

- Start dev server:
  - `npm run dev`
  - Vite dev server (default port 5173) serving the SPA.

### Build & preview

- Production build:
  - `npm run build`
- Type-check + build (stricter build):
  - `npm run build:check` (runs `tsc -b` before `vite build`).
- Preview built assets locally:
  - `npm run preview`

### Linting & formatting

- Lint TypeScript/React code with ESLint (configured via `eslint.config.js` using `typescript-eslint`, `@eslint/js`, React Hooks, and React Refresh plugins):
  - `npm run lint`

### Testing

- Vitest, React Testing Library, and jsdom are installed as dev dependencies, but there is no `test` script defined in `package.json`.
- You can run tests directly with Vitest, for example:
  - Run the whole test suite: `npx vitest`
  - Run a single test file: `npx vitest path/to/YourComponent.test.tsx`
- When adding a `test` script, prefer something like:
  - `"test": "vitest"`

### Environment variables

- Vite-specific runtime configuration (from `README.md`):
  - `VITE_API_BASE_URL` – base URL for backend API.
  - `VITE_APP_TITLE` – app title shown in the UI.
- Only variables prefixed with `VITE_` are exposed to the client; use a `.env` file in `inspection-platform-frontend/` when needed.

## Application architecture (big picture)

### Entry & global providers

- `src/main.tsx` is the single React entry point:
  - Imports global styles (`index.css`).
  - Creates the React root and renders `<App />` within `StrictMode`.
- `src/App.tsx` is responsible for global providers and high-level app wiring:
  - Instantiates a `QueryClient` and wraps the app in `<QueryClientProvider>` for data fetching with TanStack Query.
  - Uses `useAppStore` to set the current user from `mockUser` when a `token` exists in `localStorage` (simulating an authenticated session).
  - Renders `<RouterProvider router={router} />` inside a full-page container; routing is fully driven by `lib/router.tsx`.

### Routing & feature modules

- `src/lib/router.tsx` is the central routing table and one of the most important files:
  - Uses `createBrowserRouter` from React Router v7 and a common shell component `components/layout/Layout` as the top-level `element`.
  - Every route is defined as a child of the root layout, giving a consistent sidebar/header and routing via `<Outlet />`.
  - Feature screens are lazy-loaded using `React.lazy` and rendered beneath a `LoadingWrapper` that provides a Suspense fallback spinner.
  - Route groups (all under the `/` prefix):
    - `dashboard` – overall platform overview.
    - `platform-config/*` – capability configuration, integration dependencies, debugging/testing, and system settings.
    - `devices*` – device list, templates, capabilities, protocol interfaces, device-level targets, and maintenance.
    - `planning/*` – instant tasks, scheduled tasks, route/path optimisation, and task scheduling.
    - `tasks*` – task list, status management, execution tracking, and workflow.
    - `monitoring/*` – real-time monitoring, data pools, exceptions, and data-stream monitoring.
    - `reports/*` – diagnostic report generation, AI-driven analysis, and advanced diagnostics.
    - `statistics/*` / `analytics/*` – statistical analysis and custom reporting.
    - `messages*` – platform messages and message templates.
    - A catch-all `*` route redirects back to `/dashboard`.
- `src/lib/simple-router.tsx` provides a smaller router with inlined components for dashboard/devices/tasks and reuses the same `Layout`. It is useful as a fallback or demo router; swapping it in requires changing the `router` passed to `RouterProvider` in `App.tsx`.

### State management (Zustand stores)

All global, cross-page state is handled via Zustand stores in `src/stores/`, each wrapped with the `devtools` middleware (named stores for debugging):

- `useAppStore` (app-level UI & session)
  - State: `user`, `isAuthenticated`, sidebar collapsed state, theme, notifications, unread count, global `loading` and `error`.
  - Actions: `setUser`, `login`, `logout`, sidebar toggling, theme switching, notification CRUD (including unread count bookkeeping), and loading/error helpers.
  - Selectors like `useUser`, `useIsAuthenticated`, `useSidebarCollapsed`, `useNotifications`, etc. provide convenient, narrow subscription hooks.

- `useDeviceStore` (device-centric domain state)
  - State: arrays of `devices`, `templates`, `capabilities`, per-device `monitoringData`, `selectedDevice`, plus loading/error.
  - Actions:
    - CRUD operations for devices, templates, and capabilities.
    - `toggleCapability` to flip capability activation.
    - Monitoring data management (`addMonitoringData`, `setMonitoringData`, `clearMonitoringData`) with a rolling buffer (e.g. last 100 records per device).
    - Batch operations like `updateDeviceStatuses` and query helpers (`getDevicesByType`, `getOnlineDevices`, `getDevicesByStatus`).

- `useTaskStore` (task and target domain state)
  - State: `tasks`, `targets`, `taskStatuses` (status history records), `selectedTask`, loading/error, and a `filters` object (status, priority, deviceId, optional date range).
  - Actions:
    - CRUD for tasks and targets.
    - `addTaskStatus` & `updateTaskStatus` (which append history and keep `tasks` in sync), `getTaskHistory` for a sorted timeline.
    - Filter management (`setFilters`, `clearFilters`) and computed `getFilteredTasks` that applies all filters in one place.
    - Batch status updates (`updateTaskStatuses`) and helpers (`getTasksByStatus`, `getTasksByPriority`, `getTasksByDevice`).
    - `getTaskStats` returns aggregated counts (total/pending/running/completed/failed/cancelled).

**Guidance for future changes:**
- When introducing new global concerns (e.g. additional filters, cross-page summary stats), prefer extending the appropriate store and exposing selectors, rather than introducing scattered React context or prop drilling.

### Data & API layer

- `src/lib/api.ts` is the main abstraction over data access. It currently uses mock data rather than real HTTP calls, but is structured to support a backend with minimal changes:
  - Creates a shared axios instance with:
    - `baseURL: '/api'`.
    - Request interceptor that attaches a `Bearer` token from `localStorage` (if present).
    - Response interceptor that unwraps `response.data` and handles `401` by clearing the token and redirecting to `/login`.
  - Implements small helper utilities:
    - `delay(ms)` to simulate network latency.
    - `paginate<T>(items, page, limit)` for simple in-memory pagination.
  - Exposed API modules (all return a generic `ApiResponse<T>` type from `src/types`):
    - `authAPI`: `login`, `logout`, and `getCurrentUser`, using `mockUser` and a mock JWT token in `localStorage`.
    - `deviceAPI`: operations for listing/filtering devices, CRUD-style functions, and access to device templates/capabilities and status history; data comes from `generateMockDevices`, `mockDeviceTemplates`, `mockCapabilities`, etc.
    - `taskAPI`: similar pattern for tasks and inspection targets, with pagination, filters (status, device IDs, date ranges), and CRUD operations backed by `generateMockTasks` and `mockTargets`.
    - `statisticsAPI`: high-level statistics and time-series data via `mockStatistics`, `generateTimeSeriesData`, and derived device utilisation metrics.

**Guidance for real backend integration:**
- Keep the public `authAPI`, `deviceAPI`, `taskAPI`, and `statisticsAPI` function signatures stable.
- Replace internal mock logic with calls to the shared axios instance (`api.get`, `api.post`, etc.).
- Leverage existing pagination and filter parameter shapes from `PaginationParams` and `FilterParams` in `src/types` for consistent client/server contracts.

### UI & styling

- Styling is Tailwind CSS-based:
  - `tailwindcss` and `@tailwindcss/forms` are configured via `tailwind.config.js` and `postcss.config.js`.
  - Global styles live in `src/index.css` and `src/App.css` and are applied from `main.tsx`.
- Icons and visualisation libraries are available and already integrated in feature modules where needed:
  - Icons: `lucide-react`.
  - Charts: `recharts`.
  - Maps: `leaflet` + `react-leaflet`.
  - Flow diagrams/workflows: `reactflow`.
- Vite path alias:
  - In `vite.config.ts`, `@` is aliased to `./src`. Prefer `@/features/...`, `@/lib/api`, etc., over long relative imports.

## Working with features and routes

When adding or modifying domain functionality, follow the existing patterns:

- **New page/screen**
  - Create a component under the appropriate domain in `src/features/<domain>/YourPage.tsx`.
  - Register a lazy-loaded route for it in `src/lib/router.tsx` (import it via `React.lazy` and wrap in `<LoadingWrapper>`).
  - Add navigation entry in `components/layout/Layout` if it should be user-accessible via the sidebar or header.

- **Shared logic or utilities**
  - Extract reusable logic or helpers into `src/lib/utils.ts` or another module under `src/lib/`.
  - Use shared types from `src/types/` and shared global state from the relevant store under `src/stores/`.

- **Data-dependent features**
  - Prefer TanStack Query for server-like data (even though currently mocked) and keep local UI-only state in components or Zustand where it’s cross-cutting.
  - Use `lib/api.ts` as the single source of truth for remote data access so that switching from mocks to a real backend is straightforward.

This WARP file should be used as the primary reference for commands and architectural patterns when making non-trivial changes to the inspection platform frontend.