import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Google from '@auth/sveltekit/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import type { Provider } from '@auth/sveltekit/providers';

const prisma = new PrismaClient();

// const providers: Provider[] = [GitHub, Google];

// // Export this map of provider details to use in the sign-in page later
// export const providerMap = providers.map((provider) => {
// 	return { id: provider.options?.id, name: provider.options?.name };
// });

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	trustHost: true,
	providers: [GitHub, Google],
	pages: {
		signIn: '/signin'
		// error: '/error'
	}
});
