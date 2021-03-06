// var precache_urls = [
//   '../',
//   '../css/',
//   '../assets/',
//   '../fonts/',
//   '../pdf/'
// ];




// DON'T CHANGE THIS.
// ADDED A CODEKIT BUILD HOOK SHELL SCRIPT THAT REPLACES THIS WITH ALL FILES NEEDED TO BE PRE-CACHED

var precache_urls = TO-BE-REPLACED-WITH-AN-ARRAY-OF-ALL-FILES;

// DON'T CHANGE THIS CACHENAME.
// ADDED A CODEKIT BUILD HOOK SHELL SCRIPT THAT REPLACES THIS WITH THE LATEST GITHUB HASH
// WHICH IN RETURN BUSTS THE CACHE @ ACTIVATE, AND DELETES ALL THE OLD CACHED FILES.
// CLEANER.

var cacheName = 'stale-while-revalidate';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      precache_urls.forEach(function (precacheURL) {
        cache.add(precacheURL);
      });
    }).then(function() {
      return self.skipWaiting();
    }).catch(function(error){
      console.log(error);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // EXCLUDES ( _ RESERVED FOR FIREBASE )
  if (  event.request.url.indexOf( '__/' ) !== -1
    ||  event.request.url.indexOf( '/__' ) !== -1
    ||  event.request.url.indexOf( 'about:blank' ) !== -1
    ||  event.request.url.indexOf( '/imgs/' ) !== -1
    ||  event.request.url.indexOf( '/heroes/' ) !== -1
    ||  event.request.url.indexOf( '/v.json' ) !== -1
    ||  event.request.url.indexOf( '/cors.json' ) !== -1
    ||  event.request.url.indexOf( '/cors-min.json' ) !== -1
  ) {
    // console.log('Fetching from network: ', event.request.url);
    return false;
  }

  // INCLUDES
  if (  event.request.url.startsWith( 'https://crypt.ee' )
    ||  event.request.url.startsWith( 'https://flare.crypt.ee' )
    ||  event.request.url.startsWith( 'https://beta.crypt.ee' )
    ||  event.request.url.startsWith( 'https://fonts.gstatic.com' )
    ||  event.request.url.startsWith( 'https://fonts.googleapis.com' )
    ||  event.request.url.startsWith( 'https://sentry.io' )
    // ||  event.request.url.startsWith( 'https://firebasestorage.googleapis.com' )
    // ||  event.request.url.startsWith( 'http://127.0.0.1' )
  ) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return cache.match(event.request).then(function(cacheResponse) {

          var promise = fetch(event.request).then(function(networkResponse) {
            var clonedReponse = networkResponse.clone();
            if (event.request.method !== "POST" && event.request.method !== "DELETE")  {
              cache.put(event.request, clonedReponse);
              // console.log('Fetching from cache: ', event.request.url);
            }
            return networkResponse;
          }).catch(function(error){
            console.log(error);
          });
          return cacheResponse || promise;
        }).catch(function(error){
          console.log(error);
        });
      }).catch(function(error){
        console.log(error);
      })
    );
  } else {
    // console.log('Fetching from network: ', event.request.url);
    return false;
  }
  // return false
});

// self.addEventListener('activate', function(event) {
//   console.log('Activating Cryptee Service Worker!');
//   event.waitUntil(self.clients.claim());
// });

self.addEventListener("activate", function(event) {
  console.log('Activating Cryptee Service Worker!');
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log("Removing old cache", key);
          return caches.delete(key);
        }
      }));
    })
  );
});
