"use strict";

// Incrementing VERSION in CACHE_NAME will kick off the 
// install event and force previously cached
// resources to be cached again.
// but the new service worker will not be activated until all 
// tabs with this webapp are closed.

const CACHE_NAME = '2021.205.1219';

self.addEventListener("install", event => {
    console.log("event install ", CACHE_NAME);
    // the ugly trick of avoiding the waiting phase
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(
                [
                    "css/new_date_time_units_and_formats.css",
                    "pkg/new_date_time_units_and_formats_bg.wasm",
                    "pkg/new_date_time_units_and_formats.js",
                    "index.html",
                    "start_service_worker.js",
                    "manifest.json",
                    "icons/favicon-32x32.png",
                    "icons/favicon-16x16.png",
                    "icons/favicon-96x96.png",
                    "icons/android-icon-144x144.png",
                    "icons/android-icon-192x192.png",
                ]
            );
        })
    );
});

self.addEventListener("activate", event => {
    console.log("event activate");
    // Delete all caches that aren't CACHE_NAME.
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (CACHE_NAME.indexOf(cacheName) === -1) {
                        // If this cache name isn't right, then delete it.
                        console.log("Deleting out of date cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", event => {
    // console.log("event fetch");
    // Let the browser do its default thing
    // for non-GET requests.
    if (event.request.method != "GET") return;

    // Prevent the default, and handle the request ourselves.
    event.respondWith(async function () {
        // Try to get the response from a cache.
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            // console.log("from cache");
            // If we found a match in the cache, return it, but also
            // update the entry in the cache in the background.
            event.waitUntil(cache.add(event.request));
            return cachedResponse;
        }

        // If we didn't find a match in the cache, use the network and cache it for later.
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
    }());
});
