import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { clearType } = await request.json();

		// Validate clear type
		const validTypes = ['cache', 'cookies', 'storage', 'executionContexts', '*'];
		if (!validTypes.includes(clearType) && clearType !== 'all') {
			return json({ error: 'Invalid clear type' }, { status: 400 });
		}

		// Build Clear-Site-Data header value
		let headerValue: string;

		switch (clearType) {
			case 'cache':
				headerValue = '"cache"';
				break;
			case 'cookies':
				headerValue = '"cookies"';
				break;
			case 'storage':
				headerValue = '"storage"';
				break;
			case 'executionContexts':
				headerValue = '"executionContexts"';
				break;
			case 'all':
				headerValue = '"*"';
				break;
			default:
				headerValue = `"${clearType}"`;
		}

		// Return response with Clear-Site-Data header
		return json(
			{
				success: true,
				message: `Clear-Site-Data header set for: ${clearType}`,
				headerValue
			},
			{
				status: 200,
				headers: {
					'Clear-Site-Data': headerValue,
					// Ensure secure context
					'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
				}
			}
		);
	} catch (error) {
		console.error('Error in clear-site-data endpoint:', error);
		return json({ error: 'Failed to process clear request' }, { status: 500 });
	}
};
