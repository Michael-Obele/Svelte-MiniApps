// generateServiceWorkerHash.js
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateServiceWorkerHash() {
	try {
		// Consider multiple files for hash generation
		const filesToHash = [
			'./src/service-worker.ts',
			'./src/lib/utility/serviceWorker.ts',
			'./src/lib/utility/serviceWorkerStore.ts',
			'./static/manifest.json'
		];

		// Create a combined hash from all relevant files
		const hashContent = filesToHash.reduce((acc, filePath) => {
			try {
				const fullPath = path.resolve(filePath);
				if (fs.existsSync(fullPath)) {
					const fileContent = fs.readFileSync(fullPath, 'utf-8');
					return acc + fileContent;
				}
				return acc;
			} catch (fileError) {
				console.warn(`Warning: Could not read file ${filePath}:`, fileError.message);
				return acc;
			}
		}, '');

		// Add build timestamp to ensure uniqueness
		const buildTimestamp = Date.now().toString();
		
		// Generate a deterministic hash based on content and timestamp
		const hash = crypto
			.createHash('sha256')
			.update(hashContent + buildTimestamp)
			.digest('hex');

		// Ensure the static directory exists
		const staticDir = path.resolve('./static');
		if (!fs.existsSync(staticDir)) {
			fs.mkdirSync(staticDir, { recursive: true });
		}

		// Write hash to a file
		fs.writeFileSync(
			path.resolve('./static/service-worker-hash.json'),
			JSON.stringify(
				{
					hash,
					timestamp: new Date().toISOString(),
					buildTime: buildTimestamp
				},
				null,
				2
			)
		);

		console.log('Service Worker Hash Generated:', hash);
		return hash;
	} catch (error) {
		console.error('Failed to generate service worker hash:', error);
		
		// Create a fallback hash if an error occurs
		const fallbackHash = crypto
			.createHash('sha256')
			.update('fallback-' + Date.now())
			.digest('hex');
			
		try {
			fs.writeFileSync(
				path.resolve('./static/service-worker-hash.json'),
				JSON.stringify(
					{
						hash: fallbackHash,
						timestamp: new Date().toISOString(),
						fallback: true
					},
					null,
					2
				)
			);
			console.log('Fallback Service Worker Hash Generated:', fallbackHash);
			return fallbackHash;
		} catch (fallbackError) {
			console.error('Failed to write fallback hash:', fallbackError);
			return null;
		}
	}
}

// Run the hash generation
generateServiceWorkerHash();
