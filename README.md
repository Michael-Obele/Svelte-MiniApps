# Svelte MiniApps (Svelte 5 Edition)

**Boost your productivity with Svelte MiniApps - a collection of user-friendly tools rebuilt with Svelte 5 for enhanced speed and reliability!**

Svelte MiniApps is a collection of small, single-purpose applications designed for simplicity and efficiency. Originally a personal project to learn full-stack development, it has evolved into a repository of handy tools for various tasks. This version has been updated to Svelte 5 to fully leverage its speed and resolve build errors encountered during deployment.

## Table of Contents

- [About](#about) 📝
- [Built for Efficiency](#built-for-efficiency) 🛠️
- [Getting Started](#getting-started) 🏁
- [List of Apps](#list-of-apps) 📋
- [Contributing](#contributing) 🤝
- [License](#license) 📄

## About

Svelte MiniApps offers tools to streamline specific tasks. Whether converting units, generating passwords, or managing to-do lists, there's a mini-app to simplify your day.

## Built for Efficiency

Svelte MiniApps is a single Progressive Web App (PWA) featuring a collection of tools built for various web users. It enhances productivity and organization with the following features:

- **Versatile Tools:** Designed for different needs and difficulty levels.
- **Web-Based:** Built specifically for web users.
- **High Performance:** Fast and efficient, now with Svelte 5.
- **Installable:** Can be added to your device for quick access.
- **Offline Capability:** Works offline once accessed.

## Getting Started

**Prerequisites:**

- Node.js and npm (or another package manager).

**Explore the Mini-Apps:**
Clone the repository and run the development server to explore the mini-apps.

```bash
git clone https://github.com/Michael-Obele/Svelte-MiniApps.git
cd Svelte-MiniApps
cp .env.example .env
bun install
bun install @prisma/client
bun install prisma --save-dev
bun run dev
```

This will launch a local server and open the mini-apps in your browser.

###### **Important**: For production environments, it's recommended to switch your Prisma data source provider from SQLite to PostgreSQL or MySQL.

### Installable

Install Svelte MiniApps as standalone applications for quick access:

1. Open the mini-app in your browser.
2. Click on the browser's menu (three dots).
3. Select "Install" or "Add to Home Screen."

### Live Version

Access the live version at: [Svelte MiniApps](https://svelte-apps.me/)

## List of Apps

Explore the full list of mini-apps designed to boost your productivity. Visit [svelte-apps.me/#apps](https://svelte-apps.me/#apps) for details.

## Contributing

We welcome contributions! Fork the repository, make your changes, and submit a pull request.

**Guidelines:**

- **Single-purpose tools:** Each mini-app should focus on a specific task.
- **User-friendly:** Ensure the mini-app is easy to use with clear instructions.
- **Clean code:** Follow Svelte best practices and keep code organized.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/mit).

- You can freely use, modify, and distribute this software.
- You must retain the copyright and license notice in all copies.
- The full license text is in the [`LICENSE`](LICENSE) file in the repository.

[![Netlify Status](https://api.netlify.com/api/v1/badges/0d21d41b-36d1-4e3e-9d4a-897788f50b7b/deploy-status)](https://app.netlify.com/sites/svelte-mini-apps/deploys)
