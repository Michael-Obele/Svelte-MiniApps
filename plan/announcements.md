# Announcements

This file holds announcement drafts and notes for an announcements page.

Purpose

- Provide a centralized page to announce major milestones, new features, and future plans (including mobile and desktop apps).

Draft Announcement — Mobile & Desktop Companion Apps

Title: Svelte-MiniApps: Mobile & Desktop Coming Soon

We’re excited to announce plans to build official mobile and desktop companion apps for Svelte-MiniApps. The apps will be designed to complement the PWA and provide native experiences for offline use, quicker access to frequently used mini-apps, and optional OS integrations.

Planned highlights:

- Native shell with offline-first support and selective sync for user data.
- Tight integration with the existing PWA and account system.
- Desktop builds (Tauri or Capacitor) with native menus and system tray.

How you can help

- Feedback: file issues for features you want in the mobile/desktop apps.
- Testing: volunteer to test prototypes when available.

Implementation notes

- Backing store: use the current Prisma schema; evaluate sync approaches (GraphQL, REST with conflict resolution, or background sync).
- Announcements page: markdown-based storage in `static/announcements/` or a simple server route to list `plan/announcements.md` entries.
