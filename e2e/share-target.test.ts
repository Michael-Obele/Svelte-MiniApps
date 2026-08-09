import { expect, test } from '@playwright/test';

test.describe('share target', () => {
	test('routes a shared URL to the QR generator', async ({ page }) => {
		await page.goto('/share-target?url=https%3A%2F%2Fexample.com');
		await expect(page).toHaveURL(/\/apps\/qr-code-generator/);
	});

	test('routes shared text to flash-text', async ({ page }) => {
		await page.goto('/share-target?text=remember%20the%20milk');
		await expect(page).toHaveURL(/\/apps\/flash-text/);
	});

	test('falls back to the apps index for an empty share', async ({ page }) => {
		await page.goto('/share-target');
		await expect(page).toHaveURL(/\/apps$/);
	});

	test('rejects a foreign protocol payload', async ({ page }) => {
		const response = await page.goto('/handle-protocol?url=https%3A%2F%2Fevil.example.com');
		expect(response?.status()).toBe(400);
	});
});
