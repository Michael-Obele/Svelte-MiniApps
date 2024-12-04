import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In a real app, you'd use a database. For demo, we'll use a Map
const linksStore = new Map();

export const POST: RequestHandler = async ({ request, params }) => {
    const links = await request.json();
    linksStore.set(params.id, links);
    return json({ success: true, id: params.id });
};

export const GET: RequestHandler = async ({ params }) => {
    const links = linksStore.get(params.id) || [];
    return json(links);
};
