'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "flutter.js": "1cfe996e845b3a8a33f57607e8b09ee4",
"icons/Icon-maskable-512.png": "d4f41f796d375635f930f4bf7dc90797",
"icons/Icon-192.png": "b8782cdfd58ec78eab11bb710030797f",
"icons/Icon-512.png": "d4f41f796d375635f930f4bf7dc90797",
"icons/Icon-maskable-192.png": "b8782cdfd58ec78eab11bb710030797f",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/AssetManifest.json": "7cfe6ba733aafe05307d79ab1df017a1",
"assets/lib/assets/images/wave-btn.jpg": "b5a3551fbb91900761e05038782a202d",
"assets/lib/assets/images/icons/report_icon.svg": "8e3b35ec4353a7514aaa11e757c6b1cf",
"assets/lib/assets/images/icons/logout_icon.svg": "9ef1e0843abd8bf39eb478266ad667ba",
"assets/lib/assets/images/icons/facebook.svg": "3f0a8a98ddf6724924a900cad62b919a",
"assets/lib/assets/images/icons/close_icon.svg": "89575fc3d7205f2de241092a4fd85c2a",
"assets/lib/assets/images/icons/comments-page_icon.svg": "899fb52f64eebeee83c329fd41f08243",
"assets/lib/assets/images/icons/page-placeholder_icon.svg": "9cab35d4669056a2eba6214dc0cea3bd",
"assets/lib/assets/images/icons/caret_right.svg": "9d2e191b9a75623eb5bc550396d84c31",
"assets/lib/assets/images/icons/protectionrules-page_icon.svg": "c46ff706cdd03e29f1253234cf9956f8",
"assets/lib/assets/images/wave-btn.svg": "aa25ae632c648e328a2dca6ea68a602f",
"assets/lib/assets/fonts/ReplaiCustomIcons.ttf": "d27f604a1d8c0e6387b181fe00bc077d",
"assets/lib/assets/fonts/impact.ttf": "8fc622c3a2e2d992ec059cca61e3dfc0",
"assets/lib/assets/fonts/Avenir.ttc": "bdf471713ee7dec3e19576abe39ee749",
"assets/NOTICES": "97ed5ca3aa0f6abc68a94c134e2f0350",
"assets/FontManifest.json": "df98746e16b550a42e8803f5c58d0f0a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"main.dart.js": "0bb5c3022e6bd754b453dcedc9c64f57",
"splash/img/light-3x.png": "d0140ae9d485844a1115c03831d2e16c",
"splash/img/dark-2x.png": "eec19b4326c6304191c9a3fad9ac1d53",
"splash/img/light-2x.png": "eec19b4326c6304191c9a3fad9ac1d53",
"splash/img/dark-3x.png": "d0140ae9d485844a1115c03831d2e16c",
"splash/img/dark-4x.png": "b2a9d0b30de394b7ae61b4f7da766780",
"splash/img/dark-1x.png": "77a7f7da3c21b74fb185eb6d7c94d95a",
"splash/img/light-4x.png": "b2a9d0b30de394b7ae61b4f7da766780",
"splash/img/light-1x.png": "77a7f7da3c21b74fb185eb6d7c94d95a",
"splash/style.css": "3e8699dd65a865ff991ec5b47a93643d",
"splash/splash.js": "123c400b58bea74c1305ca3ac966748d",
"index.html": "7fabf81a7445dcceb5d9c47450d69aa0",
"/": "7fabf81a7445dcceb5d9c47450d69aa0",
"favicon.png": "e91e348884f1d84036775eee9f5d08d1",
"version.json": "3c6350ff12c68cca61cbc4e13dc8dd4b",
"manifest.json": "45bddf33ee0ce3bcfefb8cabab9d19a2"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
