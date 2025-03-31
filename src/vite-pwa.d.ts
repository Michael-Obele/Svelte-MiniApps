/// <reference types="@vite-pwa/sveltekit" />
/// <reference types="vite/client" />

// Define the pwa info module
declare module 'virtual:pwa-info' {
	export interface PWAInfo {
		pwaInDevEnvironment: boolean;
		webManifest: {
			href: string;
			useCredentials: boolean;
			linkTag: string;
		};
		registerSW?: (options?: RegisterSWOptions) => Promise<RegisterSWResult>;
	}
	export const pwaInfo: PWAInfo | undefined;
}

// Define register svelte module
declare module 'virtual:pwa-register/svelte' {
	// Type for registration options
	export interface RegisterSWOptions {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisteredSW?: (
			swScriptUrl: string,
			registration: ServiceWorkerRegistration | undefined
		) => void;
		onRegisterError?: (error: Error) => void;
	}

	// Type for registration result
	export interface RegisterSWResult {
		needRefresh: boolean;
		offlineReady: boolean;
		updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
	}

	// Main function exposed by the module
	export function useRegisterSW(options?: RegisterSWOptions): RegisterSWResult;
}

// Additional custom type declarations if needed
