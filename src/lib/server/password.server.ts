import { hash, verify } from '@node-rs/argon2';

/**
 * Hash a password using argon2
 * This file is server-only and should never be imported in browser code
 */
export async function hashPassword(password: string): Promise<string> {
	return hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

/**
 * Verify a password against a hash using argon2
 * This file is server-only and should never be imported in browser code
 */
export async function verifyPasswordHash(password: string, passwordHash: string): Promise<boolean> {
	return verify(passwordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}
