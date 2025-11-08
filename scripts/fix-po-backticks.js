#!/usr/bin/env node

/**
 * Script to remove trailing backticks (```) from msgstr entries in .po files
 * This fixes a common issue where backticks are accidentally added to translations
 *
 * Usage:
 *   node scripts/fix-po-backticks.js
 *   npm run fix:po-backticks
 *   bun run fix:po-backticks
 *
 * The script will:
 * - Scan all .po files in src/locales/
 * - Find msgstr entries ending with ```
 * - Remove the trailing backticks
 * - Report which files were modified
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');

function processPoFile(filePath) {
  console.log(`Processing ${filePath}...`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let modified = false;
  const processedLines = lines.map((line, index) => {
    // Check if this is a msgstr line that ends with ```
    if (line.startsWith('msgstr ') && line.endsWith('```"')) {
      console.log(`  Found problematic msgstr line ${index + 1}: ${line}`);
      // Remove the trailing ``` but keep the closing quote
      const cleanedLine = line.slice(0, -4) + '"';
      console.log(`  Fixed to: ${cleanedLine}`);
      modified = true;
      return cleanedLine;
    }

    // Check for continuation lines that might end with ```
    if (line.startsWith('"') && line.endsWith('```"')) {
      console.log(`  Found problematic continuation line ${index + 1}: ${line}`);
      // Remove the trailing ``` but keep the quotes
      const cleanedLine = line.slice(0, -4) + '"';
      console.log(`  Fixed to: ${cleanedLine}`);
      modified = true;
      return cleanedLine;
    }

    return line;
  });

  if (modified) {
    const newContent = processedLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }

  return modified;
}

function main() {
  console.log('🔍 Scanning for .po files with trailing backticks...\n');

  // Get all .po files in the locales directory
  const poFiles = fs.readdirSync(LOCALES_DIR)
    .filter(file => file.endsWith('.po'))
    .map(file => path.join(LOCALES_DIR, file));

  console.log(`Found ${poFiles.length} .po files: ${poFiles.map(f => path.basename(f)).join(', ')}\n`);

  let totalModified = 0;

  for (const filePath of poFiles) {
    if (processPoFile(filePath)) {
      totalModified++;
    }
    console.log(''); // Empty line between files
  }

  console.log(`🎉 Processing complete! Modified ${totalModified} file(s).`);

  if (totalModified > 0) {
    console.log('\n💡 Tip: Run your tests and linting to ensure the changes are valid.');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processPoFile };