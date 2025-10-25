import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import * as auth from '$lib/server/auth.js';
import * as main from './locales/loader.server.svelte.js';
import * as js from './locales/loader.server.js';
import { runWithLocale, loadLocales } from 'wuchale/load-utils/server';
import { locales } from 'virtual:wuchale/locales';
import { sequence } from '@sveltejs/kit/hooks';

// load at server startup (only server-side loader)
loadLocales(main.key, main.loadIDs, main.loadCatalog, locales);
loadLocales(js.key, js.loadIDs, js.loadCatalog, locales);

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(auth.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSession(sessionId);
	if (session) {
		event.cookies.set(auth.sessionCookieName, session.id, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev
		});
	} else {
		event.cookies.delete(auth.sessionCookieName, { path: '/' });
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handleLang: Handle = async ({ event, resolve }) => {
	// Read locale from cookie (set by client-side localStorage sync)
	// Fallback to 'en' if cookie is not set or invalid
	const cookieLocale = event.cookies.get('app-locale');
	const locale = cookieLocale && locales.includes(cookieLocale) ? cookieLocale : 'en';

	return await runWithLocale(locale, () => resolve(event));
};

export const handle = sequence(handleAuth, handleLang);
