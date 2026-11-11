const V='pspo-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  if(req.mode==='navigate'){
    // network first, so a new version shows up as soon as you are online
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  // everything else (icon, fonts): cached copy first, refreshed in the background
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(req,cp))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
