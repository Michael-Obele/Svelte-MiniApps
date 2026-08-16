import { Capacitor } from '@capacitor/core';

/**
 * Android deep links & share intents.
 *
 * The native app is a thin shell that loads the live site (see
 * `capacitor.config.ts` `server.url`), so incoming intents are converted into
 * plain web navigations inside the webview:
 *
 * - App Links (VIEW intent): a link to svelte-apps.me opened from another
 *   app lands on that route inside the app.
 * - Share intents (SEND intent): text shared from another app is forwarded
 *   to the existing `/share-target` flow, which routes it to the best
 *   mini-app (flash-text, converters, summarizer, ...). Links to our own
 *   site open the route directly instead.
 */
export async function initAppIntents(): Promise<void> {
	if (!Capacitor.isNativePlatform()) return;

	const [{ App }, { CapacitorShareTarget }] = await Promise.all([
		import('@capacitor/app'),
		import('@capgo/capacitor-share-target')
	]);

	// Cold start via App Link: the launch URL can arrive before the listener
	// below is attached, so read it explicitly.
	const launch = await App.getLaunchUrl();
	if (launch?.url) {
		navigateToOwnUrl(launch.url);
	}

	// Warm start (app already running, opened from another app).
	App.addListener('appUrlOpen', (event) => {
		navigateToOwnUrl(event.url);
	});

	// Shared content from the Android share sheet.
	CapacitorShareTarget.addListener('shareReceived', (event) => {
		const title = event.title?.trim() ?? '';
		const text = (event.texts ?? []).join(' ').trim();
		const payload = text || title;
		if (!payload) return;

		// A link to our own site (e.g. a shared `/f/<slug>` flash link or an
		// app route) opens the route directly in-app.
		const ownUrl = extractOwnUrl(payload);
		if (ownUrl) {
			window.location.href = ownUrl;
			return;
		}

		// Otherwise reuse the web share-target flow, which decides between
		// flash-text, the summarizer, converters, QR, etc.
		const params = new URLSearchParams();
		if (title) params.set('title', title);
		params.set('text', text || title);
		window.location.href = `/share-target?${params.toString()}`;
	});
}

/** Navigates the webview to a URL on our own origin, ignoring everything else. */
function navigateToOwnUrl(url: string): void {
	try {
		const parsed = new URL(url);
		if (parsed.host === window.location.host) {
			window.location.href = parsed.href;
		}
	} catch {
		// Malformed URL — nothing to navigate to.
	}
}

/** Returns the first http(s) URL pointing at our own site, if any. */
function extractOwnUrl(payload: string): string | null {
	const match = payload.match(/https?:\/\/[^\s<>"']+/i);
	if (!match) return null;

	try {
		const parsed = new URL(match[0]);
		return parsed.host === window.location.host ? parsed.href : null;
	} catch {
		return null;
	}
}
