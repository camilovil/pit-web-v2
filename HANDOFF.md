# Handoff — Proyecto Web PIT v2

_Última actualización: 2026-07-29_

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
- Build completo: **`node _build/build.js`** (corre convert.js → foro.js → sync-nav.js →
  sync-foro-home.js, idempotente). Generadores sueltos: `convert.js` (páginas desde
  `_dc-src/`), `foro.js` (foro desde `_content/foro/*.md`), `sync-nav.js` (nav en páginas
  manuales), `sync-foro-home.js` (últimas publicaciones del foro en la home).
- **Nav en una sola fuente:** `_build/nav.js` define el menú (header + drawer); un cambio
  se hace SOLO ahí y se propaga a las 17 páginas al buildear. Las fuentes `.dc.html`
  conservan un bloque de nav que el build reemplaza (no editar el nav ahí).
- `index.html` y `curso-intro.html` son manuales (el aula del curso intro es una
  app vanilla JS con quizzes + progreso en localStorage). `index.html` recibe el nav
  vía `sync-nav.js` entre marcadores `<!-- PIT-NAV:START/END -->`, y las últimas tres
  publicaciones del foro vía `sync-foro-home.js` entre `<!-- PIT-FORO-HOME:START/END -->`.
  **Lo que está entre marcadores no se edita a mano**: el build lo reescribe.
- **Los posts del foro se leen desde un solo lugar:** `_build/foro-posts.js` (parser del
  frontmatter + tablas de categoría/audiencia + `esc`). Lo usan `foro.js` y
  `sync-foro-home.js`. Antes vivía dentro de `foro.js`, pero requerirlo desde otro
  script regeneraba el foro entero, y la alternativa era una segunda copia del parser —
  el mismo error que ya se paga con las dos copias del CSS.
- Assets propios: `img/` y `docs/` viven en el repo (ya no dependen del sitio viejo).
  Fuentes self-hosted (Space Grotesk + JetBrains Mono) en `assets/css/fonts.css`.
- Design system en `assets/css/ds.css` (+ `pit-v2.css`, `pit-mobile.css`, `pit-motion.css`).
- **La home NO carga `pit-v2.css`** (usa CSS inline; es la página "rara"). Consecuencia
  que hay que tener presente en cada cambio de estilo: **todo token o componente
  compartido vive en DOS copias — `index.html` (bloque `<style>`) y `pit-v2.css` — y las
  dos se mueven juntas.** Aplica a los tokens `--txt-*`, `--sec-y`, `--v2-slate`, los
  violetas, la franja de respaldos y el breakpoint del nav. Las copias llevan comentarios
  cruzados avisándolo. Si se toca una sola, el bug aparece únicamente en la home o
  únicamente en las subpáginas, que es lo más caro de diagnosticar.
  **Ya no se puede tocar una sola sin enterarse:** `_build/check-css.js` corre en el build,
  compara los 76 selectores compartidos con los valores ya resueltos (`var()` incluido) y
  falla nombrando selector y propiedad. Unificarlas en una sola fuente se evaluó y se
  descartó — el porqué, medido, está en el README → "Las dos copias del CSS".
- Lo que se inyecta por JS (widget del chat en `pit-chat.js`) y lo que sale de
  `_build/nav.js` **necesitan fallback** al usar tokens: `var(--txt-sm, 15px)`. Aparecen
  en `curso-intro.html`, que tampoco carga `pit-v2.css`, y sin fallback quedarían sin
  tamaño. Sin eso, el CTA del nav reaparecía en 14px en cada build.

## Sistema visual — reglas transversales
- **Escala tipográfica de 6 pasos** (`--txt-2xs` 11, `--txt-xs` 13, `--txt-sm` 15,
  `--txt-md` 17, `--txt-lg` 21, `--txt-xl` 24). Reemplazó los 16 tamaños sueltos que
  declaraba la home. **No inventar un tamaño nuevo**: si hace falta uno, se elige el paso
  más cercano o se discute agregar un paso a la escala. Los display siguen siendo
  `clamp()` fluidos a propósito: dependen del viewport, no de la escala.
  `ds.css`, `curso-intro.html` y las plantillas del foro todavía tienen tamaños sueltos;
  migrarlos es mecánico (los tokens ya existen) pero es otro trabajo.
- **Piso de 11px.** Ningún texto por debajo. El 9px de las credenciales de los logos era
  ilegible en mono mayúsculas y son justamente las que explican qué es cada logo.
- **Inputs a 16px en mobile** (`input, select, textarea` en `pit-v2.css`; arriba de 640px
  vuelven a `--txt-sm`). iOS Safari hace zoom a **toda la página** cuando el texto de un
  input mide menos de 16px y el visitante queda con la página ampliada en medio del
  formulario. Corolario: **nada de `font-size` inline en campos de formulario** — le gana
  por especificidad a cualquier hoja de estilos y obliga a editar el markup para arreglarlo
  (fue exactamente lo que pasó con foro y chat). Contacto conserva su propia copia de la
  regla porque su selector `.fld` gana por especificidad.
- **Ritmo vertical con un solo token:** `--sec-y: clamp(36px, 4.4vw, 64px)`. El aire entre
  secciones es 2× ese valor: 127px en desktop, 72px en mobile, en las 18 páginas. No
  agregar `padding-top` inline para "corregir" el espaciado de una sección: los cuatro
  parches que existían peleaban contra el desorden y se borraron.
  **Excepción deliberada y comentada:** hero → franja de logos queda en 23px. Los logos
  son parte del primer vistazo, no una sección aparte; separarlos los empuja abajo del
  pliegue.
- **Violeta = acento secundario, nunca acción.** `--v2-violet` / `--v2-violet-deep` /
  `--v2-violet-tint` aparecen solo en degradés (hero, cierre del curso, barra de datos y
  degradé superior de las subpáginas). **No toca links ni botones:** el azul tiene que
  seguir siendo la única señal de "esto se clickea". Queda escrito en el CSS.
- **Contraste:** `--v2-slate` es `#4B5766` (7.36:1 sobre blanco, AAA). No volver al
  `#5A6773` anterior, que daba 5.8:1.
- `font-variant-numeric: tabular-nums` en `.v2-stat-value`: esos valores cambian al tocar
  las pestañas de patologías y con cifras proporcionales los dígitos se corren.
- `.v2-title` usa `text-wrap: balance`, no `pretty` (en un h2 de dos líneas `pretty` no
  hace nada).

## Medición: cuidado con las animaciones
Las animaciones de entrada desplazan los paneles 28px y **no terminan si el navegador no
compone frames**, así que `getBoundingClientRect()` devuelve posiciones falsas. Cualquier
medición de layout hay que hacerla neutralizando `transform`/`opacity`/`transition`
primero. Toda la primera tanda de mediciones del ritmo vertical salió contaminada por esto.

## Caché en Vercel — regla crítica
`vercel.json` marcaba **todo** `/assets/` como `max-age=31536000, immutable`. Eso solo es
válido si el nombre del archivo lleva hash de contenido, y los nuestros se llaman siempre
igual: cualquier visitante que ya había entrado quedaba clavado un año en el CSS y el JS
de su primera visita, recibiendo el HTML nuevo con los estilos viejos.

- `/assets/fonts/` sigue con caché larga: las fuentes **sí** son inmutables.
- `/assets/css|js/` van en `max-age=0, must-revalidate`, igual que el HTML. Con ETag la
  revalidación devuelve 304 y no cuesta ancho de banda.
- **No volver a poner `immutable` sobre archivos sin hash en el nombre.**
- Los `<link>`/`<script>` llevan `?v=2` por única vez: el header nuevo no rescata a los
  navegadores ya envenenados (su copia vieja seguía vigente un año); cambiar la URL es lo
  único que los fuerza a bajar la nueva. De ahora en más revalidan solos, así que **no hace
  falta subir el número** en cada cambio.

## Hecho y en producción
- **Formularios** (foro + contacto) → **Formspree** (`f/xykvrdad`, el del sitio actual;
  se distinguen por `_subject` y campo `tipo`). Verificado end-to-end (HTTP 200).
  Config en `assets/js/pit-forms.js`. Modo demo si el endpoint tiene `REEMPLAZAR`.
- **Newsletter:** checkbox dentro del form del foro (llega como `newsletter: sí/no`).
- **Mapa** de Google embebido en Contacto (endpoint `output=embed`, sin API key).
- **Analytics de Vercel** instalado en las 18 páginas (falta activarlo en el dashboard).
  Speed Insights también en las 18 (los generadores lo emiten en el HEAD).
- **Home:** contenido gratuito como panel destacado, testimonios en desfile animado
  (ref. Docshield), logo animado en todas las páginas, sin contadores.
  Orden de secciones: **"¿Quién sos?" va ANTES de "Aprendé sobre PIT"** — el visitante
  primero se identifica (paciente o profesional) y después se le ofrece el material.
- **Franja de respaldos** (`.v2-trust`, en la home y en Sobre el Dr. Frusso): los 5 logos
  institucionales reales — Hospital Italiano, Hospital de Clínicas, Lyftogt, Escuela de
  PIT y UBA. Archivos en `img/logos/` (procesados con Pillow: fondo a transparente,
  recorte y escala 2x; 64 KB en total). Reglas que conviene no romper:
  - **Altura óptica, no altura igual**: los modificadores `--wide` (28px, wordmarks),
    `--square` (34px), `--circle`/`--tall` (46px) existen porque un sello circular
    concentra su masa y necesita más alto para pesar lo mismo que un wordmark.
    Igualar la altura en px hace que el círculo se vea gigante y el wordmark enano.
  - **`flex-wrap: nowrap`, no `wrap`.** Es UNA fila por definición. Con `wrap`, cualquier
    credencial más larga o cuerpo de letra más grande tiraba a la UBA sola a una segunda
    fila (se lee como error de maqueta) y dejaba el separador huérfano. Los ítems llevan
    `min-width: 0` para poder encogerse. Por debajo de ~1000px la credencial parte en dos
    líneas: es una degradación más tranquila que perder la fila.
  - **El orden significa algo**: primero las 4 instituciones que Ricardo representa
    (ejerce/enseña), después el separador tenue `.v2-trust-sep`, y al final la UBA
    (donde se formó). En mobile (<760px) la misma distinción se hace con grilla 2x2 + el
    último ítem a ancho completo. Si se agrega un logo, va del lado que corresponda.
  - El fondo navy de la UBA es su marca oficial: se le da `border-radius` (`--chip`)
    para que lea como insignia, no como bloque suelto.
  - Los logos van **sin** `loading="lazy"` a propósito (están casi en el pliegue y
    pesan poco; diferirlos causaba pop-in) y con `width`/`height` explícitos.
  - M.N. 86.498 no está en la franja a propósito: ya figura en el footer legal.
  - **Los 5 ítems son `<a>`** (pestaña nueva, `rel="noopener"`), con URLs verificadas
    HTTP 200. **Lyftogt es `lyftogtmed.com` — `lyftogt.com` NO resuelve**, y `lyftogtmed`
    es además lo que dice el propio wordmark del logo. La Escuela de PIT queda **sin
    enlazar** hasta tener su URL real: no inventar una. `.v2-trust-item` lleva
    `color: inherit` porque al pasar a `<a>` heredaba el azul de link.
  - En la home el rótulo dice "respaldadas por"; en Sobre el Dr. Frusso dice **"Donde
    ejerce, enseña y se formó"**. Dentro de la biografía el rótulo tiene que describir el
    vínculo, porque la Escuela de PIT no lo respalda desde afuera — es de él.
  - El CSS de la franja vive en `pit-v2.css` (para que cualquier subpágina lo herede) +
    la copia inline de `index.html`.
- **Escuela de PIT:** Ricardo la fundó, no lo respalda desde afuera. La credencial dice
  "Fundador · Formación en PIT" con un comentario en el HTML para que no se "corrija" de
  vuelta. Figura en tres lugares de Sobre el Dr. Frusso: párrafo de bio, chip azul
  (**el azul marca roles PIT, el gris credenciales académicas**) e hito en la trayectoria.
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
- **Tres pilares en "Qué es PIT"** (entre "Para pacientes" y "Para profesionales"):
  seguridad / efectividad / sin fármacos, el encuadre que usa lyftogtmed.com (la
  organización del creador del método). **Redactado de cero — no hay una frase copiada**,
  por derechos y porque el texto ajeno no tiene la voz del sitio. Tres decisiones
  editoriales que hay que sostener si se reescribe:
  - La fuente habla de "resolución completa" del dolor; acá dice "el objetivo es que el
    dolor deje de volver" + que depende del caso. Misma intención sin que la web de
    Ricardo prometa un resultado.
  - **No se incluye la duración del alivio inicial** (la fuente dice 4 horas a 4 días):
    es el único dato que promete un resultado medible y Ricardo no lo confirmó. Queda
    como placeholder al pie.
  - Sí se mantienen los anclajes técnicos (glucosa al 5%, pH 7.4, aguja de media
    pulgada): son hechos del método, no afirmaciones del consultorio.
- **"6 a 8 sesiones" es la cifra ÚNICA del sitio.** Había tres distintas (4-6 en el módulo
  de patologías, 4 a 8 en FAQ/diccionario/qué-es-pit, 4-8 en el prompt del asistente, o sea
  que el bot contestaba otra cosa). Unificada en los 9 lugares, **incluido el prompt de
  sistema en `api/chat.js`** — si se cambia, se cambia ahí también o el asistente vuelve a
  contradecir a la página. Los valores por patología ya no diferencian entre pestañas
  (no venían de ninguna fuente); la duración de sesión sí sigue variando. Si Ricardo tiene
  rangos reales por región, se cambian ahí.
- **Grafo de conocimiento** del proyecto en `../graphify-out/` (graph.html, GRAPH_REPORT.md).
- **Toggle ES/EN** (`assets/js/pit-lang.js`): markup estático (viene en el HTML desde
  `_build/nav.js`, no se inyecta por JS) — antes causaba un "pop-in" visible y corría
  el riesgo de quedar visible fuera de sync con el resto del nav en mobile.
- **Nav sin wrap**: `white-space: nowrap` en logo/links/CTA/toggle — el texto nunca se
  parte ni se comprime. Breakpoint a hamburguesa en **1180px**, calculado como el ancho
  mínimo real medido (con nowrap) + margen. Si se agrega/saca un ítem del nav, remedir
  con `nav.style.width='fit-content'` en devtools y ajustar el `@media` en
  `assets/css/pit-v2.css` + `index.html` (ambos deben quedar iguales).
- **CTA del menú móvil — `:not(.v2-btn)` es obligatorio.** `.v2-drawer a` fijaba
  `color: var(--v2-navy)` con especificidad (0,2,0) y le ganaba al blanco de
  `.v2-btn--navy` (0,1,0): "Apuntes gratis" quedaba navy sobre navy, contraste 1.00, texto
  literalmente invisible. El selector y su `::before` llevan `:not(.v2-btn)` en las dos
  copias. Verificado en 19.17:1, y la numeración 01-07 sigue apareciendo solo en los links.
- **Área segura del dispositivo**: los tres controles fijos (FAB del asistente, botón
  volver arriba, panel del chat) suman `env(safe-area-inset-bottom/right)`. Sin eso, en un
  iPhone con indicador de gesto (34px de inset) el FAB queda dentro de la zona de swipe del
  sistema. **Cada propiedad va declarada dos veces a propósito**: primero el valor de
  siempre y después el `calc()` con `env()`; un navegador sin soporte descarta la segunda y
  se queda con la primera. Si se dejara solo la versión con `env()`, tiraría la declaración
  entera y el botón se iría al borde superior. El `max-height` del panel también resta el
  inset (si sube conservando su alto, el borde de arriba se mete debajo del nav).
- **Botón "volver arriba"** (`assets/js/pit-scrolltop.js`): aparece al bajar scroll,
  apilado sobre el FAB del asistente IA en todas las páginas (separación 12px, que se
  conserva al aplicarse el inset).
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

## Editar el sitio: siempre el fuente, nunca el HTML de la raíz
Las subpáginas se editan en `_dc-src/cores/*.html` y se rebuildea (`node _build/build.js`).
Editar el HTML de la raíz no sirve: el build lo pisa.

## Herramientas de revisión
En `~/.claude/skills/` hay 7 skills `better-*` instalados (`better-accessibility`,
`better-colors`, `better-interface`, `better-layout`, `better-typography`, `better-ui`,
`better-writing`) además de `graphify`. Las últimas tandas de trabajo salieron de correr
`better-layout` (área segura) y `better-typography` (escala + inputs a 16px).

Hay además una auditoría de contraste/desborde que corre en el navegador. Si se rehace:
tiene que **componer transparencias y detectar `background-image`**, porque `.v2-dark` y el
footer son degradés y una versión ingenua reporta 27 falsos positivos leyendo "blanco sobre
blanco". Estado real del último pase: solo `.v2-testi-ph` queda en 4.09-4.22:1 (piso 4.5).
Quedan ~20 elementos por página sobre degradés que la auditoría no puede evaluar y
necesitan chequeo visual.

## Pendiente
1. **URL de la Escuela de PIT** — es el único de los 5 logos sin enlazar. En cuanto Ricardo
   la pase, se agrega el `<a>` en las dos copias de la franja (home + Sobre el Dr. Frusso).
   No inventar una URL.
2. **Año de fundación de la Escuela de PIT** — hoy dice **2026 por inferencia** (la fundó
   hace poco). Está marcado para confirmar en un comentario del fuente y en el placeholder
   de validación al pie de la trayectoria.
3. **Asistente IA** — **código listo, esperando la key.** Ya está la función
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
4. **Activar Analytics** en Vercel → proyecto pit-web-v2 → pestaña Analytics → Enable.
5. **Contenido de Ricardo** (placeholders marcados en el sitio): 2-3 testimonios reales,
   video de bienvenida del curso + subir el de materiales, preguntas definitivas de las
   autoevaluaciones, textos de los 8 posts del foro, citas de evidencia científica,
   WhatsApp y horarios en Contacto, duración del alivio inicial en los tres pilares, y
   los rangos de sesiones por patología si difieren del 6-8 general.
6. **Traducción de Sobre el Dr. Frusso**: el cuerpo de esa página (bio, trayectoria) no
   tiene NINGUNA cadena en `pit-lang.js`, así que con el toggle en EN queda en español.
   Es previo a los cambios recientes; solo se agregaron las cadenas de componentes ya
   traducidos.
7. **Al final:** mover el dominio drricardofrusso.com a este proyecto en Vercel y
   quitar el `noindex`: **`STAGING = false` en `_build/site.js` + `node _build/build.js`**.
   Es un solo valor — antes había que tocar cinco lugares. Sin downtime, rollback instantáneo.

## Decisiones que NO son bugs
- El h2 gigante de testimonios (129px contra el h1 de 68px) es decisión de diseño.
- Las propiedades físicas (no lógicas) en el CSS: el sitio es ES/EN, sin locale RTL
  planeado.
- El alto de las tarjetas de testimonios hay que reevaluarlo **con el texto real** de
  Ricardo: un testimonio de largo verosímil las lleva de 205px a 390px.

## Documentos para Ricardo
- Propuesta: `E:\PIT\Propuesta Web PIT - Dr Frusso.html` (autocontenido, para mandar).
- Artifacts online: propuesta + calculadora de presupuesto (links en el chat de la sesión).

## Seguridad (para cuando escale)
- `_build/foro.js` **escapa** todo lo que sale del frontmatter y del markdown hacia
  atributos y texto (`esc()`), **valida** el frontmatter contra sus tablas (corta el build
  nombrando archivo y campo, sin generar nada) y **filtra los esquemas** de los links
  (`http`/`https`/`mailto`/anclas/relativos). Lo que motivó el escape no fue un ataque:
  una comilla doble en `titulo` o `resumen` desarmaba el `<head>` de la página entera.
- **Falta**: el cuerpo del markdown sigue sin sanitizar (`mdToHtml()` deja pasar HTML
  crudo dentro de un párrafo). Hoy es seguro porque lo escribe el autor; con contenido
  de terceros hace falta un sanitizador con allowlist, que es otro trabajo.
- El sitio **no tiene CSP** a propósito (mucho CSS y JS inline). Ver README para lo que
  habría que medir antes de escribir una. Sí lleva `X-Content-Type-Options`,
  `Referrer-Policy` y `X-Frame-Options` en `vercel.json`.
- La API key del asistente IA va en variable de entorno de Vercel, nunca en el repo/front.
