import { describe, it, expect } from 'vitest';
import { backoffMs } from './outbox';

describe('backoffMs', () => {
	it('grows exponentially', () => {
		expect(backoffMs(0)).toBe(1000);
		expect(backoffMs(1)).toBe(2000);
		expect(backoffMs(2)).toBe(4000);
		expect(backoffMs(3)).toBe(8000);
	});

	it('caps at five minutes', () => {
		expect(backoffMs(20)).toBe(300000);
	});

	it('handles a negative attempt count safely', () => {
		expect(backoffMs(-1)).toBe(1000);
	});
});
