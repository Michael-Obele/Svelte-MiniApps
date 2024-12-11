import fs from 'fs';
import crypto from 'crypto';

// Path to the service worker file
const serviceWorkerPath = './src/service-worker.ts';
// Path to the output JSON file
const outputPath = './static/service-worker-hash.json';

// Function to generate hash of the file content
function generateHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Generate hash for the service worker file
const hash = generateHash(serviceWorkerPath);

// Write the hash to a JSON file
const hashData = { hash };
fs.writeFileSync(outputPath, JSON.stringify(hashData, null, 2));

console.log('Service worker hash generated:', hash);
