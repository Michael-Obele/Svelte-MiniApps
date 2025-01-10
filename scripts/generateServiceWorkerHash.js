// generateServiceWorkerHash.ts
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateServiceWorkerHash() {
	try {
		const serviceWorkerPath = path.resolve('./src/service-worker.ts');

		// Generate hash for the service worker file
		const fileContent = fs.readFileSync(serviceWorkerPath);
		const hash = crypto
			.createHash('sha256')
			.update(fileContent + Date.now())
			.digest('hex'); // Add timestamp to hash generation

		// Write hash to a file
		fs.writeFileSync(
			'./static/service-worker-hash.json',
			JSON.stringify(
				{
					hash: hash,
					timestamp: new Date().toISOString()
				},
				null,
				2
			)
		);

		console.log('Service Worker Hash Generated:', hash);
	} catch (error) {
		console.error('Failed to generate service worker hash:', error);
	}
}

// Run the hash generation
generateServiceWorkerHash();
