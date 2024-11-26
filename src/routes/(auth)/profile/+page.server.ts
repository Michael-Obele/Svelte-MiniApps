// import { fail, redirect } from '@sveltejs/kit';
// import type { Actions, PageServerLoad } from './$types';
// import { verify } from '@node-rs/argon2';
// import { eq } from 'drizzle-orm';

// import { db } from '$lib/server/db';
// import * as table from '$lib/server/db/schema';
// import * as auth from '$lib/server/auth';
// import { dev } from '$app/environment';

// export const load: PageServerLoad = async (event) => {
// 	if (!event.locals.user) {
// 		return redirect(302, '/login');
// 	}
// 	return {
// 		user: event.locals.user
// 	};
// };

// export const actions: Actions = {
// 	viewPasswords: async ({ locals }) => {
// 		if (!locals.user) {
// 			return fail(401, { error: 'Unauthorized' });
// 		}

// 		try {
// 			const passwords = await db
// 				.select()
// 				.from(table.savePasswords)
// 				.where(eq(table.savePasswords.userId, locals.user.id))
// 				.orderBy(table.savePasswords.createdAt, 'desc');

// 			return { displayPassword: passwords };
// 		} catch (error) {
// 			console.error('Error: ', error);
// 			return fail(400, { error: 'No passwords' });
// 		}
// 	},

// 	hidePasswords: async () => {
// 		return { displayPassword: [] };
// 	},

// 	updatePassword: async ({ request, locals }) => {
// 		if (!locals.user) {
// 			return fail(401, { error: 'Unauthorized' });
// 		}

// 		const formData = await request.formData();
// 		const currentPassword = formData.get('currentPassword');
// 		const newPassword = formData.get('newPassword');

// 		if (!validatePassword(currentPassword) || !validatePassword(newPassword)) {
// 			return fail(400, { error: 'Invalid password format' });
// 		}

// 		try {
// 			const user = await db
// 				.select()
// 				.from(table.user)
// 				.where(eq(table.user.id, locals.user.id))
// 				.then(rows => rows[0]);

// 			if (!user?.passwordHash) {
// 				return fail(400, { error: 'Cannot change password for OAuth users.' });
// 			}

// 			const validPassword = await verify(user.passwordHash, currentPassword, {
// 				memoryCost: 19456,
// 				timeCost: 2,
// 				outputLen: 32,
// 				parallelism: 1
// 			});

// 			if (!validPassword) {
// 				return fail(401, { error: 'Incorrect password' });
// 			}

// 			const newPasswordHash = await hash(newPassword, {
// 				memoryCost: 19456,
// 				timeCost: 2,
// 				outputLen: 32,
// 				parallelism: 1
// 			});

// 			await db
// 				.update(table.user)
// 				.set({ passwordHash: newPasswordHash })
// 				.where(eq(table.user.id, locals.user.id));

// 			return { message: 'Password updated successfully!' };
// 		} catch (error) {
// 			console.error('Error updating password:', error);
// 			return fail(500, { error: 'Failed to update password' });
// 		}
// 	}
// };

// function validatePassword(password: unknown): password is string {
// 	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
// }