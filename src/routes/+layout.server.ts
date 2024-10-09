// import type { LayoutServerLoad } from './$types';
// import { getDbInstance } from '$lib/database';
// import { goto } from '$app/navigation';
// import { redirect } from '@sveltejs/kit';

// const db = getDbInstance(); // Get the Prisma client instance

// interface User {
// 	username: string | null;
// 	id: string | null;
// 	isAdmin: boolean | null;
// 	createdAt: Date | null;
// 	name: string | null;
// 	image: string | null;
// 	email: string | null;
// }

// interface Password {
// 	password: string;
// }

// export const load: LayoutServerLoad = async (event) => {
// 	const sessionID = event.cookies.get('session');

// 	let userData: User | null = null;
// 	/**
// 	 * Retrieves user data from the session ID or session object.
// 	 *
// 	 * @param {string | undefined} sessionID - The session ID used to identify the user.
// 	 * @param {any} event - The event object containing the user's session information.
// 	 * @returns {Promise<User | null>} A promise that resolves to the user data object.
// 	 */
// 	if (sessionID) {
// 		userData = await getUserBySessionID(sessionID);
// 	} else {
// 		const session = await event.locals.auth();
// 		if (session && session.user) {
// 			userData = {
// 				username: session.user.name || null,
// 				id: null,
// 				isAdmin: false,
// 				createdAt: null,
// 				name: session.user.name || null,
// 				image: session.user.image || null,
// 				email: session.user.email || null
// 			};
// 		}
// 	}

// 	let url = event.url.pathname;

// 	if (url !== url.toLowerCase()) {
// 		redirect(301, url.toLowerCase());
// 	}

// 	return {
// 		user: { userData }
// 	};
// };

// /**
//  * Fetches a user by session ID.
//  *
//  * @param {string} sessionID - User's session ID.
//  * @return {Promise<User | null>} User object if found, null otherwise.
//  */
// async function getUserBySessionID(sessionID: string): Promise<User | null> {
// 	return await db.user.findUnique({
// 		where: { userAuthToken: sessionID },
// 		select: {
// 			id: true,
// 			username: true,
// 			isAdmin: true,
// 			createdAt: true,
// 			SavePassword: true,
// 			name: true,
// 			image: true,
// 			email: true
// 		}
// 	});
// }


import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
export const load: LayoutServerLoad = async (event) => {

	let url = event.url.pathname;

	if (url !== url.toLowerCase()) {
		redirect(301, url.toLowerCase());
	}
};