import { createHash } from 'crypto';
import { gzipSync } from 'zlib';
import type { Actions,  } from './$types';



export const actions: Actions = {
    default: async ({ request }) => {
    const data = await request.formData();
    const urls = data.get('urls')?.toString().split(',') || [];

    const concatenatedUrls = urls.join('');
    const hash = createHash('sha256').update(concatenatedUrls).digest('hex');
    const compressed = gzipSync(Buffer.from(hash, 'utf-8'));
    const result = compressed.toString('base64');

   return result;
    }
};