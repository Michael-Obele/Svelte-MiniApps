# Svelte MiniApps (Svelte 5 Edition)

**Boost your productivity with Svelte MiniApps - a collection of user-friendly tools rebuilt with Svelte 5 for enhanced speed and reliability!**

Svelte MiniApps is a collection of small, single-purpose applications designed for simplicity and efficiency. Originally a personal project to learn full-stack development, it has evolved into a repository of handy tools for various tasks. This version has been updated to Svelte 5 to fully leverage its speed and resolve build errors encountered during auto migration.

## Table of Contents

- [About](#about) 📝
- [Built for Efficiency](#built-for-efficiency) 🛠️
- [Getting Started](#getting-started) 🏁
- [List of Apps](#list-of-apps) 📋
- [Contributing](#contributing) 🤝
- [License](#license) 📄
- [Old Version](#old-version) 🔙
- [App Usage Tracking](#app-usage-tracking) 📊

## About 📝

Svelte MiniApps offers tools to streamline specific tasks. Whether converting units, generating passwords, or managing to-do lists, there's a mini-app to simplify your day.

## Built for Efficiency 🛠️

Svelte MiniApps is a single Progressive Web App (PWA) featuring a collection of tools built for various web users. It enhances productivity and organization with the following features:

- **Versatile Tools:** Designed for different needs and difficulty levels.
- **Web-Based:** Built specifically for web users.
- **High Performance:** Fast and efficient, now with Svelte 5.
- **Installable:** Can be added to your device for quick access.
- **Offline Capability:** Works offline once accessed.

### Tech Stack:

- Built with Svelte 5
- Uses Shadcn-Svelte components by Shadcn
- Uses Lucide-Svelte icons
- Uses Lordicon for animated icons

## Getting Started 🏁

**Prerequisites:**

- Node.js and npm (or another package manager).
- PostgreSQL database (for production)

**Explore the Mini-Apps:**

To explore the Mini-Apps, fork the repository, clone your fork, and run the development server.

1.  **Fork the repository** on GitHub.
2.  **Clone your fork:**

    ```bash
    git clone https://github.com/your-username/Svelte-MiniApps.git
    cd Svelte-MiniApps
    ```

3.  **Install dependencies:**

    ```bash
    bun install
    ```

4.  **Create a new branch** for your contribution:

    ```bash
    git checkout -b feature/your-feature-name
    ```

5.  **Run the development server:**

    ```bash
    bun run dev
    ```

**Note:** The Vite development server runs on port **5178** instead of the traditional **5173**. Access your app at `http://localhost:5178`.

### Database Setup:

The project uses Prisma ORM for database management. Follow these steps to set up your database:

1.  **Copy the example environment file:**

    ```bash
    cp .env.example .env
    ```

2.  **Update the DATABASE_URL** in your `.env` file:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
    ```

3.  **Initialize your database:**

    ```bash
    npx prisma generate  # Generate Prisma Client
    npx prisma db push   # Push schema changes to database
    ```

For development, you can use Prisma Studio to manage your data:

```bash
npm run db:studio
```

**Important**: The project has moved from SQLite to PostgreSQL for improved scalability and performance. Ensure you have PostgreSQL installed and configured locally.

<details>
    <summary>How to Set Up a Local PostgreSQL Database</summary>
    <ol>
        <li>Download and install PostgreSQL from the <a href="https://www.postgresql.org/download/">official website</a>.</li>
        <li>During installation, set a username and password for the PostgreSQL superuser (e.g., <code>postgres</code>).</li>
        <li>Once installed, open the PostgreSQL shell or a GUI tool like pgAdmin.</li>
        <li>Create a new database:
            <pre><code>CREATE DATABASE mydatabase;</code></pre>
        </li>
        <li>Update your <code>.env</code> file with the connection string:
            <pre><code>DATABASE_URL="postgresql://<username>:<password>@localhost:5432/mydatabase"</code></pre>
        </li>
        <li>Test the connection by running:
            <pre><code>npx prisma db pull</code></pre>
        </li>
    </ol>
</details>

This will launch a local server and open the mini-apps in your browser.

### Installable

Install Svelte MiniApps as standalone applications for quick access:

1.  Open the mini-app in your browser.
2.  Click on the browser's menu (three dots).
3.  Select "Install" or "Add to Home Screen."

### Live Version

Access the live version at: [Svelte MiniApps](https://svelte-apps.me/)

## List of Apps 📋

Explore the full list of mini-apps designed to boost your productivity. Visit [svelte-apps.me/#apps](https://svelte-apps.me/#apps) for details.

### App Usage Tracking 📊

Svelte MiniApps now includes an app usage tracking feature that:

- Automatically tracks which apps you use most frequently
- Records when you last used each app
- Displays your favorite apps in your profile based on usage
- Calculates a streak based on your daily app usage

This feature automatically increments the usage count for your app each time a user visits it. Sign in and visit your profile page to see your usage statistics.

## Contributing 🤝

Contributions are welcome! Fork the repository, make your changes, and submit a pull request.

**Guidelines:**

- **Single-purpose tools:** Each mini-app should focus on a specific task.
- **User-friendly:** Ensure each mini-app is easy to use with clear instructions.
- **Clean code:** Follow Svelte best practices and keep code organized.

## Old Version 🔙

For those interested in the previous version of Svelte MiniApps, it is available at the following repository:

- **Svelte MiniApps v4**: [Svelte-MiniApps-sv4](https://github.com/Michael-Obele/Svelte-MiniApps-sv4)

This version is located in the `sv4.svelte-apps` branch and contains the earlier implementations of the mini-apps, built with Svelte 4. Users may explore this version for reference or migration purposes.

## License 📄

This project is licensed under the [MIT License](https://opensource.org/licenses/mit).

- You can freely use, modify, and distribute this software.
- You must retain the copyright and license notice in all copies.
- The full license text is in the [`LICENSE`](LICENSE) file in the repository.

[![Netlify Status](https://api.netlify.com/api/v1/badges/0d21d41b-36d1-4e3e-9d4a-897788f50b7b/deploy-status)](https://app.netlify.com/sites/svelte-mini-apps/deploys)
