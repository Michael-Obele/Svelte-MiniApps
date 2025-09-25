import { query, command, form } from '$app/server';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
import * as v from 'valibot';

// Query to get saved passwords for a user
export const getSavedPasswords = query(async () => {
	const user = await getCurrentUser();
	if (!user) {
		throw new Error('User not authenticated');
	}

	const passwords = await prisma.userPassword.findMany({
		where: { userId: user.id },
		select: {
			id: true,
			passwordHash: true,
			createdAt: true,
			details: true
		},
		orderBy: { createdAt: 'desc' }
	});

	return passwords;
});

// Form handler to save a password for a user
// Command to save a password for a user
export const savePassword = command('unchecked', async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Since we're using 'unchecked', data will be the raw argument passed
	const { password, details } = data as { password: string; details: string | null };

	if (!password) {
		throw new Error('Password is required');
	}

	// Store password in plain text so users can retrieve and use it
	await prisma.userPassword.create({
		data: {
			userId: user.id,
			passwordHash: password, // Note: field name is passwordHash but we store plain text
			details: details || null
		}
	});

	return { success: true };
});

// Command to delete a saved password
export const deletePassword = command(v.string(), async (passwordId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	await prisma.userPassword.deleteMany({
		where: {
			id: passwordId,
			userId: user.id // Ensure user can only delete their own passwords
		}
	});

	return { success: true };
});
