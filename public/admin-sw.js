// Minimal service worker so the staff app is installable.
// It deliberately caches NOTHING: admin pages hold customer and staff data,
// and must never be stored on a laptop. Offline mode is a separate project.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});