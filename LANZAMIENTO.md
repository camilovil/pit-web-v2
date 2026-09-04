# Lanzamiento del sitio nuevo — 4 de septiembre de 2026

Destino: https://drricardofrusso.com. Proyecto nuevo: `pit-web-v2` (Vercel,
equipo `camilovils-projects`). Proyecto anterior: `curso-pit`; se conserva para
poder volver atrás sin reconstruirlo.

El dominio se administra en GoDaddy, con DNS ya dirigidos a Vercel:

- `@` A: `216.198.79.1`.
- `www` CNAME: `ecc87a22660d6205.vercel-dns-017.com`.
- Nameservers: `ns03.domaincontrol.com` y `ns04.domaincontrol.com`.

El cambio de sitio se hace moviendo los dos dominios entre proyectos de Vercel.
No requiere cambiar los nameservers ni los registros de correo en GoDaddy.
`www` debe redirigir permanentemente a `https://drricardofrusso.com`.

## Publicación

`STAGING = false` en `_build/site.js` quita el bloqueo a los buscadores.
Vercel ejecuta `node _build/build.js` antes de cada publicación para regenerar
las páginas y verificar CSS y traducciones. La rama de producción es `main`.

Antes de mover el dominio se verifica la nueva publicación en
`https://pit-web-v2.vercel.app`: páginas, PDFs y `/api/likes`. Después del cambio
se repiten los controles sobre el dominio final y la redirección de `www`.

## Likes compartidos

- Upstash for Redis: `pit-web-likes`, región São Paulo (`gru1`), plan Free.
- Actualización automática a un plan pago desactivada; sin eviction.
- Conectado a los entornos production, preview y development de `pit-web-v2`.
- Vercel guarda `KV_REST_API_URL` y `KV_REST_API_TOKEN`; nunca van al frontend.
- `/api/likes` acepta solo publicaciones existentes. El build genera la lista
  en `lib/foro-slugs.json` a partir del contenido validado.
- Una cookie anónima, firmada y HttpOnly recuerda cada navegador. No hay login:
  dos dispositivos o borrar las cookies representan visitantes distintos.
- Cada publicación usa un conjunto de Redis. Reintentar un like no duplica el
  voto; retirarlo no puede bajar el total de cero. Las operaciones son atómicas.
- El límite de escritura usa un resumen criptográfico de la IP con vida de
  60 segundos. No se almacena la dirección IP en la base de likes.
- Los votos que antes existían solo en localStorage no tenían un total central
  que se pudiera importar. El contador compartido empieza desde cero.
- Sin conexión se informa el error; nunca se muestra un guardado ficticio.

Pruebas locales: `node --test _build/check-likes.test.js`.
Se verificaron también dos visitantes y escrituras simultáneas contra Redis
real, retirando todos los votos de prueba al terminar.

## Volver al sitio anterior

Mover `drricardofrusso.com` y `www.drricardofrusso.com` de `pit-web-v2` a
`curso-pit` en Vercel. El proyecto anterior mantiene su publicación. No cambiar
los DNS ni eliminar la base de likes. Para un fallo de una actualización del
sitio nuevo, también se puede promover una publicación anterior de `pit-web-v2`.
