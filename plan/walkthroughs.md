# Walkthroughs Index & Guidelines

This document outlines the structure for per-app walkthroughs and serves as an index for existing or planned walkthroughs.

Walkthrough structure (chunking)

- Each walkthrough is broken into small, focused chunks. Suggested chunk headings:
  1. Overview / Motivation
  2. Design & UX
  3. Data model & types
  4. Core UI components
  5. Business logic / algorithms
  6. Testing
  7. Deployment & CI
  8. Further improvements

Per-app folder layout (example)

plan/walkthroughs/<app-name>/

- README.md — overview and links
- metadata.json — title, author, tags, steps order
- steps/
  - 01-overview.md
  - 02-design.md
  - 03-data-model.md
  - 04-ui.md
  - 05-logic.md

Index (initial)

- Todo List — partial walkthrough: design, UI, logic notes, links to `src/routes/apps/todo/` if present.
- Budget Tracker — planned walkthrough.

Authoring notes

- Write concise steps with code snippets referencing file paths in the repo.
- If a step references large code, link to the file in the source tree instead of pasting everything.
- Mark incomplete steps with `TODO` and a short checklist.

Next steps

- Create per-app folders in `plan/walkthroughs/` for apps you want to document.
- Add lightweight SvelteKit routes to render these markdown walkthroughs (optional MVP: static markdown pages).
