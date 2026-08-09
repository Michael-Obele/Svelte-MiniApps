import { describe, it, expect } from 'vitest';
import {
	generateFlashKey,
	encryptFlashText,
	decryptFlashText,
	FlashDecryptError
} from './flash-crypto';

describe('flash-crypto', () => {
	it('round-trips text', async () => {
		const key = await generateFlashKey();
		expect(await decryptFlashText(await encryptFlashText('hello world', key), key)).toBe(
			'hello world'
		);
	});

	it('round-trips unicode and newlines', async () => {
		const key = await generateFlashKey();
		const original = 'héllo 🌍\nsecond line\ttabbed';
		expect(await decryptFlashText(await encryptFlashText(original, key), key)).toBe(original);
	});

	it('produces different ciphertext for the same input', async () => {
		const key = await generateFlashKey();
		expect(await encryptFlashText('same', key)).not.toBe(await encryptFlashText('same', key));
	});

	it('does not leak plaintext into the ciphertext', async () => {
		const key = await generateFlashKey();
		expect(await encryptFlashText('supersecret', key)).not.toContain('supersecret');
	});

	it('rejects the wrong key', async () => {
		const ciphertext = await encryptFlashText('hello', await generateFlashKey());
		await expect(decryptFlashText(ciphertext, await generateFlashKey())).rejects.toBeInstanceOf(
			FlashDecryptError
		);
	});

	it('rejects a tampered payload', async () => {
		const key = await generateFlashKey();
		const ciphertext = await encryptFlashText('hello', key);
		const tampered = ciphertext.slice(0, -2) + (ciphertext.endsWith('A') ? 'B' : 'A');
		await expect(decryptFlashText(tampered, key)).rejects.toBeInstanceOf(FlashDecryptError);
	});

	it('rejects a malformed payload', async () => {
		await expect(decryptFlashText('!!!not-base64!!!', await generateFlashKey())).rejects.toBeInstanceOf(
			FlashDecryptError
		);
	});

	it('produces a url-safe key', async () => {
		const key = await generateFlashKey();
		expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(encodeURIComponent(key)).toBe(key);
	});
});
