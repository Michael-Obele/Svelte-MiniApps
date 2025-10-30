# Playground Design Notes

This document describes the Playground concept: a place to show how each mini-app was built. Two approaches are considered:

1. Interactive sandbox

- Full code-editing and live preview for selected mini-apps (higher effort).
- Pros: hands-on learning, immediate feedback.
- Cons: requires sandboxing, bundling, security considerations, and heavier infra.

2. Stepper / Walkthrough viewer (MVP)

- Non-interactive content split into small steps. Each step explains a focused part of the app with code snippets, diagrams, and 'Next' button to progress.
- Pros: low implementation cost, easier to author, accessible.
- Cons: less hands-on.

Recommendation (MVP)

- Start with the Stepper Walkthrough viewer: implement a simple SvelteKit route that reads walkthrough metadata and renders steps with a Next/Prev control.
- Store walkthrough content as markdown files under `plan/walkthroughs/<app-name>/` with frontmatter for metadata.
- Later: evaluate integration with a client-side sandbox (e.g., StackBlitz, CodeSandbox, or an in-repo sandbox using Vite) for interactive examples.

Data model for walkthroughs

- `metadata.json` per walkthrough: title, description, tags, steps (array of file paths), completeness flag, related repo paths.

Accessibility and UX

- Keyboard navigation for Next/Prev.
- Persist progress in localStorage for each walkthrough.
