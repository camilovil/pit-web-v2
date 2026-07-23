# Handoff — Proyecto Web PIT v2

_Última actualización: 2026-07-23_

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
- Generadores: `node _build/convert.js` (páginas desde `_dc-src/`) y
  `node _build/foro.js` (foro desde `_content/foro/*.md`).
- `index.html` y `curso-intro.html` son manuales (el aula del curso intro es una
  app vanilla JS con quizzes + progreso en localStorage).
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
- **Grafo de conocimiento** del proyecto en `../graphify-out/` (graph.html, GRAPH_REPORT.md).

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
