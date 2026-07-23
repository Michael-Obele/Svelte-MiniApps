import { cleanupAllExpired } from '../../src/lib/server/flash-files';

/**
 * Hourly Netlify scheduled function. Sweeps the database and the R2
 * bucket of any flash text / file past its expiry. The shared
 * `cleanupAllExpired()` helper used here is also invoked eagerly on
 * every public read so that, in practice, this cron only has a
 * handful of stragglers to mop up.
 */
export default async (req) => {
	const { next_run } = await req.json();

	const result = await cleanupAllExpired({ batchSize: 500 }).catch((error) => {
		console.error('Hourly flash cleanup failed', error);
		return {
			deletedTexts: 0,
			deletedFileRows: 0,
			deletedR2Objects: 0,
			hadMore: true
		};
	});

	return new Response(
		JSON.stringify({
			deletedTexts: result.deletedTexts,
			deletedFileRows: result.deletedFileRows,
			deletedR2Objects: result.deletedR2Objects,
			hadMore: result.hadMore,
			next_run
		}),
		{
			headers: { 'content-type': 'application/json' }
		}
	);
};
