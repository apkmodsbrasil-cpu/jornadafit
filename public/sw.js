// Nome do cache (para futuras atualizações)
const CACHE_NAME = "jornada-fit-cache-v1";

// Arquivos essenciais para cache (vazio por enquanto, evite erros de fetch)
const FILES_TO_CACHE = [
  // "./index.html",       // só adicione se o arquivo existir
  // "./index.css",
  // "./manifest.json",
  // "./icons/icon-192x192.png",
];

// SW instalado
self.addEventListener("install", (event) => {
  console.log("🟢 Service Worker instalado");

  // Cache inicial (opcional, evitar erros de fetch)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE).catch((err) => {
        console.warn("⚠️ Alguns arquivos não puderam ser cacheados:", err);
      });
    })
  );

  self.skipWaiting(); // ativa imediatamente
});

// SW ativado
self.addEventListener("activate", (event) => {
  console.log("🟢 Service Worker ativado");

  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim(); // assume o controle da página imediatamente
});