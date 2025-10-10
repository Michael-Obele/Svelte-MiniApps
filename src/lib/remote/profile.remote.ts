import { getRequestEvent, query, form } from '$app/server';
import { prisma } from '$lib/server/db';
import { hashPassword, verifyPasswordHash } from '$lib/server/password.server';
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';

// ============================================================================
// QUERIES - Read data from the server
// ============================================================================

/**
 * Get the current user's profile data with statistics
 */
export const getUserProfile = query(async () => {
	const event = getRequestEvent();
	if (!event?.locals.user) {
		error(401, 'Unauthorized');
	}

	const userId = event.locals.user.id;

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			username: true,
			role: true,
			createdAt: true,
			updatedAt: true,
			age: true,
			githubId: true,
			googleId: true,
			_count: {
				select: {
					mantras: true,
					budgets: true,
					UserPassword: true,
					SocialLinkPage: true
				}
			}
		}
	});

	if (!user) {
		error(404, 'User not found');
	}

	return {
		user: {
			id: user.id,
			username: user.username,
			role: user.role,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
			age: user.age,
			hasGithub: !!user.githubId,
			hasGoogle: !!user.googleId,
			isAdmin: user.role === 'admin'
		},
		stats: {
			totalMantras: user._count.mantras,
			totalBudgets: user._count.budgets,
			totalPasswords: user._count.UserPassword,
			totalSocialPages: user._count.SocialLinkPage,
			accountAge: Math.floor(
				(Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
			)
		}
	};
});

/**
 * Get user's saved passwords
 */
export const getUserPasswords = query(async () => {
	const event = getRequestEvent();
	if (!event?.locals.user) {
		error(401, 'Unauthorized');
	}

	const passwords = await prisma.userPassword.findMany({
		where: { userId: event.locals.user.id },
		select: {
			id: true,
			details: true,
			createdAt: true,
			updatedAt: true
		},
		orderBy: { createdAt: 'desc' }
	});

	return passwords.map((p: any) => ({
		id: p.id,
		details: p.details,
		createdAt: p.createdAt.toISOString(),
		updatedAt: p.updatedAt.toISOString()
	}));
});

// ============================================================================
// FORMS - Write data to the server
// ============================================================================

/**
 * Update user profile (username, age)
 */
export const updateProfile = form(
	v.object({
		username: v.pipe(v.string(), v.minLength(3), v.maxLength(50)),
		age: v.optional(v.pipe(v.string(), v.transform(Number)))
	}),
	async ({ username, age }) => {
		const event = getRequestEvent();
		if (!event?.locals.user) {
			error(401, 'Unauthorized');
		}

		try {
			await prisma.user.update({
				where: { id: event.locals.user.id },
				data: {
					username,
					age: age || null
				}
			});

			// Refresh the profile query
			getUserProfile().refresh();

			return { success: true, message: 'Profile updated successfully' };
		} catch (err) {
			error(500, 'Failed to update profile');
		}
	}
);

/**
 * Update user password
 */
export const updatePassword = form(
	v.object({
		currentPassword: v.pipe(v.string(), v.minLength(1)),
		newPassword: v.pipe(v.string(), v.minLength(8)),
		confirmPassword: v.pipe(v.string(), v.minLength(8))
	}),
	async ({ currentPassword, newPassword, confirmPassword }) => {
		const event = getRequestEvent();
		if (!event?.locals.user) {
			error(401, 'Unauthorized');
		}

		if (newPassword !== confirmPassword) {
			error(400, 'Passwords do not match');
		}

		try {
			const user = await prisma.user.findUnique({
				where: { id: event.locals.user.id }
			});

			if (!user) {
				error(404, 'User not found');
			}

			const validPassword = await verifyPasswordHash(currentPassword, user.passwordHash);

			if (!validPassword) {
				error(400, 'Current password is incorrect');
			}

			const passwordHash = await hashPassword(newPassword);

			await prisma.user.update({
				where: { id: event.locals.user.id },
				data: { passwordHash }
			});

			return { success: true, message: 'Password updated successfully' };
		} catch (err: any) {
			if (err.status) throw err;
			error(500, 'Failed to update password');
		}
	}
);

/**
 * Delete user account
 */
export const deleteAccount = form(
	v.object({
		confirmUsername: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ confirmUsername }) => {
		const event = getRequestEvent();
		if (!event?.locals.user) {
			error(401, 'Unauthorized');
		}

		if (confirmUsername !== event.locals.user.username) {
			error(400, 'Username does not match');
		}

		try {
			await prisma.user.delete({
				where: { id: event.locals.user.id }
			});

			redirect(303, '/login');
		} catch (err) {
			error(500, 'Failed to delete account');
		}
	}
);
