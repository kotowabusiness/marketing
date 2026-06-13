const CACHE = 'kotowa-v1';
const ASSETS = [
  '/marketing/',
  '/marketing/index.html',
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Montserrat:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instalar: cachear assets
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback a cache
self.addEventListener('fetch', e=>{
  // No cachear requests de Supabase (datos en tiempo real)
  if(e.request.url.includes('supabase.co')) return;
  
  e.respondWith(
    fetch(e.request)
      .then(res=>{
        // Cachear respuesta fresca
        if(res.ok){
          const clone=res.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request,clone));
        }
        return res;
      })
      .catch(()=>caches.match(e.request))
  );
});
