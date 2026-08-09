/**
 * Client-side encryption for FlashText pastes.
 *
 * AES-GCM 256 via WebCrypto. The key never leaves the browser: it travels in
 * the URL fragment, which is not sent to the server. A lost link is therefore
 * unrecoverable by design — the server holds ciphertext it cannot read.
 */

const IV_BYTES = 12; // 96 bits, the size AES-GCM is specified for.

/** Thrown when a payload cannot be decrypted: wrong key, tampered, or malformed. */
export class FlashDecryptError extends Error {
	constructor(message = 'Unable to decrypt this paste') {
		super(message);
		this.name = 'FlashDecryptError';
	}
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

	let binary: string;
	try {
		binary = atob(padded);
	} catch {
		throw new FlashDecryptError('Malformed payload');
	}

	// new Uint8Array(n) is backed by a plain ArrayBuffer, satisfying the
	// BufferSource requirement of the WebCrypto calls below.
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

/** Generates a fresh AES-GCM 256 key, base64url-encoded for a URL fragment. */
export async function generateFlashKey(): Promise<string> {
	const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
		'encrypt',
		'decrypt'
	]);
	return toBase64Url(new Uint8Array(await crypto.subtle.exportKey('raw', key)));
}

async function importKey(keyB64: string, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
	const raw = fromBase64Url(keyB64);
	if (raw.byteLength !== 32) {
		throw new FlashDecryptError('Invalid key length');
	}

	try {
		return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, [usage]);
	} catch {
		throw new FlashDecryptError('Invalid key');
	}
}

/** Encrypts `plaintext`, returning base64url of `iv || ciphertext`. */
export async function encryptFlashText(plaintext: string, keyB64: string): Promise<string> {
	const key = await importKey(keyB64, 'encrypt');
	const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		new TextEncoder().encode(plaintext)
	);

	const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(ciphertext), iv.byteLength);

	return toBase64Url(combined);
}

/** Decrypts a payload produced by {@link encryptFlashText}. */
export async function decryptFlashText(payload: string, keyB64: string): Promise<string> {
	const key = await importKey(keyB64, 'decrypt');
	const combined = fromBase64Url(payload);

	if (combined.byteLength <= IV_BYTES) {
		throw new FlashDecryptError('Malformed payload');
	}

	try {
		const plaintext = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: combined.slice(0, IV_BYTES) },
			key,
			combined.slice(IV_BYTES)
		);
		return new TextDecoder().decode(plaintext);
	} catch {
		// AES-GCM authentication failure — wrong key or tampered ciphertext.
		throw new FlashDecryptError();
	}
}
