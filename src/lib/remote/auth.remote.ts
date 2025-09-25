import { getRequestEvent, query } from '$app/server';

// Type for the current user (matches what auth.ts returns)
type CurrentUser = {
	id: string;
	username: string;
	role: string;
	createdAt: Date;
} | null;

export const getCurrentUser = query(async (): Promise<CurrentUser> => {
	const event = getRequestEvent();

	if (!event) {
		return null;
	}

	return event.locals.user;
});
