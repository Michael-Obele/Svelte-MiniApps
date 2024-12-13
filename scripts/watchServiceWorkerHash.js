import { spawn } from 'bun';

// Path to your `generateServiceWorkerHash` script
const hashScript = "bun run scripts/generateServiceWorkerHash.js";

// Start the Vite development server
const viteProcess = spawn({
  cmd: ["bun", "vite", "dev"],
  stdout: "inherit",
  stderr: "inherit",
});

// Watch for changes in the `src` folder
Bun.watch({
  path: "src/**/*", // Watch all files and subdirectories in `src`
  async onChange(event) {
    console.log(`[${event}] Detected change in src folder. Running ${hashScript}`);
    try {
      const result = await Bun.spawn({
        cmd: hashScript.split(" "),
        stdout: "inherit",
        stderr: "inherit",
      }).exited;
      if (result !== 0) {
        console.error("Error running generateServiceWorkerHash script.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },
});

console.log("Watching `src` folder for changes...");