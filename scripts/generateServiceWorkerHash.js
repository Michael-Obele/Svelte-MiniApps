// import fs from 'fs';
// import crypto from 'crypto';

// // Path to the service worker file
// const serviceWorkerPath = './src/service-worker.ts';
// // Path to the output JSON file
// const outputPath = './static/service-worker-hash.json';

// // Function to generate hash of the file content
// function generateHash(filePath) {
//   const fileBuffer = fs.readFileSync(filePath);
//   const hashSum = crypto.createHash('sha256');
//   hashSum.update(fileBuffer);
//   return hashSum.digest('hex');
// }

// // Generate hash for the service worker file
// const hash = generateHash(serviceWorkerPath);

// // Write the hash to a JSON file
// const hashData = { hash };
// fs.writeFileSync(outputPath, JSON.stringify(hashData, null, 2));

// console.log('Service worker hash generated:', hash);


// generateServiceWorkerHash.ts
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateServiceWorkerHash() {
  const srcDir = path.resolve('./src');
  
  function getAllFiles(dirPath)  {
    const files  = [];
    
    fs.readdirSync(dirPath).forEach((file) => {
      const fullPath = path.join(dirPath, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...getAllFiles(fullPath));
      } else {
        // Ignore certain files or patterns
        if (!file.endsWith('.log') && !file.startsWith('.')) {
          files.push(fullPath);
        }
      }
    });
    
    return files;
  }

  // Generate hash of all source files
  const allSourceFiles = getAllFiles(srcDir);
  const fileHashes = allSourceFiles.map(filePath => {
    const fileContent = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileContent).digest('hex');
  });

  // Combine all file hashes and generate a final hash
  const combinedHash = crypto.createHash('sha256')
    .update(fileHashes.join(''))
    .digest('hex');

  // Write hash to a file 
  fs.writeFileSync('service-worker-hash.json', JSON.stringify({ 
    hash: combinedHash, 
    timestamp: new Date().toISOString(),
    files: allSourceFiles
  }, null, 2));

  console.log('Service Worker Hash Generated:', combinedHash);
}

// Run the hash generation
generateServiceWorkerHash();