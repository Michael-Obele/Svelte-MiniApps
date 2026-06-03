import { prisma } from '../../src/lib/server/db';

export default async (req) => {
	const { next_run } = await req.json();
	const result = await prisma.flashText.deleteMany({
		where: {
			expiresAt: { lt: new Date() }
		}
	});

	return new Response(
		JSON.stringify({
			deleted: result.count,
			next_run
		}),
		{
			headers: { 'content-type': 'application/json' }
		}
	);
};
