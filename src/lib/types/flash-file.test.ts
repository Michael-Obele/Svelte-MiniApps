import { describe, expect, it } from 'vitest';
import {
	MAX_MULTIPART_PARTS,
	MULTIPART_PART_SIZE,
	MULTIPART_THRESHOLD,
	planMultipartUpload,
	resolveEffectiveMaxFileSize
} from './flash-file.js';

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;

/** Cloudflare R2 rejects a single PUT above 5 GiB. */
const R2_SINGLE_PUT_LIMIT = 5 * GIB;
/** R2 rejects parts below 5 MiB (the final part may be smaller). */
const R2_MIN_PART_SIZE = 5 * MIB;
/** R2 rejects uploads with more than 10,000 parts. */
const R2_MAX_PARTS = 10_000;

describe('planMultipartUpload', () => {
	it('switches to multipart before R2’s single-PUT ceiling', () => {
		expect(MULTIPART_THRESHOLD).toBeLessThan(R2_SINGLE_PUT_LIMIT);
		// The largest file we accept must exceed the threshold, or the 6 GB
		// promise could never be satisfied by a single PUT.
		expect(resolveEffectiveMaxFileSize()).toBeGreaterThan(MULTIPART_THRESHOLD);
	});

	it('splits the current 6 GB ceiling into legal parts', () => {
		const { partSize, partCount } = planMultipartUpload(resolveEffectiveMaxFileSize());

		expect(partSize).toBeGreaterThanOrEqual(R2_MIN_PART_SIZE);
		expect(partCount).toBeLessThanOrEqual(R2_MAX_PARTS);
		expect(partCount).toBeGreaterThan(1);
	});

	it('covers the file exactly once', () => {
		const total = resolveEffectiveMaxFileSize();
		const { partSize, partCount } = planMultipartUpload(total);

		const fullParts = Math.floor(total / partSize);
		const remainder = total % partSize;
		const covered = fullParts * partSize + (remainder > 0 ? remainder : 0);

		expect(covered).toBe(total);
		expect(partCount).toBe(remainder > 0 ? fullParts + 1 : fullParts);
	});

	it('keeps the part count inside R2’s limit for absurdly large inputs', () => {
		for (const total of [4 * GIB, 6 * GIB, 500 * GIB, 5 * 1024 * GIB]) {
			const { partCount } = planMultipartUpload(total);
			expect(partCount).toBeLessThanOrEqual(R2_MAX_PARTS);
		}
	});

	it('never plans parts below the multipart minimum', () => {
		for (const total of [1, MIB, 100 * MIB, 4 * GIB]) {
			expect(planMultipartUpload(total).partSize).toBeGreaterThanOrEqual(
				Math.max(MULTIPART_PART_SIZE, R2_MIN_PART_SIZE)
			);
		}
	});
});
