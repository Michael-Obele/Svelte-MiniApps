// src/lib/stores/notifications.js
import { writable } from 'svelte/store';

// Store for notification permission status
let permissionGranted = writable(false);

export function requestNotificationPermission() {
	if ('Notification' in window) {
		Notification.requestPermission().then((permission) => {
			permissionGranted.set(permission === 'granted');
			if (permission === 'granted') {
				console.log('Notification permission granted.');
			} else {
				console.log('Notification permission denied.');
			}
		});
	} else {
		console.error('Notifications are not supported in this browser.');
	}
}
