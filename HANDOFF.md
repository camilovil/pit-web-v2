# Handoff — Proyecto Web PIT v2

_Última actualización: 2026-07-28_

Resumen de estado para retomar el proyecto en una sesión nueva sin perder contexto.

## Qué es
Rediseño de la web del Dr. Ricardo D. Frusso (PIT / neuroproloterapia). Sitio
estático nuevo, **separado del actual** — de "landing que vende el curso" a un
ecosistema de contenido (foro semanal + curso gratuito + curso pago como cierre).

## Coordenadas
- **Código:** `E:\PIT\pit-web-v2`
- **Repo:** github.com/camilovil/pit-web-v2 (privado)
- **Live (staging):** https://pit-web-v2.vercel.app — con `noindex` en meta + header
- **Sitio actual (intacto):** drricardofrusso.com — no se tocó nada
- **Deploy:** Vercel conectado al repo; cada `git push` redeploya solo

## Arquitectura
- 11 páginas núcleo + portal del foro (8 publicaciones con URL propia).
- Build completo: **`node _build/build.js`** (corre convert.js → foro.js → sync-nav.js,
  idempotente). Generadores sueltos: `convert.js` (páginas desde `_dc-src/`),
  `foro.js` (foro desde `_content/foro/*.md`), `sync-nav.js` (nav en páginas manuales).
- **Nav en una sola fuente:** `_build/nav.js` define el menú (header + drawer); un cambio
  se hace SOLO ahí y se propaga a las 17 páginas al buildear. Las fuentes `.dc.html`
  conservan un bloque de nav que el build reemplaza (no editar el nav ahí).
- `index.html` y `curso-intro.html` son manuales (el aula del curso intro es una
  app vanilla JS con quizzes + progreso en localStorage). `index.html` recibe el nav
  vía `sync-nav.js` entre marcadores `<!-- PIT-NAV:START/END -->`.
- Assets propios: `img/` y `docs/` viven en el repo (ya no dependen del sitio viejo).
  Fuentes self-hosted (Space Grotesk + JetBrains Mono) en `assets/css/fonts.css`.
- Design system en `assets/css/ds.css` (+ `pit-v2.css`, `pit-mobile.css`, `pit-motion.css`).
  Nota: `index.html` usa CSS inline y NO carga el stack v2 completo (es la página "rara").

## Hecho y en producción
- **Formularios** (foro + contacto) → **Formspree** (`f/xykvrdad`, el del sitio actual;
  se distinguen por `_subject` y campo `tipo`). Verificado end-to-end (HTTP 200).
  Config en `assets/js/pit-forms.js`. Modo demo si el endpoint tiene `REEMPLAZAR`.
- **Newsletter:** checkbox dentro del form del foro (llega como `newsletter: sí/no`).
- **Mapa** de Google embebido en Contacto (endpoint `output=embed`, sin API key).
- **Analytics de Vercel** instalado en las 18 páginas (falta activarlo en el dashboard).
- **Home:** contenido gratuito como panel destacado, testimonios en desfile animado
  (ref. Docshield), logo animado en todas las páginas, sin contadores.
- **Franja de respaldos** (`.v2-trust` en `index.html`): los 5 logos institucionales
  reales — Hospital Italiano, Hospital de Clínicas, Lyftogt, Escuela de PIT y UBA.
  Archivos en `img/logos/` (procesados con Pillow: fondo a transparente, recorte y
  escala 2x; 64 KB en total). Reglas que conviene no romper:
  - **Altura óptica, no altura igual**: los modificadores `--wide` (28px, wordmarks),
    `--square` (34px), `--circle`/`--tall` (46px) existen porque un sello circular
    concentra su masa y necesita más alto para pesar lo mismo que un wordmark.
    Igualar la altura en px hace que el círculo se vea gigante y el wordmark enano.
  - **El orden significa algo**: primero las 4 instituciones que Ricardo representa
    (ejerce/enseña), después el separador tenue `.v2-trust-sep`, y al final la UBA
    (donde se formó). En mobile la misma distinción se hace con grilla 2x2 + el
    último ítem a ancho completo. Si se agrega un logo, va del lado que corresponda.
  - El fondo navy de la UBA es su marca oficial: se le da `border-radius` (`--chip`)
    para que lea como insignia, no como bloque suelto.
  - Los logos van **sin** `loading="lazy"` a propósito (están casi en el pliegue y
    pesan poco; diferirlos causaba pop-in) y con `width`/`height` explícitos.
  - M.N. 86.498 no está en la franja a propósito: ya figura en el footer legal.
- **Hero de la home**: los logos institucionales entran arriba del pliegue en desktop
  y laptop (en mobile quedan abajo a propósito). Dos cosas que hay que respetar si se
  vuelve a tocar:
  - `.v2-hero` **necesita** `box-sizing: border-box`. Sin eso, `min-height` aplica solo
    a la caja de contenido y el `padding-top` se suma encima (en 1080px daba 961px de
    hero con 167px de aire muerto, que era lo que empujaba los logos fuera de pantalla).
  - El hero se mide contra la **altura** de pantalla (`vh` en padding, márgenes,
    titular y foto), no solo contra el ancho; medido en px/vw desbordaba en laptops
    bajas. Margen actual de los logos sobre el pliegue: 16px en 1366x768, 65px en
    1440x900, 100px en 1920x1080.
  - **Nada de tamaño fijo encima de la foto**: el badge "30+ años · Hospital Italiano"
    se quitó porque, al pasar la foto a escalar con `vh`, la píldora (238px fijos)
    tapaba más de la mitad del ancho justo donde va la cara. Esa info ya la dice la
    franja de respaldos.
- **Grafo de conocimiento** del proyecto en `../graphify-out/` (graph.html, GRAPH_REPORT.md).
- **Toggle ES/EN** (`assets/js/pit-lang.js`): markup estático (viene en el HTML desde
  `_build/nav.js`, no se inyecta por JS) — antes causaba un "pop-in" visible y corría
  el riesgo de quedar visible fuera de sync con el resto del nav en mobile.
- **Nav sin wrap**: `white-space: nowrap` en logo/links/CTA/toggle — el texto nunca se
  parte ni se comprime. Breakpoint a hamburguesa en **1180px**, calculado como el ancho
  mínimo real medido (con nowrap) + margen. Si se agrega/saca un ítem del nav, remedir
  con `nav.style.width='fit-content'` en devtools y ajustar el `@media` en
  `assets/css/pit-v2.css` + `index.html` (ambos deben quedar iguales).
- **Botón "volver arriba"** (`assets/js/pit-scrolltop.js`): aparece al bajar scroll,
  apilado sobre el FAB del asistente IA en todas las páginas.
- **Ancla `#contenido`**: tiene `scroll-margin-top` para no quedar tapada por el nav
  fijo al navegar desde el link "Contenido" del menú.
- **Animaciones** (`assets/css/pit-motion.css` + `pit-motion.js`): hover de filas del
  foro, zoom de imágenes (`.pit-media`), stagger de listas (`.pit-stagger`) y foco
  visible por teclado. Reglas:
  - Todo lo que es movimiento va dentro de `@media (prefers-reduced-motion: no-preference)`.
    `:focus-visible` va FUERA a propósito (accesibilidad, no animación).
  - Solo se anima `transform`/`opacity`/`shadow`/`color` — nunca medidas que
    reflowen (evita reintroducir layout shift).
  - **El nav no lleva animación de entrada a propósito**: una barra que se mueve al
    cargar se lee como bug (ya pasó), no como animación.
  - `.pit-stagger` oculta a sus hijos hasta recibir `.pit-in`. `pit-motion.js` lo
    maneja con observer propio + 3 redes de seguridad (visible-al-cargar, timeouts
    1200/3500ms, y sin IntersectionObserver) para que el contenido NUNCA quede
    invisible.

## Pendiente
1. **Asistente IA** — **código listo, esperando la key.** Ya está la función
   serverless `api/chat.js` (llama a Claude Haiku con la key server-side) y el
   widget `assets/js/pit-chat.js` ya la consume vía `fetch('/api/chat')`. El
   prompt de sistema y los límites (max_tokens 500, 12 turnos, largo por mensaje)
   viven en el servidor, no en el frontend. Mientras no haya key, el asistente
   responde en modo demo (no rompe nada). **Para activarlo:**
   - Crear cuenta de API **separada** de claude.ai en console.anthropic.com
     (se paga por uso), poner un tope de gasto mensual (~USD 10) y generar una key.
   - En Vercel → proyecto pit-web-v2 → Settings → Environment Variables:
     agregar `ANTHROPIC_API_KEY` con el valor de la key. Redeploy → queda andando.
   - Modelo actual: `claude-haiku-4-5` (barato y rápido). Se cambia en `api/chat.js`.
2. **Activar Analytics** en Vercel → proyecto pit-web-v2 → pestaña Analytics → Enable.
3. **Contenido de Ricardo** (placeholders marcados en el sitio): 2-3 testimonios reales,
   video de bienvenida del curso + subir el de materiales, preguntas definitivas de las
   autoevaluaciones, textos de los 8 posts del foro, citas de evidencia científica,
   WhatsApp y horarios en Contacto.
4. **Al final:** mover el dominio drricardofrusso.com a este proyecto en Vercel y
   quitar el `noindex` (meta + vercel.json). Sin downtime, rollback instantáneo.

## Documentos para Ricardo
- Propuesta: `E:\PIT\Propuesta Web PIT - Dr Frusso.html` (autocontenido, para mandar).
- Artifacts online: propuesta + calculadora de presupuesto (links en el chat de la sesión).

## Seguridad (para cuando escale)
- `_build/foro.js` genera HTML desde markdown sin sanitizar. Hoy es seguro (contenido
  del autor); si el foro llegara a aceptar contenido de terceros, escapar antes de insertar.
- La API key del asistente IA va en variable de entorno de Vercel, nunca en el repo/front.
