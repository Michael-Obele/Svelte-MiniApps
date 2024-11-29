import { verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(302, '/');
    }
    return {};
};

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (!validateUsername(username)) {
            return fail(400, {
                message: 'Invalid username',
                username: String(username)
            });
        }
        if (!validatePassword(password)) {
            return fail(400, {
                message: 'Invalid password',
                username: username as string
            });
        }

        const existingUser = await db.user.findUnique({
            where: { username: username as string }
        });

        if (!existingUser) {
            return fail(400, {
                message: 'Incorrect username or password',
                username: username as string
            });
        }

        const validPassword = await verify(existingUser.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        if (!validPassword) {
            return fail(400, {
                message: 'Incorrect username or password',
                username: username as string
            });
        }

        const session = await auth.createSession(existingUser.id);
        event.cookies.set(auth.sessionCookieName, session.id, {
            path: '/',
            sameSite: 'lax',
            httpOnly: true,
            secure: !dev,
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return redirect(302, '/');
    }
};

function validateUsername(username: unknown): username is string {
    return typeof username === 'string' && username.length >= 3 && username.length <= 31 && /^[a-z0-9_-]+$/.test(username);
}

function validatePassword(password: unknown): password is string {
    return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
