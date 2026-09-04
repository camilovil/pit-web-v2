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

---

## Bloque 3 — Sobre el Dr. Frusso

Fuente: `_dc-src/cores/sobre-el-dr-frusso.html` (modo *core*: el build lo
envuelve con el nav y el footer comunes). Los cinco rótulos de la franja de
respaldos ya habían cambiado en el Bloque 2, porque el componente es compartido
con la home.

### Biografía

Se agregó, después de la primera oración: **"Fundador del Área de Medicina
Musculoesquelética dentro del Servicio de Medicina Familiar en ese mismo
hospital."**

| Antes | Después |
|---|---|
| **Fundador** de la Escuela de PIT, desde donde forma a profesionales de la región. | **Miembro Fundador** de la Escuela de PIT, donde forma a profesionales de toda la región junto a sus otros tres fundadores: el Dr. Heno Pigerl y las doctoras María Paz Caruso y María Julia Aparicio. |

| Chip | Antes | Después |
|---|---|---|
| último | Fundador · Escuela de PIT | Miembro Fundador · Escuela de PIT |

### Franja de respaldos: tres filas en vez de una

El rótulo dice "Dónde ejerce, enseña y se formó" y los cinco logos venían en una
fila que no cumplía ese orden. Quedaron así:

| Fila | Logos | Qué dice el rótulo |
|---|---|---|
| 1 | Hospital Italiano | ejerce |
| 2 | Hospital de Clínicas · Escuela de PIT | enseña |
| 3 | UBA · Lyftogtmed | se formó |

Cómo está hecho: se reordenó el **DOM** (no `order` de CSS, que deja el orden de
lectura y el de tabulación distintos de lo que se ve) y se agregó una regla
**local** en el `<style data-page>` de la página, prefijada con
`.v2-trust-strip`. La franja de la home cuelga de `.v2-trust` y no se entera: el
componente base sigue en `assets/css/pit-v2.css` con su copia inline en
`index.html`, y `check-css.js` sigue pasando.

Detalles que hubo que resolver:

- `pit-v2.css` hace que el **último** logo ocupe el ancho completo abajo de
  640px (en la home quedan 2 columnas y sobra uno). Acá son filas de 1-2-2, no
  sobra ninguno, así que la regla local lo devuelve a `grid-column: auto`.
- El **separador vertical** se sacó de esta página: separaba "ejerce" de "se
  formó" en la fila única, y ahora ese corte lo hace el salto de fila.

Medido después del cambio, en 1280px y en 375px: las tres filas en el orden
pedido, los cinco rótulos a dos líneas exactas y sin scroll horizontal. La
franja de la home, verificada aparte, sigue en 2-2-1 como estaba.

### Trayectoria

| Año | Antes | Después |
|---|---|---|
| 2026 | Funda la Escuela de PIT — Su propia escuela de formación en el método, para profesionales de la salud de la región. | Funda **en conjunto** la Escuela de PIT — Junto al Dr. Pigerl y las doctoras Caruso y Aparicio, inauguran su propia escuela de formación en el método, para profesionales de la salud de toda la región. |
| Hoy | Consultorio en Belgrano + docencia online — Atención de pacientes, foro semanal y cursos para profesionales. | Hospital Italiano, consultorio en Belgrano, docencia y divulgación — Atención de pacientes, formación de profesionales y divulgación de la técnica a través de medios digitales. |

### Decisiones propias (revisar)

1. **"junto a sus otros tres fundadores: el Dr. Heno Pigerl…"** va con "el" en
   minúscula. El documento lo escribió con mayúscula por empezar renglón; en
   texto corrido, después de dos puntos, corresponde minúscula.
2. **El separador de la franja se sacó solo en esta página.** En la home sigue,
   porque ahí la fila es única y el separador es lo que distingue "ejerce" de
   "se formó".

### Fuera de alcance en este bloque

- **Universidad de Wisconsin y Medicina Narrativa** (pendiente de Ricardo): el
  documento las sugiere como credenciales a sumar, pero no hay título, año ni
  tipo de formación para escribirlas. Cuando lleguen, el lugar natural son los
  chips de la biografía y una fila más en Trayectoria.
- **El año 2026 de la fundación de la Escuela** sigue siendo una inferencia
  anterior a estas correcciones: el comentario del código que lo avisa quedó en
  su lugar, y el placeholder del pie de Trayectoria también.

---

## Bloque 4 — Qué es PIT

Fuente: `_dc-src/Que es PIT.dc.html` (modo *raw*). Es la página donde el
documento dejó más cosas a medio escribir, así que va última: se aplicó todo lo
que tenía texto y quedó anotado lo que falta.

### Para pacientes

| Antes | Después |
|---|---|
| …se volvió hipersensible, y **dispara dolor** aunque el tejido esté sano. | …se volvió hipersensible, y **envía señales de dolor** aunque el tejido esté sano. |
| …pequeñas inyecciones **debajo de la piel de glucosa al 5%** — | …pequeñas inyecciones **de glucosa al 5% debajo de la piel** — |

### Cómo es una sesión: los cuatro pasos, reescritos

Reescritos contra la página 7 de los **Apuntes de PIT**, que es el material que
la propia página ofrece descargar. La sesión ahora empieza donde empieza de
verdad: en la conversación.

| # | Antes | Después |
|---|---|---|
| 01 | Evaluación y mapeo | Conversación con el paciente (anamnesis) |
| 02 | Inyecciones subcutáneas | Identificación de la zona de dolor |
| 03 | Verificación del efecto | Breve examen físico |
| 04 | Plan de tratamiento | Inyecciones subcutáneas |

**Lo que salía de acá no se perdió**, que era el riesgo: la verificación del
alivio en la misma consulta como criterio diagnóstico sigue en el bloque de
profesionales de esta misma página, y las 6-8 sesiones están en el segundo
pilar de más abajo y en el módulo de patologías de la home.

**Alineación:** con los títulos nuevos, dos ocupan dos líneas y dos una sola, y
los párrafos arrancaban 23px más abajo en la mitad de las tarjetas. Se agregó
una regla local (`.pit-pasos h4 { min-height: 2.6em }`) arriba de 820px, que es
el breakpoint donde `.m-stack` todavía no apila. Medido: los cuatro párrafos
arrancan a la misma altura en 1280px, y apilado en 375px no queda hueco.

### Tres pilares

| Antes | Después |
|---|---|
| *(eyebrow)* Por qué es distinto | Un procedimiento innovador |
| Tres cosas que conviene saber antes de empezar. | Tres aspectos que marcan la diferencia. |
| Lo que se inyecta ya está en el hospital | Dextrosa y agua, dos compuestos naturales unidos para aliviar el nervio |
| El alivio se construye, no aparece de golpe | El alivio duradero se construye |
| No lleva corticoides ni analgésicos | Sin corticoides, sin analgésicos |

El cuerpo del **primer** pilar se reescribió entero con el texto del documento
(dextrosa diluida en agua purificada, aguja ultrafina, sentado o acostado). Los
cuerpos del segundo y del tercero **quedaron como estaban**: el documento los
marca para reformular pero no dejó el texto.

### Apuntes

| Antes | Después |
|---|---|
| Apuntes de PIT — 80 páginas, gratis | Apuntes de PIT — 80 páginas (gratis) |

### Decisiones propias (revisar)

1. **«puntos de Valleix», no "Puntos de Valleyx".** El documento lo escribió con
   *y* y entre comillas latinas dobles; el apellido es **Valleix** y así figura
   ya en el bloque de profesionales de esta misma página.
2. **"diluida" sin tilde** (el documento traía "diluída") y se cerró el
   paréntesis que quedaba abierto en el paso 04.
3. **El paso 01 conserva "(anamnesis)"** tal como lo escribió el documento,
   aunque sea el único término técnico de una sección dirigida a pacientes.
4. **Aparece "dextrosa" donde el resto del sitio dice "glucosa al 5%".** Es lo
   que pide el documento en los dos lugares nuevos (paso 04 y primer pilar),
   pero ahora la misma página usa las dos palabras: "glucosa al 5%" en los
   párrafos de arriba y en el bloque de profesionales, "dextrosa" en los de
   abajo. Son lo mismo, pero conviene unificar en una pasada aparte.
5. **El comentario del código de la sección** enumeraba los datos técnicos que
   traían los pilares (incluida la aguja de media pulgada, que ya no aparece en
   ninguno): se actualizó para que siga describiendo lo que hay.

---

# Lo que quedó pendiente

## Falta el texto (el documento marcó "reformular" y dejó el reemplazo vacío)

| Página | Qué |
|---|---|
| Home | Descripciones de **Rodilla**, **Cervical** y **Hombro** |
| Qué es PIT | **H1** ("El dolor crónico se trata donde nace: en el nervio.") |
| Qué es PIT | **Lead** (incluye reformular "mínimamente invasivo" y reemplazar "Elegí tu camino: la misma técnica, explicada para vos") |
| Qué es PIT | Cuerpo del pilar **"El alivio duradero se construye"** |
| Qué es PIT | Cuerpo del pilar **"Sin corticoides, sin analgésicos"** |
| Qué es PIT | **"El mecanismo, con el rigor que esperás."** y los dos párrafos del bloque de profesionales (uno de ellos pide sumar pasos de la página 7 de los Apuntes) |

## Hay que confirmarlo con Ricardo

| Página | Qué |
|---|---|
| Home | **Sesiones típicas y duración** de las cuatro regiones (6-8 sesiones, 15-30 min) |
| Foro | La **promesa semanal**: "Cada semana, una respuesta." y el párrafo que la desarrolla |
| Sobre el Dr. Frusso | Credenciales de **Universidad de Wisconsin** y **Medicina Narrativa** (falta título, año y tipo de formación) |
| Sobre el Dr. Frusso | **Año de fundación** de la Escuela de PIT (el 2026 sigue siendo una inferencia previa) |

## Anotado para más adelante

- **Testimonios filmados de pacientes** en la sección "Para pacientes" de la
  home. Hoy los cuatro testimonios son placeholders marcados "A validar con
  Ricardo".
- **Desarrollar los tres pilares de Qué es PIT.** El documento lo pide
  explícitamente: "Me gustaría dedicarle más tiempo a toda esta sección más
  adelante".
- **Unificar "glucosa al 5%" / "dextrosa al 5%"** en todo el sitio.
- **`<title>`, `og:title`, `twitter:title` y la `meta description` de la home**,
  que todavía dicen "Aliviar el dolor crónico desde el nervio" y "mínimamente
  invasivo".
- **El footer de las dos páginas *raw*** (Qué es PIT y Curso Módulo I), que está
  más viejo que el compartido: le falta el Instagram de la Escuela de PIT.

---

# Seguimiento — lo que vino después del PR #3

Cuatro cambios más, cada uno en su propio commit y su propio PR, mergeados a
`main` en este orden. Mismo criterio de siempre: para volver atrás uno solo,

```
git revert <hash del commit>
node _build/build.js
```

| # | Qué | Commit | Merge |
|---|---|---|---|
| [#6](https://github.com/camilovil/pit-web-v2/pull/6) | El título de la home | `8d3217d` | `6681efa` |
| [#4](https://github.com/camilovil/pit-web-v2/pull/4) | Dextrosa al 5% | `30f2617` | `2b8266c` |
| [#5](https://github.com/camilovil/pit-web-v2/pull/5) | El foro en la home | `9506f54` | `d0503c8` |
| [#7](https://github.com/camilovil/pit-web-v2/pull/7) | Los cursos del NOA | `21eb886` | `ff69161` |

Antes de estos cuatro hubo un quinto arreglo, `6622cb7`, sobre el propio PR #3:
la dirección del consultorio no se traducía al inglés. Está contado abajo del
todo, en "La dirección del consultorio".

---

## #6 · El título de la home

El Bloque 2 cambió el H1 a "Tratar el dolor desde el nervio" pero yo dejé el
`<title>` y los títulos sociales con el texto viejo, argumentando SEO. Camilo
corrigió la decisión: la pestaña del navegador y la tarjeta que se ve al
compartir el link son copy visible, y tenían que decir lo mismo que la página.

| Etiqueta | Antes | Después |
|---|---|---|
| `<title>` | PIT · **Aliviar el dolor crónico** desde el nervio — Dr. Ricardo D. Frusso | PIT · **Tratar el dolor** desde el nervio — Dr. Ricardo D. Frusso |
| `og:title` / `twitter:title` | PIT · Aliviar el dolor crónico desde el nervio — Dr. Frusso | PIT · Tratar el dolor desde el nervio — Dr. Frusso |
| `description` | Tratamiento **mínimamente invasivo** del dolor crónico… | Tratamiento del dolor crónico que actúa desde el nervio, donde nace… |

La `description` todavía arrastraba "mínimamente invasivo", que el hero ya no
decía desde el Bloque 2.

---

## #4 · Dextrosa al 5%, aclarando glucosa

El Bloque 4 trajo "dextrosa" en los dos textos nuevos de Qué es PIT mientras el
resto del sitio decía "glucosa al 5%". Son la misma sustancia, pero la misma
página usaba las dos palabras. Camilo definió el criterio: **poner dextrosa y
aclarar glucosa**.

Queda "dextrosa al 5%" en todo lo que describe lo que se inyecta, con
"(glucosa)" en la **primera mención de cada página**:

| Página | Dónde aclara |
|---|---|
| Home | Panel de Lumbalgia (la pestaña que abre por defecto) |
| Qué es PIT | Párrafo de pacientes |
| FAQ | Respuesta sobre efectos secundarios |
| Foro · corticoides | "Qué puede aportar PIT en este caso" |

La FAQ de la home no repite la aclaración porque el panel de arriba ya la dio;
la de `faq.html` sí, porque ahí la pregunta se lee sola. Son dos claves
distintas del diccionario a propósito.

**Lo que no se tocó:** las referencias a la literatura. Los tres estudios de
Evidencia y el post sobre la revisión sistemática siguen diciendo "glucosa
perineural", que es como se publican y como se buscan. La aclaración de la
primera mención es el puente entre las dos palabras. En el bloque de
profesionales, además, dextrosa es el término de la fuente: los trabajos de
Lyftogt dicen "5% dextrose".

---

## #5 · Las últimas publicaciones del foro en la home

La sección de contenido gratuito prometía "el foro semanal" y enlazaba al foro,
pero no mostraba una sola publicación. Ahora cierra con las tres últimas —
fecha, categoría, audiencia y título, con las mismas columnas que el archivo de
`foro.html`.

**Se genera, no se escribe a mano.** Un bloque a mano en `index.html` queda
viejo el primer lunes y nadie se entera. `_build/sync-foro-home.js` lo escribe
entre `<!-- PIT-FORO-HOME:START/END -->` desde `_content/foro/*.md`: publicar un
post ya lo pone en la home.

Para leer los mismos `.md` desde dos lugares hubo que sacar el parser de
`foro.js`, que es un generador — requerirlo regenera el foro entero. El parser
del frontmatter, las tablas de categoría/audiencia y el `esc` pasaron a
**`_build/foro-posts.js`**, fuente única. La alternativa era copiar el parser,
que es el mismo error que el repo ya paga con las dos copias del CSS. Se
verificó que la salida del foro quedó **byte a byte idéntica** después del
refactor.

Las filas reusan las cadenas exactas del archivo del foro, así que se traducen
al inglés sin una clave nueva por post. La excepción es el post más nuevo: en
`foro.html` es el destacado y arma su línea de otra forma, así que su clave
`Sxx · dd mmm` hay que agregarla a mano esa semana.

---

## #7 · Los tres cursos del NOA

La home no anunciaba en ningún lado los cursos presenciales. Ahora hay un
carrusel deslizable con los tres próximos, justo arriba de la sección del
Módulo I: quedan juntas las dos formaciones, primero las presenciales con fecha
y después el curso online.

**Los cursos son publicaciones del foro.** Un post con los campos `evento*` en
el frontmatter es el anuncio de un curso: sale en el carrusel y la tarjeta lleva
a ese mismo artículo. Una sola fuente, así la fecha de la tarjeta no puede
contradecir a la del artículo. `foro.js` exige el juego completo de campos o
ninguno y corta el build nombrando cuáles faltan.

| Curso | Fecha | Artículo |
|---|---|---|
| Salta · miembros inferiores | Vie 04/09 · 14 a 20 hs | `foro/curso-salta-miembros-inferiores.html` |
| Jujuy · zona dorso-lumbar | Sáb 05/09 · 08:30 a 13:00 hs | `foro/curso-jujuy-dorso-lumbar.html` |
| Tucumán · cabeza, cuello y hombro | Mar 08/09 · 08:30 a 15:00 hs | `foro/curso-tucuman-cabeza-cuello-hombro.html` |

Cada uno con el temario de cinco módulos y los datos de inscripción de su
banner. Los textos de Jujuy y Tucumán son los de Ricardo, en primera persona.

**Revisar:** el de Salta no tenía texto — en el documento solo se lo menciona
como "el banner pasado". Se armó con el copy de su propio carrusel
(`salta-02` a `salta-05`), así que es el único de los tres sin texto original
de Ricardo.

**Dos efectos secundarios que conviene tener presentes:** como los cursos son
las publicaciones más recientes, el destacado de `foro.html` pasó a ser el de
Tucumán; y los cursos se excluyen del bloque "lo último del foro", porque si no
las tarjetas de abajo mostraban lo mismo que el carrusel de arriba.

### El carrusel

Scroll-snap nativo, sin librería: si el JS no corre, el bloque igual se desliza
con el dedo, con la rueda y con el tabulador. El script solo agrega los botones
y los puntitos. Cada tarjeta lleva el color de su banner en `--acento`.

Dos bugs propios corregidos al mirarlo en el navegador: `ir()` pasaba
`behavior: 'smooth'` explícito, lo que **pisaba el `prefers-reduced-motion`**
que el CSS ya respeta; y la posición se calculaba con `offsetLeft`, que daba
4px corridos por el margen negativo del track y solo lo tapaba el snap.

### Orden y retiro

Se ordenan por `eventoFecha` ascendente, el más próximo primero. **No se filtra
por la fecha de hoy** a propósito: el HTML se commitea, y un filtro por
`new Date()` haría que el sitio cambiara solo según el día en que alguien
corriera el build, con diffs que aparecen sin que nadie toque nada. Para retirar
un curso pasado, sacale los campos `evento*` al post (el artículo queda
publicado) o borralo.

---

## La dirección del consultorio (`6622cb7`)

Copilot marcó en la revisión del PR #3 que el prefijo "Consultorio:" que agregó
el Bloque 2 quedaba en español con el sitio en inglés. La dirección nunca tuvo
clave porque es un domicilio y no se traduce, pero la etiqueta que ahora la
encabeza sí:

```js
'Consultorio: Amenabar 2446, Belgrano, CABA': 'Practice: Amenabar 2446, Belgrano, CABA',
```

Va la línea entera y no la etiqueta suelta porque `apply()` traduce por nodo de
texto completo, y hoy etiqueta y dirección son un solo nodo dentro del mismo
`<span>`.

---

# Lo que sigue pendiente

Sin cambios respecto de lo que quedó abierto en el PR #3 (ver arriba, "Lo que
quedó pendiente"), menos dos que se cerraron: el título de la home y la
inconsistencia glucosa/dextrosa.

Y uno nuevo, de diseño y no de código: en el material del NOA, Camilo anotó que
en los banners conviene **cambiar la imagen de la zona del cuerpo manteniendo la
estética que grafica el dolor de los nervios y no el de los huesos** — Ricardo
insiste en referir al dolor neuropático y correrse del gráfico tradicional de
dolor óseo. Es trabajo sobre las piezas de Instagram, no sobre el sitio.

---

## #9 · Contraste de las tarjetas de curso y foto al costado

Commit `9a088a8` · merge `ce101b6` — el commit suelto es el que hay que
revertir si se quiere volver atras solo este cambio.

### El bug que reportó la captura

En la tarjeta del curso faltaban el título y los cuatro valores: se veían el
chip de la ciudad, el tema, los rótulos y el "Ver el curso", y el resto en
blanco. El patrón no era casual — lo que desapareció son **exactamente los dos
únicos elementos que heredaban el color** de `.v2-curso` en vez de declararlo.
Un color heredado a través de un cambio de fondo es justo lo que rompen las
extensiones de tema del navegador.

En mi navegador computaba blanco sobre navy, así que no lo iba a encontrar
mirando: lo delató el patrón de cuáles faltaban. Ahora el título y los valores
declaran su color, como ya hacían sus vecinos.

**Regla para el futuro:** dentro de un bloque que cambia el fondo (las tarjetas
navy, la sección `.v2-dark`), cada elemento con texto declara su color. No se
deja colgado de la herencia.

### El contraste, medido sobre `#000B33`

| Elemento | Antes | | Después | |
|---|---|---|---|---|
| Rótulos (11px mayúsculas) | `rgba(255,255,255,0.45)` | **4.44:1 — falla** | `0.62` | 7.54:1 |
| Tema | `0.55` | 6.11:1 | `0.62` | 7.54:1 |
| Título y valores | heredado | — | `#FFFFFF` declarado | 19.17:1 |

El mínimo para texto normal es 4.5:1.

### La foto de la región

Sale de la **`portada` del propio post**, que ya es obligatoria para todos y ya
corresponde a la zona que trata el curso: rodilla para Salta, lumbar para
Jujuy, cuello para Tucumán. Un curso nuevo trae su imagen sin agregar un solo
campo al frontmatter.

Va con `alt=""` porque es decorativa: está dentro de un enlace que ya dice
ciudad, tema, título, fecha, lugar y modalidad, y repetirlo en el alt solo se lo
haría escuchar dos veces a quien usa lector de pantalla.

La tarjeta pasó de flex a grid de dos columnas y el padding se mudó de la
tarjeta a `.v2-curso-cuerpo`, para que la foto vaya a sangre. Abajo de 1020px
la columna de la foto dejaba el título en cuatro líneas, así que ahí la foto
pasa arriba a lo ancho y el texto abajo.

### Anotado

`DSC_knee01.webp` mide 412×515 y en la tarjeta se dibuja a 378×547: se agranda
un 6%. Es imperceptible en pantalla normal, pero si en algún momento se quieren
las tarjetas más nítidas en pantallas retina, el arreglo es una imagen de origen
más grande — no hay nada que tocar en el código.

---

## #11 · Los flyers del NOA en los artículos

Commit `79e582e` · merge `580f367`.

Los tres cursos tenían como imagen una foto genérica del sitio. Ahora usan sus
propias piezas: las 15 imágenes del NOA entran al repo como webp — **de 10,8 MB
de PNG a 1 MB** — en `img/cursos/`.

| Dónde | Qué imagen |
|---|---|
| `portada` del post | El **flyer** del curso (`<ciudad>-aviso.webp`) |
| Cuerpo del artículo | **"El carrusel del curso"**: las 5 piezas en galería deslizable |
| Tarjeta de la home | La **banda anatómica** recortada del carrusel-01 (`<ciudad>-nervios.webp`) |

### Por qué la tarjeta de la home no lleva el flyer

La tarjeta ya dice ciudad, tema, título, fecha, lugar y modalidad **en texto**.
Poner al lado el flyer, que repite todo eso quemado dentro de la imagen, era
decirlo dos veces. El recorte de la banda anatómica es la única de las cinco
piezas sin texto encima, y además es la estética que pide Ricardo: el dolor
graficado en los nervios y no en los huesos.

De paso, el recorte mide 1080×520 y se dibuja a 378×398, así que también cierra
el pendiente del 6% de agrandamiento que tenía la foto de Salta.

### El bloque `[[carrusel: …]]`

Nuevo en el markdown del foro: `[[carrusel: /img/a.webp | /img/b.webp | …]]`
renderiza una galería deslizable de piezas 4:5.

Las piezas van con `alt=""` y un rótulo que aclara qué son. **El artículo nunca
depende de ellas para decir algo**: llevan su texto quemado en la imagen, y todo
lo que cuentan ya está escrito arriba en texto de verdad. Es una galería, no una
fuente de información.

### Dos desbordes horizontales que aparecieron midiendo

**Uno era mío.** Las piezas tenían ancho `min(300px, 72vw)`. El `vw` se
retroalimenta: si algo desborda, el ancho del viewport crece, las piezas crecen
con él y desbordan más. Pasan a % del track.

**El otro es viejo y estaba latente.** El `<article>` de los posts es un item de
grid (`.m-stack`) con el `min-width: auto` que traen los items por defecto: un
hijo ancho lo estira hasta su propio ancho y empuja el ancho de **toda la
página** en mobile, en vez de scrollear adentro de sí mismo. Con la galería, la
página se iba a 721px sobre un viewport de 375. Va `min-width: 0`, que además
deja cubierto el próximo hijo ancho que aparezca — una tabla, un bloque de
código.

### Un extra

Ya que la `portada` empezó a valer para algo más que la tarjeta del destacado,
**`og:image` de cada publicación pasa a ser su portada** en vez de la imagen
genérica del sitio. Compartir el link de un curso ahora muestra su flyer.

### Verificación

375px y 1280px, y las ocho páginas principales barridas a 375 buscando
desbordes: ninguna.
