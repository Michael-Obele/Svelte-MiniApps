import { writable } from 'svelte/store';
import { toast } from "svelte-sonner";
import { RefreshCw } from 'lucide-svelte'; 

let swRegistration: ServiceWorkerRegistration | null = null;

export function notifyUpdateAvailable(registration: ServiceWorkerRegistration) {
    swRegistration = registration;
    
    toast('New Update Available', {
        description: 'A new version of the app is ready to install',
        duration: Number.POSITIVE_INFINITY, 
        icon: RefreshCw, 
        action: {
            label: 'Update Now',
            onClick: () => applyUpdate()
        },
        cancel: {
            label: 'Later',
            onClick: () => toast.dismiss()
        },
        onDismiss: () => {
            console.log('Update notification dismissed');
        },
        class: 'update-toast', 
        style: 'background-color: var(--background); color: var(--foreground); border: 1px solid var(--border);'
    });
}

export async function applyUpdate() {
    if (swRegistration && swRegistration.waiting) { 
        toast.promise(
            new Promise<void>((resolve) => {
                swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => {
                    window.location.reload();
                    resolve();
                }, 500);
            }),
            {
                loading: 'Applying update...',
                success: 'Update successful! Reloading...',
                error: 'Update failed. Please refresh the page.',
            }
        );
    }
}