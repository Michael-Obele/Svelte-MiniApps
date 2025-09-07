# Planned Features for Svelte-MiniApps

This file collects planned features gathered from discussion and early planning docs. It is meant as a single-list view that can be turned into issues and milestones.

## Table of contents

- [High-level features](#high-level-features)
  - Mobile companion apps
  - Desktop companion apps
  - Announcements page
  - Playground
  - Walkthroughs
  - Timeline UI & backing data
  - Accessibility & UX
- [Budget Tracker: export as PDF / image](#budget-tracker-export-as-pdf--image)
  - Options
  - Recommendation (MVP)
- [Implementation notes and next steps](#implementation-notes-and-next-steps)
- [How to add new ideas](#how-to-add-new-ideas)
- [Other ideas (placeholders)](#other-ideas-placeholders)

## High-level features

- Mobile companion apps (iOS & Android)

  - Phases: ideation → prototype → alpha → beta → public release
  - Options: WebView shell (PWA-hosted), Capacitor, React Native, or Tauri (for desktop)
  - Key capabilities: offline-first, selective sync, native integrations (notifications, share sheet)

- Desktop companion apps (Windows, macOS, Linux)

  - Options: Tauri (recommended for small bundles) or Electron
  - Native menus, tray, window controls, and optional system integrations

- Announcements page

  - Markdown-backed announcements with server-side listing
  - Drafts stored in `plan/announcements.md` for now

- Playground (learning / walkthrough area)

  - MVP: non-interactive stepper/walkthrough that renders markdown steps with Next/Prev controls and persists progress in localStorage
  - Long-term: optional interactive sandbox (StackBlitz/CodeSandbox or in-repo Vite sandbox)

- Walkthroughs per-app

  - Chunked steps: Overview, Design, Data Model, UI, Logic, Testing, Deployment
  - Store per-walkthrough metadata and steps under `plan/walkthroughs/<app>/`

- Timeline UI & backing data

  - Store milestones in JSON for a future timeline component
  - Use `plan/timeline.md` as canonical roadmap until structured data is implemented

- Accessibility & UX
  - Keyboard navigation for walkthrough stepper
  - Clear keyboard and screen-reader affordances for playground and announcements

## Budget Tracker: export as PDF / image

Requested feature: "I would love to have a way to export the budget tracker as PDF or image." Below are implementation options and a recommended MVP approach.

### Options

- Client-side export (MVP)

  - Use html-to-canvas libraries (html2canvas) + jsPDF to generate a PDF from the rendered DOM (works well for smaller pages and charts rendered as DOM/SVG).
  - For charts rendered as SVG (e.g., Chart.js or D3), convert SVG to PNG using canvas and include in exported PDF or save as image (download link).
  - Pros: no server changes, fast iteration, works offline (PWA). Cons: layout quirks, large outputs may be memory-heavy on mobile.

- Server-side rendering / capture

  - Use a server-side renderer (headless Chromium via Puppeteer or Playwright) to render the budget page and export a PDF or screenshot image.
  - Pros: consistent rendering, handles complex CSS, smaller client memory usage. Cons: requires server infrastructure and an endpoint; consider authenticated access and rate limits.

- Native app integration
  - For mobile/desktop apps, leverage native printing or share APIs to create PDFs/images from webview content or application state.

### Recommendation (MVP)

- Implement client-side export first: html2canvas + jsPDF for PDF, and canvas/SVG export for image downloads. Add a feature flag and tests for large datasets.
- Add a small UI control in the Budget Tracker app: "Export → PDF / PNG". Show a progress indicator for large exports.

## Implementation notes and next steps

- Break features into issues and assign estimates (mobile prototype, timeline UI, walkthrough stepper, announcements page, export feature).
- Implement the walkthrough stepper and announcements page as SvelteKit routes that read markdown from `plan/` as an MVP.
- Create a follow-up issue for evaluating interactive sandboxes and server-side export endpoints.

## How to add new ideas

When adding a new idea to this file, follow this lightweight format so it stays readable and the TOC remains useful:

1. Add a single bullet under the appropriate section when the idea is small.
2. For larger ideas, add a new subheading using this template:

### <Idea title>

Short description (1–2 lines).

- Owner: @github-username (optional)
- Priority: low | medium | high
- Tags: mobile | desktop | ux | export | playground | walkthrough
- Notes: short bullets, links to related files or issues

After adding a new heading, update the Table of contents above if needed (add the new heading under the relevant section). If you prefer automation, we can add a small script to regenerate the TOC.

## Other ideas (placeholders)

- [ ] Export budget tracker as PDF / PNG (see above)
- [ ] TODO: add per-app walkthroughs for Todo List and Budget Tracker
- [ ] TODO: announce mobile & desktop roadmap on announcements page
