# PIT Web v2 — drricardofrusso.com (rediseño)

Sitio estático del Dr. Ricardo D. Frusso (PIT · Neuroproloterapia), implementado desde el
proyecto de Claude Design "PIT" (`HomePit v2` + subpáginas, estética "Docshield").

**Estado: staging.** Todas las páginas llevan `noindex` (meta + header en `vercel.json`).

### La palanca del lanzamiento
El `noindex` sale de **una sola constante**: `STAGING` en **`_build/site.js`**.
Para publicar el sitio: poner `STAGING = false`, correr `node _build/build.js`, commit y push.
Eso quita el `<meta name="robots">` de las 18 páginas y el header `X-Robots-Tag` de
`vercel.json` de una sola vez.

Antes vivía en cinco lugares (los dos generadores, las dos páginas manuales y `vercel.json`)
y había que acordarse de los cinco; olvidarse de uno no rompe nada visible, simplemente esa
parte del sitio sigue invisible para Google. Ahora:
`convert.js` y `foro.js` piden `NOINDEX_META` al armar el `<head>`; `_build/sync-staging.js`
inyecta el meta en `index.html` y `curso-intro.html` entre los marcadores
`<!-- PIT-NOINDEX:START/END -->` (mismo mecanismo que `sync-nav.js`) y pone o saca la regla
del header en `vercel.json`. **No editar esos cinco lugares a mano: el build los pisa.**

Después de apagarlo, verificar: `curl -sI https://drricardofrusso.com | grep -i robots` no
tiene que devolver nada, y `noindex` no tiene que aparecer en el HTML servido.

## Estructura
- `index.html` + 10 subpáginas — HTML standalone, sin framework ni build para servir.
- `assets/css/` — `fonts.css` (Space Grotesk + JetBrains Mono self-hosted), `ds.css`
  (tokens + componentes del design system `pit-design-system`), `pit-v2.css` (piel v2:
  nav pill, footer gradiente, tokens `--txt-*` y `--sec-y`), `pit-mobile.css`,
  `pit-motion.css`.
  **`index.html` no carga `pit-v2.css`** (tiene su propio `<style>` inline): los tokens
  y los componentes compartidos existen en **dos copias que se mueven juntas**. Ver
  HANDOFF.md → Arquitectura antes de tocar cualquier estilo global.
- `assets/js/` — drawer (`pit-v2.js`), reveals (`pit-motion.js`), asistente IA
  (`pit-chat.js`, backend listo en `api/chat.js`, esperando `ANTHROPIC_API_KEY` —
  ver HANDOFF.md), toggle ES/EN (`pit-lang.js`, markup estático desde `_build/nav.js`),
  botón volver arriba (`pit-scrolltop.js`).
- `_dc-src/` — fuentes originales del proyecto de diseño (`.dc.html` completos y
  `cores/` con el contenido único por página).
- `_build/convert.js` — conversor determinístico `.dc.html` → HTML standalone.
  `index.html` y `curso-intro.html` son manuales (el aula del curso intro es una
  app vanilla JS portada del diseño reactivo).
- `_build/nav.js` — **fuente ÚNICA del nav del sitio** (header + drawer). Para
  cambiar el menú se edita SOLO este archivo; `convert.js`, `foro.js` y `sync-nav.js`
  lo consumen. (Las fuentes `.dc.html` conservan un bloque de nav que el build
  reemplaza automáticamente — no editar el nav ahí, no tiene efecto.)
- `_build/sync-nav.js` — inyecta el nav en las páginas manuales (`index.html`) entre
  los marcadores `<!-- PIT-NAV:START/END -->`, sin tocar su CSS inline.
- `_build/site.js` — banderas del sitio. Hoy solo `STAGING` (ver "la palanca del
  lanzamiento" más arriba).
- `_build/sync-staging.js` — propaga `STAGING` a las páginas manuales y a `vercel.json`.
- `_build/check-lang.js` — **verifica el diccionario ES/EN contra el HTML construido**
  (nodos de texto, `placeholder`, `aria-label`) y falla nombrando las claves huérfanas.
  La lista blanca son las cadenas marcadas con `// RUNTIME` en `assets/js/pit-lang.js`
  (las que escribe el JS y no están en el HTML servido). También detecta claves y
  traducciones repetidas, las dos trampas del formato que documenta ese archivo.
- **Build completo: `node _build/build.js`** (corre convert.js → foro.js → sync-nav.js →
  sync-staging.js → check-lang.js en orden; es idempotente). Los generadores van primero
  y los verificadores después, porque miran el HTML ya construido. También se pueden
  correr sueltos si hace falta.

## Foro (portal de contenido)

El foro es un portal generado desde archivos markdown — **no se edita el HTML a mano**:

- `_content/foro/*.md` — una publicación por archivo, con frontmatter (`titulo`, `slug`,
  `tipo: qa|caso|articulo`, `categoria: pyr|caso|evidencia|consejos|noticias`,
  `audiencia: pacientes|profesionales|todos`, `semana`, `fecha`, `fechaLabel`, `lectura`,
  `tags`, `resumen`, `portada`) y cuerpo en markdown mínimo (`##` títulos, `**negrita**`,
  `![img](url "CAPTION")`, `> idea clave`, `[[placeholder: pendiente]]`).
- `node _build/foro.js` regenera todo: `foro.html` (índice con destacado automático =
  la publicación más nueva, archivo completo, filtros funcionales por categoría y
  audiencia) y `foro/<slug>.html` (una página por publicación, con "Seguí leyendo" y
  link a la anterior generados solos).

**Publicar algo nuevo** = crear el `.md`, correr `node _build/foro.js`, commit y push
(el deploy sale automático). Convención de nombre: `AAAA-MM-DD-titulo-corto.md`.

### El generador valida antes de escribir
Si el frontmatter está mal, **el build corta nombrando archivo y campo** y no genera nada
(la validación corre antes de borrar `foro/`, así que el foro publicado no se toca). Chequea:
`slug` presente, con formato válido y **único** entre todos los posts; `categoria`,
`audiencia` y `tipo` contra las tablas del generador; `fecha` en formato `AAAA-MM-DD`
(de ahí sale el orden del archivo y cuál es la destacada); `lectura` numérica;
`titulo`, `resumen`, `semana` y `fechaLabel` no vacíos; y `portada` presente, con
esquema permitido y **existente en el repo**. Antes, un campo mal tipeado no daba error:
imprimía la palabra "undefined" en la página publicada.

Todo lo que sale del frontmatter y del markdown pasa por `esc()` antes de entrar al HTML.
El caso que rompe no es un ataque: **una comilla doble en `titulo` o en `resumen`** cierra
el atributo antes de tiempo en `<title>`, `<meta content>` y `alt=""`, y a partir de ahí
el navegador se come el resto del `<head>` — incluidos los `<link>` de las hojas de estilo.

Los links del cuerpo pasan por una **whitelist de esquemas** (`http`, `https`, `mailto`,
anclas y rutas relativas). `[texto](javascript:…)` producía un enlace funcional, y el sitio
no tiene CSP que lo contenga. La validación corta el build, y `inline()` además no emite
el `href` aunque llegue hasta ahí.

## Formularios (Formspree)
Foro y contacto envían vía `assets/js/pit-forms.js` → Formspree (AJAX, sin recargar,
manteniendo el estado de éxito en la página). El endpoint está en el objeto `ENDPOINTS`
de ese archivo — hoy apunta al form del sitio actual (`f/xykvrdad`), compartido por
foro y contacto; se distinguen por el `_subject` y el campo `tipo` de cada envío.
Si el endpoint contiene `REEMPLAZAR`, los forms andan en **modo demo** (muestran éxito
sin enviar) — útil para staging. Para separarlos, crear un segundo form en Formspree y
cambiar una línea. El newsletter hoy es el checkbox del form del foro (llega como campo
`newsletter: sí/no`); si más adelante se quiere lista propia, migrar a Brevo/Mailchimp.

**Seguridad pendiente para cuando escale:** el frontmatter, los atributos y los esquemas
de URL ya están cubiertos (ver arriba), pero el **cuerpo del markdown sigue sin sanitizar**:
`mdToHtml()` deja pasar HTML crudo escrito dentro de un párrafo. Hoy es seguro porque el
contenido lo escribe el autor del sitio. Si el foro llegara a aceptar contenido de terceros,
ahí sí hace falta un sanitizador de verdad (allowlist de etiquetas y atributos), que es
bastante más que un `esc()`.

## Pendientes de contenido (placeholders en el diseño)
- Testimonios reales (home y curso) — "A validar con Ricardo".
- Videos del curso intro (posters listos, falta conectar Vimeo/YouTube).
- Citas de evidencia científica (el PDF de referencias ya está enlazado).
- WhatsApp y horarios en Contacto (el mapa ya está embebido).
- URL de la Escuela de PIT (es el único de los 5 logos de la franja de respaldos que
  queda sin enlazar) y año real de su fundación (hoy figura 2026 por inferencia).
- Asistente IA: código listo (`api/chat.js` + `pit-chat.js`), solo falta cargar
  `ANTHROPIC_API_KEY` en Vercel — ver HANDOFF.md → Pendiente.

## Cifras del sitio
La duración del tratamiento es **6 a 8 sesiones** en todo el sitio, incluido el prompt
de sistema del asistente IA (`api/chat.js`). Si cambia, se cambia en los 9 lugares y en
el prompt; si no, el bot contesta algo distinto a lo que dice la página.

## Deploy
Vercel (proyecto separado del sitio live). Cuando esté aprobado: mover el dominio
`drricardofrusso.com` a este proyecto desde el dashboard de Vercel y quitar el noindex.

### Headers de seguridad (`vercel.json`)
Tres headers en todas las respuestas:
- `X-Content-Type-Options: nosniff` — el navegador respeta el `Content-Type` que
  mandamos en vez de adivinarlo. Sin esto, un archivo de `docs/` o `img/` servido con
  el tipo equivocado puede terminar interpretado como HTML o JS.
- `Referrer-Policy: strict-origin-when-cross-origin` — hacia afuera (Formspree, Hotmart,
  Instagram, el mapa) viaja solo el origen, no la URL completa. Importa porque las URLs
  del foro dicen de qué trata la consulta del visitante.
- `X-Frame-Options: SAMEORIGIN` — nadie puede meter el sitio en un iframe ajeno y montar
  un clickjacking sobre los formularios. `SAMEORIGIN` y no `DENY` para no cerrarle la
  puerta a embeber una página del sitio dentro de otra del mismo sitio.

**Sin CSP, a propósito.** El sitio tiene mucho CSS y JS inline: el `<style>` de la home,
los `style="..."` que emiten los generadores, los `<script>` inline del foro y del aula
del curso. Una CSP que no los contemple deja la home sin estilos o el aula sin funcionar,
y el fallo no se ve en el build: aparece recién en producción. Lo que habría que medir
antes de escribir una:
1. Inventariar todo lo inline y decidir entre `'unsafe-inline'` (que casi no aporta),
   hashes (se rompen con cada cambio de copy, salvo que los calcule el build) o `nonce`
   (necesita respuesta dinámica; hoy el sitio es estático).
2. Listar los orígenes externos reales: `formspree.io`, `www.google.com/maps`,
   `/_vercel/insights` y `/_vercel/speed-insights`, y lo que agregue el asistente IA.
3. Desplegar primero en `Content-Security-Policy-Report-Only` y mirar los reportes con
   tráfico real antes de pasarla a modo bloqueante.
Corolario mientras no haya CSP: lo que una CSP habría contenido hay que contenerlo en el
generador, porque no queda una segunda línea de defensa.

### Caché (`vercel.json`) — no romper
Los archivos de `assets/css/` y `assets/js/` **no llevan hash en el nombre**, así que van
con `max-age=0, must-revalidate` (revalidan con ETag → 304, no cuesta ancho de banda).
Solo `assets/fonts/` conserva la caché de un año con `immutable`. Poner `immutable` sobre
un archivo sin hash congela la copia del visitante durante un año: recibe el HTML nuevo
con el CSS y el JS viejos. Los `<link>`/`<script>` llevan `?v=2` para desenvenenar a los
navegadores afectados por la configuración anterior; no hace falta subir ese número en
cada cambio.
