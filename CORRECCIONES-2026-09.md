# Correcciones de copy — septiembre 2026

Aplicación de `correcion web pit.txt` (revisión de textos recibida el 2026-09-04).

**Cómo volver atrás.** Un commit por bloque, en orden. Para revertir un bloque
suelto sin tocar los demás:

```
git revert <hash-del-bloque>
node _build/build.js
```

Si el bloque revertido tocó una fuente de `_dc-src/` o `_build/foro.js`, el
`git revert` deshace la fuente **y** el HTML construido (los dos están
versionados), así que el rebuild solo confirma que quedaron idénticos.

**Marcas del documento original**

| Marca | Significado | Qué se hizo |
|---|---|---|
| ✔️ | corrección cerrada, con texto exacto | aplicada |
| ✍️ | el revisor marcó "reformular" pero dejó el texto vacío | **no aplicada** — falta el texto |
| 👨‍⚕️ | hay que confirmarlo con Ricardo (dato clínico o factual) | **no aplicada** — falta el dato |

---

## Bloque 1 — Evidencia · Foro · Curso Módulo I

Páginas chicas y de texto cerrado. Va primero para validar el circuito
completo (fuente → `node _build/build.js` → diccionario ES/EN → HTML).

### Evidencia (`_dc-src/cores/evidencia.html`)

| Antes | Después |
|---|---|
| Qué dice la literatura — y qué dice la clínica. | Bibliografía médica y experiencia clínica. |
| Cada referencia viene acompañada de la lectura clínica del Dr. Frusso: qué aporta el estudio, cuáles son sus límites, y cómo se traduce (o no) al consultorio. Sin sobrevender. | Cada referencia viene acompañada de la lectura clínica del Dr. Frusso. |
| La evidencia sobre PIT es creciente pero heterogénea. Esta página presenta estudios seleccionados con su contexto — no constituye una revisión sistemática. | Esta sección recopila investigaciones clave para entender el tema en su contexto, pero no pretende ser un análisis exhaustivo de toda la literatura científica disponible. |

Decisión propia: el título nuevo conserva el punto final, como el resto de los
títulos de sección del sitio ("Cada semana, una respuesta.").

### Foro (`_build/foro.js`, plantilla del portal)

| Antes | Después |
|---|---|
| El Dr. Frusso selecciona y responde preguntas cada semana. **Todas se revisan antes de publicarse y** se publican sin nombre ni datos personales. Dejá tu email… | El Dr. Frusso selecciona y responde preguntas cada semana. Se publican sin nombre ni datos personales. Dejá tu email… |
| Chips: Sin registro · Anónimas · **Moderadas** | Sin registro · Anónimas |
| …tratamientos previos), **mejor la respuesta**. | …tratamientos previos), **más completa podrá ser la respuesta**. |

El placeholder del textarea cambia en los dos atributos (`placeholder` y
`data-ph-paciente`); el de profesionales no se tocó.

### Curso Módulo I (`_dc-src/Curso Modulo I.dc.html`)

| Antes | Después |
|---|---|
| no hace falta formación previa en **proloterapia**. | no hace falta formación previa en **neuroproloterapia**. |

Decisión propia entre las dos opciones que ofrecía el documento ("en la técnica"
o "en neuroproloterapia"): neuroproloterapia es el nombre que el sitio ya usa
para PIT, así que la frase queda literal y sin introducir un término nuevo.

### Diccionario ES/EN (`assets/js/pit-lang.js`)

Cuatro claves movidas junto al copy: se reescribieron tres y se eliminó
`'Moderadas'` (quedaba huérfana al sacar el chip). `check-lang.js` pasa:
312 claves, 460 cadenas visibles.

### Fuera de alcance en este bloque

- **Foro — "Cada semana, una respuesta." y el párrafo de abajo** (👨‍⚕️): el
  documento pide acordar la promesa semanal con Ricardo antes de tocarla.
  Quedan como están.

---

## Bloque 2 — Home (y la franja de respaldos, que es compartida)

`index.html` es manual: se edita directo. Dos cosas de este bloque salen del
alcance de la home porque el componente es compartido, y se avisa acá para que
no sorprenda en el diff:

- **La franja de respaldos** aparece igual en la home y en Sobre el Dr. Frusso.
  El documento pide los mismos cinco rótulos en las dos, así que se cambian de
  una en las dos fuentes. El resto de Sobre va en el Bloque 3.
- **El footer** vive en cinco fuentes (`index.html`, `_build/convert.js`,
  `_build/foro.js` y las dos `.dc.html` de modo *raw*). El claim y la dirección
  cambian en las 18 páginas.

### Hero

| Antes | Después |
|---|---|
| Aliviar el dolor crónico desde el nervio | Tratar el dolor desde el nervio |
| PIT es un tratamiento **mínimamente invasivo** que actúa donde nace el dolor. El alivio suele sentirse desde la primera sesión, **sin interferir con otros tratamientos en curso**. | PIT es un tratamiento que actúa donde nace el dolor. El alivio suele sentirse desde la primera sesión. **Su creador es el Dr. John Lyftogt.** |

### Franja de respaldos (home + Sobre el Dr. Frusso)

| Logo | Antes | Después |
|---|---|---|
| Hospital Italiano | Práctica clínica · 30+ años | *(sin cambios)* |
| Hospital de Clínicas | Área de dolor · Cursos PIT | Centro del Dolor · Instructor en PIT |
| Lyftogtmed | Instructor autorizado | Instructor autorizado · Discípulo directo |
| Escuela de PIT | Fundador · Formación en PIT | Miembro Fundador · Instructor en PIT |
| UBA | Formación · 1992 | Formación universitaria · 1992 |

### Bifurcación

| Antes | Después |
|---|---|
| *(eyebrow)* ¿Quién sos? | *(eliminado)* |
| La misma técnica, explicada para vos | La misma técnica, explicada **específicamente** para vos |
| Entendé por qué persiste tu dolor, cómo funciona PIT y si tiene sentido para tu caso — en lenguaje claro. | Entendé por qué podría estar persistiendo tu dolor y cómo funciona PIT frente al mismo. |

### Qué trata PIT

| Antes | Después |
|---|---|
| Elegí dónde te duele | Elegí una opción |
| **Lumbalgia crónica.** Se mapean por palpación… glucosa al 5%. **Es la región con la que abre el Módulo I del curso.** | **Lumbalgia crónica.** **Dolor persistente en la parte baja de la espalda.** Se mapean por palpación… glucosa al 5%. |

La descripción de lumbalgia está duplicada en la página (el HTML del panel y el
objeto `PAT` del script que alimenta las pestañas): se cambiaron las dos.

### Sección del curso

Se agregó la etiqueta **Para profesionales** arriba del eyebrow "¿Querés
profundizar?". Va como píldora con borde, en estilos inline: un selector nuevo
solo en `index.html` haría ruido en `check-css.js`, que compara los 76
selectores compartidos entre `index.html` y `pit-v2.css`.

### Footer (las 18 páginas)

| Antes | Después |
|---|---|
| Tratamiento del dolor crónico, desde el nervio, en cada etapa | Tratamiento del dolor crónico: de la inyección subcutánea al resultado profundo |
| email → IG Frusso → IG Escuela → **Amenabar 2446, Belgrano, CABA** | email → **Consultorio: Amenabar 2446, Belgrano, CABA** → IG Frusso → IG Escuela |

### Decisiones propias (revisar)

1. **"Instructor autorizado (discípulo directo del Dr. John Lyftogt)"** quedó
   como **"Instructor autorizado · Discípulo directo"**. El texto completo son
   61 caracteres en un `<small>` de 190px, mono 11px en mayúsculas: son cuatro
   líneas contra las dos del resto de la franja. Además el logo que está justo
   arriba es el wordmark de Lyftogt, así que nombrarlo otra vez es redundante.
   Medido con la versión corta: los cinco rótulos ocupan exactamente dos líneas
   y 190px, la franja quedó más pareja que antes.
2. **El claim del footer va en una línea y con "de" en minúscula.** El documento
   lo escribió en dos renglones. Un `<br>` parte el texto en dos nodos y obliga
   a partir también la clave del diccionario ES/EN; y con el texto corrido, la
   mayúscula después de dos puntos se lee como error de tipeo.
3. **`<title>`, `og:title` y `twitter:title` NO se tocaron.** Siguen diciendo
   "Aliviar el dolor crónico desde el nervio". El documento revisó el copy
   visible, no el SEO, y ahí "dolor crónico" es la búsqueda que trae gente. Sí
   se actualizaron `og:description` y `twitter:description`, que eran copia
   literal del subtítulo del hero y habrían quedado con el texto viejo.
4. **"mínimamente invasivo" se sacó solo de la home.** Sigue en el lead de Qué
   es PIT, porque ahí el documento pide reformular el concepto entero ("acorde
   a la Medicina Narrativa") y no dejó el texto. Cuando llegue, conviene
   revisar también la `meta description` de la home, que todavía lo usa.

### Encontrado de paso (no se tocó)

Las dos páginas de modo *raw* (Qué es PIT y Curso Módulo I) tienen su propio
footer, más viejo que el compartido: les falta el enlace al Instagram de la
Escuela de PIT y el del Dr. Frusso figura como "@drfrussoricardo" en vez de
"Instagram del Dr. Frusso · @drfrussoricardo". Es anterior a estas correcciones
y no entra en el alcance del documento.

### Fuera de alcance en este bloque

- **Rodilla, Cervical y Hombro** (pendiente de redacción y de Ricardo): el
  documento pide adaptarlas al paciente pero no dejó el texto, y además marca
  los plazos de las cuatro regiones para confirmar con él.
- **Testimonios filmados de pacientes**: sugerencia explícita "para más adelante
  en el tiempo".
