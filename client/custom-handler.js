self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('audio-cache')
    .then(cache => {
       return cache.match(event.request)
          .then(function(response) {
              // Cache hit - return the response from the cached version
              if (response) {
                return response
              }
              throw Error('The cached response that was expected is missing.')
            }
          )
          .catch((e) => {
            // Fall back to just fetch()ing the request if some unexpected error
            // prevented the cached response from being valid.
            console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e)
            return fetch(event.request)
          })
    })
  )
})