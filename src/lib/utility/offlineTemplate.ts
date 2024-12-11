export function generateOfflineHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Offline - Svelte MiniApps</title>
    <link rel="icon" href="/favicon.ico">
    <style>
        /* Inline critical styles */
        :root {
          /* Light theme */
          --bg-gradient-from: #f3f4f6;
          --bg-gradient-to: #e5e7eb;
          --content-bg: #ffffff;
          --text-primary: #111827;
          --text-secondary: #4b5563;
          --border-color: #e5e7eb;
          --button-primary-bg: #3b82f6;
          --button-primary-hover: #2563eb;
          --button-secondary-bg: #e5e7eb;
          --button-secondary-hover: #d1d5db;
          --shadow-color: rgba(0, 0, 0, 0.1);
        }

        body {
            margin: 0;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            background: linear-gradient(135deg, var(--bg-gradient-from) 0%, var(--bg-gradient-to) 100%);
        }
        .offline-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .offline-content {
            background: var(--content-bg);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px var(--shadow-color);
            max-width: 32rem;
            width: 100%;
            text-align: center;
        }
        .icon-container { margin-bottom: 1.5rem; }
        h1 {
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        p { color: var(--text-secondary); margin-bottom: 1.5rem; }
        .retry-button {
            background-color: var(--button-primary-bg);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: background-color 150ms;
        }
        .retry-button:hover { background-color: var(--button-primary-hover); }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-content">
            <div class="icon-container">
                <svg class="wifi-off" viewBox="0 0 24 24" width="48" height="48">
                    <path d="M1 1L23 23M16.72 11.06C17.54 11.42 18.29 11.93 18.94 12.57M5.28 11.06C6.81 10.14 8.58 9.64 10.5 9.64M12 15.5C13.66 15.5 15 16.84 15 18.5M8.53 8.53C6.92 7.82 5.14 7.5 3.34 7.64M20.66 7.64C18.86 7.5 17.08 7.82 15.47 8.53M12 21.5V21.51M12 18.5C10.34 18.5 9 16.84 9 15.5" 
                        stroke="currentColor" 
                        fill="none" 
                        stroke-width="2" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"/>
                </svg>
            </div>
            <h1>You're Offline</h1>
            <p>It looks like you've lost your internet connection. Some features might be unavailable.</p>
            <div class="actions">
                <button class="retry-button" onclick="checkConnection()">
                    Retry Connection Now
                </button>
            </div>
        </div>
    </div>
    <script>
        let retryCount = 0;
        let isChecking = false;

        // Function to apply theme based on local storage
        function applyTheme() {
            const theme = localStorage.getItem('mode-watcher-theme');
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                document.documentElement.style.setProperty('--bg-gradient-from', '#1f2937');
                document.documentElement.style.setProperty('--bg-gradient-to', '#111827');
                document.documentElement.style.setProperty('--content-bg', '#1f2937');
                document.documentElement.style.setProperty('--text-primary', '#e5e7eb');
                document.documentElement.style.setProperty('--text-secondary', '#cbd5e0');
            }
        }

        async function checkConnection() {
            if (isChecking) return;
            isChecking = true;
            retryCount++;

            try {
                const response = await fetch('/api/health-check');
                if (response.ok) {
                    window.location.reload();
                }
            } catch (error) {
                console.log('Still offline');
            } finally {
                isChecking = false;
            }
        }

        // Auto retry connection every 30 seconds
        setInterval(checkConnection, 30000);

        // Apply theme on load
        applyTheme();
    </script>
</body>
</html>`;
}
