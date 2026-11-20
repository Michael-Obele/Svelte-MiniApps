import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, STORAGE_BUDGET_BYTES, STORAGE_BUDGET_GB } from './flash-file.js';

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;

/** Cloudflare R2 rejects a single PUT above 5 GiB. */
const R2_SINGLE_PUT_LIMIT = 5 * GIB;

describe('MAX_FILE_SIZE', () => {
	it('is 600 MB for every uploader', () => {
		expect(MAX_FILE_SIZE).toBe(600 * MIB);
	});

	it('stays under R2’s single-PUT ceiling', () => {
		// Every upload is a single presigned PUT, so the per-file ceiling must
		// never reach the 5 GiB limit that would require multipart upload.
		expect(MAX_FILE_SIZE).toBeLessThan(R2_SINGLE_PUT_LIMIT);
	});
});

describe('storage budget', () => {
	it('fits inside the 10 GB free tier in decimal bytes', () => {
		expect(STORAGE_BUDGET_GB).toBe(10);
		expect(STORAGE_BUDGET_BYTES).toBeLessThanOrEqual(10 * 1000 ** 3);
	});
});
