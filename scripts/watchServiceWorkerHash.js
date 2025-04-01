import { watch } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to your `generateServiceWorkerHash` script
const hashScriptPath = resolve(__dirname, './generateServiceWorkerHash.js');

// Files to watch for changes that should trigger hash regeneration
const watchPaths = [
	resolve(__dirname, '../src/service-worker.ts'),
	resolve(__dirname, '../src/lib/utility/serviceWorker.ts'),
	resolve(__dirname, '../src/lib/utility/serviceWorkerStore.ts'),
	resolve(__dirname, '../static/manifest.json')
];

// Debounce function to prevent multiple rapid executions
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// Function to run the hash generation script
async function generateHash() {
	console.log(`[${new Date().toISOString()}] Generating service worker hash...`);
	try {
		const result = await Bun.spawn({
			cmd: ['bun', 'run', hashScriptPath],
			stdout: 'inherit',
			stderr: 'inherit'
		}).exited;

		if (result !== 0) {
			console.error('Error running generateServiceWorkerHash script.');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

// Debounced version of generateHash to prevent multiple executions
const debouncedGenerateHash = debounce(generateHash, 300);

// Watch each file individually for better control
watchPaths.forEach((path) => {
	try {
		watch(path, { persistent: true }, (eventType, filename) => {
			console.log(`[${new Date().toISOString()}] File changed: ${filename}`);
			debouncedGenerateHash();
		});
		console.log(`Watching ${path} for changes...`);
	} catch (error) {
		console.warn(`Could not watch ${path}: ${error.message}`);
	}
});

// Generate hash on startup
generateHash();

console.log('Service worker hash watcher started. Watching files for changes...');

// Keep the process running
process.stdin.resume();
