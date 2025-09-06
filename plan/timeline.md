# Timeline & Milestones

This file captures proposed milestones for the Svelte-MiniApps project. Dates are tentative and for planning purposes only.

## Goals

- Ship an improved web PWA with high-quality mini-apps.
- Provide native Mobile (iOS/Android) and Desktop (Windows/macOS/Linux) companion apps.
- Add an announcements page and a playground/walkthrough area.

## High-level milestones

- Ideation & scoping — Q1 (TBD)

  - Define core features for mobile & desktop companion apps.
  - Decide on tech stack for native apps (Tauri + Svelte, React Native, Capacitor, or others).

- Prototype — Q2 (TBD)

  - Create minimal native shell with WebView hosting main PWA or integrate select mini-apps.
  - Validate authentication and data sync for mobile/desktop.

- Alpha — Q3 (TBD)

  - App store testing, basic feature parity with PWA for key apps.

- Beta — Q4 (TBD)

  - Wider testing, performance tuning, and PWA/native integration.

- Public release — After beta (TBD)

## Feature flags / Implementation notes

- Timeline UI: store milestones in JSON for a future timeline component.
- Announcements: simple markdown-backed page with server-side load for listing announcements.
- Playground: start with non-interactive stepper MVP. Later: add interactive sandbox per-app.

## Next steps

- Collect approximate target dates and owners.
- Create issues for prototype + timeline UI.
