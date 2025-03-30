import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL // Ensure this matches the .env configuration
		}
	}
});
