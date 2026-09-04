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
