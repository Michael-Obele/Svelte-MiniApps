import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { getDbInstance } from '$lib/database';
import { page } from '$app/stores';
import { fail } from '@sveltejs/kit';

const db = getDbInstance();

export const actions: Actions = {
	save: async ({ request }) => {
		const data = await request.formData();
		const password = String(data.get('password'));
		let id = String(data.get('id'));

		console.log(password);
		// Save random password
		const user = await db.user.findUnique({ where: { id } });
		if (!user) {
			return fail(404, { invalid: true });
		}

		try {
			const savePassword = await db.savePassword.create({
				data: {
					password: password,
					userId: user.id
				}
			});
			console.log('savePassword = ', savePassword);
			return { saved: true };
		} catch (err) {
			console.error('Error:', err);
			return fail(400, { error: 'Something Unexpected happened!' });
		}
	},

	viewPasswords: async ({ request }) => {
		const data = await request.formData();
		let id = String(data.get('id'));
		// Ensure id is a string or undefined, not null

		const user = await db.user.findUnique({ where: { id } });
		if (!user) {
			return fail(404, { invalid: true });
		}

		try {
			const displayPassword = await db.savePassword.findMany({
				where: { userId: user.id },
				select: { password: true, createdAt: true },
				orderBy: {
					createdAt: 'desc'
				}
			});
			console.log('displayPassword = ', displayPassword);
			return { displayPassword };
		} catch (error) {
			return fail(400, { error: 'No passwords' });
		}
	},
	hidePasswords: async ({ request }) => {
		return { displayPassword: [] };
	}
};
