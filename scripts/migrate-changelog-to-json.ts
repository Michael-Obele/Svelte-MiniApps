#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// One-time migration script to extract all entries from TS file to JSON

const dataPath = join(process.cwd(), 'src/routes/changelog/generated-data.ts');
const jsonPath = join(process.cwd(), 'src/routes/changelog/generated-data.json');

console.log('🔄 Migrating changelog data from TS to JSON...');

try {
	const content = readFileSync(dataPath, 'utf-8');

	// Extract last processed commit
	const commitMatch = content.match(/\/\/ Last processed commit: ([a-f0-9]+)/i);
	const lastCommit = commitMatch ? commitMatch[1] : 'unknown';

	// Find the generatedTimeline array
	const startMatch = content.match(/export const generatedTimeline[^=]*=\s*(\[)/);
	if (!startMatch) {
		console.error('❌ Could not find generatedTimeline export');
		process.exit(1);
	}

	const startIndex = startMatch.index! + startMatch[0].length - 1;

	// Find matching closing bracket by counting
	let bracketCount = 0;
	let endIndex = -1;
	for (let i = startIndex; i < content.length; i++) {
		if (content[i] === '[') bracketCount++;
		else if (content[i] === ']') {
			bracketCount--;
			if (bracketCount === 0) {
				endIndex = i + 1;
				break;
			}
		}
	}

	if (endIndex === -1) {
		console.error('❌ Could not find closing bracket for array');
		process.exit(1);
	}

	// Extract and parse JSON
	const jsonStr = content.substring(startIndex, endIndex);
	const timeline = JSON.parse(jsonStr);

	console.log(`✅ Extracted ${timeline.length} entries from TS file`);

	// Write to JSON
	const jsonData = {
		lastProcessedCommit: lastCommit,
		generatedAt: new Date().toISOString(),
		timeline
	};

	writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

	console.log(`✅ Successfully migrated ${timeline.length} entries to JSON`);
	console.log(`📁 JSON file: ${jsonPath}`);
	console.log('🎉 Migration complete! JSON is now the source of truth.');
} catch (error) {
	console.error('❌ Migration failed:', error);
	process.exit(1);
}
