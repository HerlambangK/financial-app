// Register the service worker
self.addEventListener('install', (event) => {
	console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
	console.log('Service Worker activated');
});

// Listen for push notifications
self.addEventListener('push', (event) => {
	const data = event.data.json();
	const options = {
		body: data.body,
		icon: 'logo.png', // Ensure you have an logo in the public directory
		badge: 'logo.png',
	};

	event.waitUntil(self.registration.showNotification(data.title, options));
});
