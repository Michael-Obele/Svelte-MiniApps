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

// Command to save a password for a user with Valibot validation
export const savePassword = command(
	v.object({
		password: v.pipe(v.string(), v.nonEmpty('Password is required')),
		details: v.optional(
			v.nullable(v.pipe(v.string(), v.maxLength(200, 'Details must be 200 characters or less')))
		)
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Store password in plain text so users can retrieve and use it
		const savedPassword = await prisma.userPassword.create({
			data: {
				userId: user.id,
				passwordHash: data.password, // Note: field name is passwordHash but we store plain text
				details: data.details ?? null
			}
		});

		// Refresh the query to get the updated list
		await getSavedPasswords().refresh();

		return { success: true, passwordId: savedPassword.id };
	}
);

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

	// Refresh the query to get the updated list
	await getSavedPasswords().refresh();

	return { success: true };
});

// Command to edit a saved password
export const editPassword = command(
	v.object({
		passwordId: v.pipe(v.string(), v.nonEmpty('Password ID is required')),
		password: v.pipe(v.string(), v.nonEmpty('Password is required')),
		details: v.optional(
			v.nullable(v.pipe(v.string(), v.maxLength(200, 'Details must be 200 characters or less')))
		)
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Update password - ensure user can only update their own passwords
		const updatedPassword = await prisma.userPassword.updateMany({
			where: {
				id: data.passwordId,
				userId: user.id
			},
			data: {
				passwordHash: data.password, // Note: field name is passwordHash but we store plain text
				details: data.details ?? null,
				updatedAt: new Date()
			}
		});

		// Check if any password was actually updated
		if (updatedPassword.count === 0) {
			throw new Error('Password not found or unauthorized');
		}

		// Refresh the query to get the updated list
		await getSavedPasswords().refresh();

		return { success: true, passwordId: data.passwordId };
	}
);
