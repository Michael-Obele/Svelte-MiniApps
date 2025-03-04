import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { prisma } from '$lib/server/db';
import type { Session, User } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(userId: string): Promise<Session> {
	const token = generateSessionToken();
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session = await prisma.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
		}
	});

	return session;
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await prisma.session.delete({
		where: { id: sessionId }
	});
}

export async function validateSession(sessionId: string) {
	const result = await prisma.session.findUnique({
		where: { id: sessionId },
		include: {
			user: {
				select: {
					id: true,
					username: true,
					role: true, // Include the user role
					createdAt: true
				}
			}
		}
	});

	if (!result) {
		return { session: null, user: null };
	}

	const { user, ...session } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await prisma.session.delete({
			where: { id: session.id }
		});
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		const newExpiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		const updatedSession = await prisma.session.update({
			where: { id: session.id },
			data: { expiresAt: newExpiresAt }
		});
		return { session: updatedSession, user };
	}

	return { session, user };
}

export async function generatePasswordHash(password: string): Promise<string> {
	const saltRounds = 10;
	return bcryptjs.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcryptjs.compare(password, hash);
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSession>>;
