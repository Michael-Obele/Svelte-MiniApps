// Type definitions for virtual:pwa-info module
declare module 'virtual:pwa-info' {
  export interface PWAInfo {
    webManifest: {
      linkTag: string;
      href: string;
      useCredentials: boolean;
    };
    registerSW: (options?: {
      immediate?: boolean;
      onNeedRefresh?: () => void;
      onOfflineReady?: () => void;
      onRegistered?: (registration: ServiceWorkerRegistration) => void;
      onRegisterError?: (error: Error) => void;
    }) => Promise<{
      updateServiceWorker: () => Promise<void>;
    } | undefined>;
  }

  export const pwaInfo: PWAInfo | undefined;
}

// Type definition for RegisterSW
declare module 'virtual:pwa-register/svelte' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function registerSW(options?: RegisterSWOptions): Promise<{
    updateServiceWorker: () => Promise<void>;
  } | undefined>;
}
