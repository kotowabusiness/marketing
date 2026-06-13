const CACHE = 'kotowa-v2';
const ASSETS = [
  '/marketing/',
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Montserrat:wght@300;400;500;600;700&display=swap',
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  if(e.request.url.includes('supabase.co')) return;
  // Nunca cachear el HTML principal — siempre pedir la versión más reciente
  if(e.request.url.endsWith('/') || e.request.url.includes('index.html')){
    e.respondWith(
      fetch(e.request, {cache:'no-store'})
        .catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res=>{
        if(res.ok){
          const clone=res.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request,clone));
        }
        return res;
      })
      .catch(()=>caches.match(e.request))
  );
});
