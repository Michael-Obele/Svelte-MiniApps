import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createHash } from 'crypto';
import { gunzipSync } from 'zlib';

export const load = (async ({ params }) => {
    const { id } = params;

    try {
        // Decode the base64 string
        const compressedBuffer = Buffer.from(id, 'base64');

        // Decompress the gzip data
        const decompressed = gunzipSync(compressedBuffer).toString('utf-8');

        // Verify the hash (this example assumes the hash is part of the decompressed data)
        const originalUrls = ['https://example.com', 'https://another.com']; // Example original URLs
        const expectedHash = createHash('sha256').update(originalUrls.join('')).digest('hex');

        if (decompressed !== expectedHash) {
            throw error(400, 'Data integrity check failed');
        }

        // Use the decompressed data (assuming it contains the URLs)
        const urls = originalUrls; // Replace with actual logic to parse URLs from decompressed data

        return {
            urls
        };
    } catch (e) {
        console.error('Error processing links:', e);
        throw error(500, 'Error processing links');
    }
}) satisfies PageServerLoad;

