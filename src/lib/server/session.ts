import {prisma}from "./db";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { User, Session } from "@prisma/client";
import type { RequestEvent } from "@sveltejs/kit";

// Use the same cookie name as auth module
export const SESSION_COOKIE_NAME = 'auth-session';

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
    });

    if (!session) {
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime()) {
        await prisma.session.delete({ where: { id: session.id } });
        return { session: null, user: null };
    }

    // Extend session if it's close to expiring
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await prisma.session.update({
            where: { id: session.id },
            data: { expiresAt: newExpiresAt }
        });
        session.expiresAt = newExpiresAt;
    }

    return { session, user: session.user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await prisma.session.delete({ where: { id: sessionId } });
}

export async function invalidateUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
    event.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax",
        expires: expiresAt
    });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
    event.cookies.delete(SESSION_COOKIE_NAME, {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax"
    });
}

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    return Array.from(tokenBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export async function createSession(token: string, userId: string): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    const session = await prisma.session.create({
        data: {
            id: sessionId,
            userId,
            expiresAt
        }
    });

    return session;
}

type SessionValidationResult = 
    | { session: Session & { user: User }; user: User }
    | { session: null; user: null };
