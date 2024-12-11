import chokidar from 'chokidar';
import { exec } from 'child_process';

// Path to the service worker file
const serviceWorkerPath = './src/service-worker.ts';

// Watch all files in the src directory
const watcher = chokidar.watch('./src/**/*', {
  persistent: true
});

// Event listener for file changes
watcher.on('change', (path) => {
  console.log(`File ${path} has been changed. Regenerating hash...`);
  exec('bun run scripts/generateServiceWorkerHash.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating hash: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output: ${stderr}`);
      return;
    }
    console.log(`Hash generation output: ${stdout}`);
  });
});

console.log('Watching for changes in src directory...');
