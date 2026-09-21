// PIT — toggle de idioma ES/EN
// Traduce nodos de texto, placeholders y aria-label según el diccionario.
// Persiste en localStorage.
//
// CÓMO SE MANTIENE ESTE ARCHIVO
// El diccionario se REGENERA contra el HTML ya construido, nunca a ojo: la
// traducción se aplica por coincidencia exacta del texto recortado, así que
// cualquier cambio de una coma en el copy deja la clave huérfana y el texto sin
// traducir, sin que nada avise.
//
// Eso ya no se revisa a mano: **`_build/check-lang.js` corre en cada build**
// (`node _build/build.js`) y compara estas claves contra el texto visible de las
// todas las páginas construidas — nodos de texto, `placeholder` y `aria-label`, lo
// mismo que mira `apply()` acá abajo. Si una clave dejó de coincidir, el build
// falla nombrando la clave y su línea. Para correrlo suelto:
//   node _build/check-lang.js
//
// LISTA BLANCA: el comentario RUNTIME
// Las cadenas que solo existen cuando el JS las escribe (widget del chat, botón
// "volver arriba", "Cerrar menú", estado vacío del archivo del foro, errores de
// formulario, opciones de las autoevaluaciones del curso) no están en el HTML
// servido: para el verificador serían huérfanas y no lo son. Van marcadas con
// `// RUNTIME` al final de su línea, y check-lang.js lee esas marcas del fuente.
// Si agregás una cadena que escribe el JS, marcala acá — no hay lista aparte.
//
// DOS TRAMPAS DEL FORMATO (check-lang.js también las vigila)
// 1. Es un objeto literal: una clave repetida NO da error, la última pisa a la
//    anterior en silencio. (Había tres: "Instructor autorizado", "Curso gratis"
//    y "Evidencia científica".)
// 2. El diccionario inverso (REV) se arma dando vuelta este: si dos claves en
//    español comparten la misma traducción al inglés, volver a ES rompe. Cada
//    valor tiene que ser único.
//
// COBERTURA ACTUAL: home, portal del foro, las publicaciones y el chrome
// compartido (nav, footer, asistente) de todas las páginas — completos.
// PENDIENTE: el cuerpo de Qué es PIT, Evidencia, FAQ, Contacto, Sobre el Dr.
// Frusso, Privacidad, Curso Módulo I y el aula de Curso Intro conservan las
// claves que seguían siendo válidas, pero no están cubiertos al 100%.
(function () {
  var DICT = {
    // ── Chrome compartido: nav + drawer (todas las páginas) ───────────────
    'Saltar al contenido': 'Skip to content',
    'Qué es PIT': 'What is PIT',
    'Evidencia': 'Evidence',
    'Sobre el Dr. Frusso': 'About Dr. Frusso',
    'Contenido': 'Content',
    'Foro': 'Forum',
    'Curso': 'Course',
    'Contacto': 'Contact',
    'Descargar apuntes': 'Download the notes',
    'Dr. Ricardo D. Frusso — inicio': 'Dr. Ricardo D. Frusso — home',
    // Los estados que solo existen en runtime (etiquetas que alterna el JS,
    // mensajes de error, estado vacío del archivo) NO aparecen en el HTML
    // servido: al auditar el diccionario contra el HTML construido salen como
    // "huérfanas" y no lo son. Van marcadas con el comentario RUNTIME.
    'Abrir menú': 'Open menu',
    'Cerrar menú': 'Close menu',   // RUNTIME

    // Barra de acciones al pie de cada publicacion del foro.
    'Me gusta': 'Like',
    'No se pudo conectar. Volvé a intentar.': 'Could not connect. Try again.',   // RUNTIME
    'Te gusta': 'Liked',   // RUNTIME
    'Compartir': 'Share',
    'Link copiado': 'Link copied',   // RUNTIME

    // ── Chrome compartido: footer ─────────────────────────────────────────
    'Curso introductorio': 'Introductory course',
    'Evidencia científica': 'Scientific evidence',
    'Curso Módulo I': 'Course · Module I',
    'Foro semanal': 'Weekly forum',
    'Apuntes de PIT': 'PIT study notes',
    'Preguntas frecuentes': 'FAQ',
    'Tratamiento del dolor crónico: de la inyección subcutánea al resultado profundo': 'Chronic pain treatment: from the subcutaneous injection to deep results',
    // La dirección no se traduce (es un domicilio), pero la etiqueta que
    // ahora la encabeza sí: sin esta clave, "Consultorio:" quedaba en
    // español en medio de un footer traducido.
    'Consultorio: Amenabar 2446, Belgrano, CABA': 'Practice: Amenabar 2446, Belgrano, CABA',
    // El texto visible de los dos Instagram es corto; el nombre completo
    // -el que anuncia un lector de pantalla- va en el aria-label, y por eso
    // tiene su propia clave: check-lang mira los aria-label igual que el texto.
    'Instagram del Dr. Frusso': 'Dr. Frusso on Instagram',
    'Instagram de la Escuela de PIT': 'Escuela de PIT on Instagram',
    'Escuela PIT': 'Escuela PIT',
    'Aviso legal': 'Legal notice',
    'Privacidad': 'Privacy',
    'Cookies': 'Cookies',
    'Términos': 'Terms',
    'Preferencias de privacidad': 'Privacy preferences',
    'Aviso de privacidad': 'Privacy notice',
    'Usamos almacenamiento necesario para recordar tus preferencias y likes. Google Maps y YouTube solo se cargan si permitís contenido externo.': 'We use necessary storage to remember your preferences and likes. Google Maps and YouTube load only if you allow external content.',
    'Ver detalles': 'View details',
    'Solo necesario': 'Necessary only',
    'Permitir contenido externo': 'Allow external content',
    'Elegí si querés cargar servicios externos dentro de las páginas. Podés cambiar esta decisión cuando quieras.': 'Choose whether to load external services within pages. You can change this choice at any time.',
    'Funciones necesarias': 'Necessary functions',
    'Idioma, seguridad, likes y tu elección de privacidad. Siempre activas.': 'Language, security, likes, and your privacy choice. Always active.',
    'Contenido externo': 'External content',
    'Mapas de Google y videos de YouTube. Al cargarlos, esos proveedores reciben datos técnicos.': 'Google Maps and YouTube videos. When loaded, those providers receive technical data.',
    'Usar solo lo necesario': 'Use only what is necessary',

    // ── Chrome compartido: asistente IA y botón volver arriba ─────────────
    // El widget del chat lo arma entero pit-chat.js y el botón de volver arriba
    // lo arma pit-scrolltop.js: NINGUNA de estas cadenas está en el HTML
    // servido, todas son RUNTIME.
    'Abrir asistente sobre PIT': 'Open the PIT assistant',   // RUNTIME
    'Cerrar asistente sobre PIT': 'Close the PIT assistant',   // RUNTIME
    'Asistente PIT': 'PIT assistant',   // RUNTIME
    'Preguntale a PIT': 'Ask PIT',   // RUNTIME
    'IA · Respuestas educativas': 'AI · Educational answers',   // RUNTIME
    'No reemplaza una consulta médica': 'Not a substitute for medical advice',   // RUNTIME
    'Cerrar el asistente': 'Close the assistant',   // RUNTIME
    'Conversación con el asistente': 'Conversation with the assistant',   // RUNTIME
    '¿Qué es PIT?': 'What is PIT?',   // RUNTIME
    '¿Cuándo estará disponible el curso?': 'When will the course be available?',   // RUNTIME
    'Hola 👋 Soy el asistente del sitio. Puedo contarte qué es PIT, cómo funciona y qué recursos gratuitos hay. ¿Qué querés saber?': 'Hi 👋 I am the site assistant. I can explain what PIT is, how it works and which free resources are available. What would you like to know?',   // RUNTIME
    'Escribiendo…': 'Typing…',   // RUNTIME
    'El asistente no está disponible por ahora. Podés escribirnos o dejar tu pregunta en el foro, y te respondemos.': 'The assistant is unavailable right now. You can write to us or leave your question in the forum, and we will answer.',   // RUNTIME
    'No pude responder en este momento. Probá de nuevo en unos segundos, o escribinos desde Contacto.': 'I could not answer right now. Try again in a few seconds or contact us through the Contact page.',   // RUNTIME
    'Ir a Contacto': 'Go to Contact',   // RUNTIME
    'Preguntar en el foro': 'Ask in the forum',   // RUNTIME
    'Ir a Contacto →': 'Go to Contact →',   // RUNTIME
    // El otro enlace del asistente, "Preguntar en el foro →", NO va acá: ya
    // tiene su clave más abajo, donde el foro lo usa en HTML de verdad. La
    // misma cadena no puede estar dos veces -la segunda pisa a la primera- y
    // ahí no lleva RUNTIME porque sí está en el HTML servido.
    'Escribí tu pregunta sobre PIT': 'Type your question about PIT',   // RUNTIME
    'Preguntá sobre PIT…': 'Ask about PIT…',   // RUNTIME
    'Volver arriba': 'Back to top',   // RUNTIME

    // ══ HOME ══════════════════════════════════════════════════════════════
    // Hero
    'PIT · Neuroproloterapia · Dr. Ricardo D. Frusso': 'PIT · Neuroprolotherapy · Dr. Ricardo D. Frusso',
    'Tratar el dolor desde el nervio': 'Treating pain at the nerve',
    'PIT es un tratamiento que actúa donde nace el dolor. El alivio suele sentirse desde la primera sesión. Su creador es el Dr. John Lyftogt.': 'PIT is a treatment that acts where pain begins. Relief is usually felt from the first session. It was created by Dr. John Lyftogt.',
    'Pedir una consulta': 'Request a consultation',

    // Franja de respaldos
    'Práctica y formación respaldadas por': 'Practice and training backed by',
    'Práctica clínica · 30+ años': 'Clinical practice · 30+ years',
    'Centro del Dolor · Instructor en PIT': 'Pain Centre · PIT instructor',
    'Instructor autorizado · Discípulo directo': 'Certified instructor · Direct student',
    'Instructor autorizado': 'Certified instructor',
    'Miembro Fundador · Instructor en PIT': 'Founding member · PIT instructor',
    'Formación universitaria · 1992': 'University degree · 1992',

    // Bifurcación
    'La misma técnica, explicada específicamente para vos': 'The same technique, explained specifically for you',
    'Para pacientes': 'For patients',
    'Tengo dolor crónico': 'I live with chronic pain',
    'Entendé por qué podría estar persistiendo tu dolor y cómo funciona PIT frente al mismo.': 'Understand why your pain might be persisting, and how PIT works on it.',
    'Entender mi dolor →': 'Understand my pain →',
    'Para profesionales': 'For professionals',
    'Soy profesional de la salud': 'I am a health professional',
    'Mecanismo de acción, evidencia publicada y técnica — con casos clínicos reales filmados en consultorio.': 'Mechanism of action, published evidence and technique — with real clinical cases filmed in practice.',
    'Conocer la técnica →': 'Learn the technique →',
    'Soy paciente ↓': 'I am a patient ↓',
    'Soy profesional de la salud ↓': 'I am a healthcare professional ↓',

    // Contenido gratuito
    'Contenido gratuito · Sin registro': 'Free content · No sign-up',
    'Aprendé sobre PIT, sin costo': 'Learn about PIT, at no cost',
    'El curso introductorio, los apuntes completos y el foro semanal ya están disponibles, sin costo y sin registro.': 'The introductory course, the complete study notes and the weekly forum are all available, at no cost and with no sign-up.',
    'Curso introductorio · Gratis': 'Introductory course · Free',
    'Introducción a PIT': 'Introduction to PIT',
    'Seis lecciones cortas: qué es PIT, las zonas que más se tratan, los materiales de trabajo y dos autoevaluaciones.': 'Six short lessons: what PIT is, the areas treated most often, the working materials and two self-assessments.',
    'Empezar el curso →': 'Start the course →',

    // ══ AULA DEL CURSO INTRODUCTORIO (curso-intro.html) ════════════════
    // El temario, el material y el avance están en el HTML servido.
    'Contenido del curso': 'Course contents',
    '6 lecciones · 2 videos · 2 autoevaluaciones · gratis': '6 lessons · 2 videos · 2 self-assessments · free',
    'Avance del curso': 'Course progress',
    'Material del curso': 'Course material',
    'Apuntes de PIT — 80 páginas (PDF)': 'PIT study notes — 80 pages (PDF)',
    'Referencias anatómicas (PDF)': 'Anatomical references (PDF)',
    'Curso completado': 'Course completed',
    '¿Querés profundizar? El Módulo I (Lumbalgia y Rodilla) te espera.': 'Want to go deeper? Module I (Low back pain and Knee) is waiting for you.',
    'Ver el curso completo →': 'See the full course →',

    // Todo lo demás lo escribe el aula desde su array LESSONS al dibujar cada
    // lección, así que no aparece en el HTML servido: va con RUNTIME. Si allá
    // se agrega o se reescribe una lección, la entrada de acá se mueve a mano.
    '6 lecciones · 2 autoevaluaciones · gratis · videos en edición': '6 lessons · 2 self-assessments · free · videos being edited',   // RUNTIME
    'Lectura': 'Reading',   // RUNTIME
    'Video': 'Video',   // RUNTIME
    'Autoevaluación': 'Self-assessment',   // RUNTIME
    'Completada': 'Completed',   // RUNTIME
    '✓ Completada': '✓ Completed',   // RUNTIME
    'Marcar como completada →': 'Mark as completed →',   // RUNTIME
    'Siguiente lección →': 'Next lesson →',   // RUNTIME
    'Corregir respuestas': 'Check answers',   // RUNTIME
    'Reintentar': 'Try again',   // RUNTIME
    'Autoevaluación aprobada': 'Self-assessment passed',   // RUNTIME
    'Todavía no': 'Not yet',   // RUNTIME
    'Quedó registrada como completada. Podés seguir con la próxima lección.': 'It is recorded as completed. You can move on to the next lesson.',   // RUNTIME
    'Repasá la lección correspondiente y volvé a intentarlo — no hay límite de intentos.': 'Review the matching lesson and try again — there is no limit on attempts.',   // RUNTIME
    'Respuesta correcta': 'Correct answer',   // RUNTIME
    '✓ Correcta': '✓ Correct',   // RUNTIME
    'Tu respuesta': 'Your answer',   // RUNTIME
    'Video en edición': 'Video being edited',   // RUNTIME
    'Este video se está terminando de editar. Mientras tanto podés seguir con las lecturas y las autoevaluaciones, y descargar los apuntes completos.': 'This video is still being edited. In the meantime you can carry on with the readings and the self-assessments, and download the complete study notes.',   // RUNTIME
    'Qué es PIT y para qué sirve': 'What PIT is and what it is for',   // RUNTIME
    'LECTURA · 4 MIN': 'READING · 4 MIN',   // RUNTIME
    'LECTURA · 5 MIN': 'READING · 5 MIN',   // RUNTIME
    'VIDEO': 'VIDEO',   // RUNTIME
    '3 PREGUNTAS': '3 QUESTIONS',   // RUNTIME
    'El método, explicado por el Dr. Frusso': 'The method, explained by Dr. Frusso',   // RUNTIME
    'Las zonas que más se tratan': 'The areas treated most often',   // RUNTIME
    'Autoevaluación · Conceptos de PIT': 'Self-assessment · PIT concepts',   // RUNTIME
    'Materiales e instrumental para PIT': 'Materials and instruments for PIT',   // RUNTIME
    'Autoevaluación · Materiales y preparación': 'Self-assessment · Materials and preparation',   // RUNTIME
    'PIT (Perineural Injection Treatment) es un tratamiento mínimamente invasivo del dolor crónico, desarrollado por el Dr. John Lyftogt.': 'PIT (Perineural Injection Treatment) is a minimally invasive treatment for chronic pain, developed by Dr. John Lyftogt.',   // RUNTIME
    'Cuando un dolor persiste durante meses, muchas veces el problema ya no está en el músculo ni en la articulación: está en el nervio que transmite la señal. Ese nervio se inflamó, se volvió hipersensible, y envía señales de dolor aunque el tejido esté sano.': 'When pain persists for months, the problem is often no longer in the muscle or the joint: it is in the nerve carrying the signal. That nerve became inflamed and hypersensitive, and it sends pain signals even though the tissue is healthy.',
    'PIT actúa sobre ese nervio con pequeñas inyecciones de dextrosa al 5% debajo de la piel, sin corticoides, sin cirugía y sin interferir con ningún otro tratamiento en curso.': 'PIT acts on that nerve with small injections of 5% dextrose under the skin, with no corticosteroids, no surgery and no interference with any other ongoing treatment.',   // RUNTIME
    'Qué se inyecta': 'What is injected',   // RUNTIME
    'Dextrosa al 5% diluida en agua purificada, a un pH de 7.4 cercano al de la sangre. Sin corticoides, sin anestésicos y sin antiinflamatorios.': '5% dextrose diluted in purified water, at a pH of 7.4 close to that of blood. No corticosteroids, no anaesthetics and no anti-inflammatories.',   // RUNTIME
    'Dónde se inyecta': 'Where it is injected',   // RUNTIME
    'Debajo de la piel, sobre el nervio periférico sensibilizado. Aguja ultrafina y aplicación superficial: es un procedimiento de consultorio.': 'Under the skin, over the sensitised peripheral nerve. An ultra-fine needle and a superficial application: it is an office procedure.',   // RUNTIME
    'Cuánto dura': 'How long it takes',   // RUNTIME
    'Un tratamiento típico son 6 a 8 sesiones semanales. Cada sesión alarga el alivio de la anterior y baja el piso de dolor con el que arranca la siguiente.': 'A typical course of treatment is 6 to 8 weekly sessions. Each session lengthens the relief from the previous one and lowers the pain level the next one starts from.',   // RUNTIME
    'Este curso es introductorio y gratuito: explica el método y el material de trabajo. La formación completa para aplicar la técnica es el Módulo I.': 'This course is introductory and free: it explains the method and the working materials. The complete training to apply the technique is Module I.',   // RUNTIME
    'El Dr. Frusso presenta el método: por qué el dolor crónico muchas veces nace en un nervio periférico sensibilizado, qué hace PIT para desinflamarlo y qué vas a encontrar en este curso.': 'Dr. Frusso introduces the method: why chronic pain often starts in a sensitised peripheral nerve, what PIT does to calm it down, and what you will find in this course.',   // RUNTIME
    'Un paneo general por las regiones que más aparecen en el consultorio, y por cómo se ordena una sesión de principio a fin.': 'An overview of the regions seen most often in the office, and of how a session runs from start to finish.',   // RUNTIME
    'Dolor lumbar persistente. Es la consulta más frecuente y la región con la que abre el Módulo I.': 'Persistent low back pain. It is the most frequent reason for consultation and the region Module I opens with.',   // RUNTIME
    'Dolor anterior, interno o externo de rodilla, con o sin artrosis de base.': 'Anterior, medial or lateral knee pain, with or without underlying osteoarthritis.',   // RUNTIME
    'Dolor de cuello que muchas veces se extiende hacia la cabeza o el hombro.': 'Neck pain that often extends towards the head or the shoulder.',   // RUNTIME
    'Dolor que limita levantar el brazo o apoyarse de ese lado para dormir.': 'Pain that makes it hard to raise the arm or to sleep on that side.',   // RUNTIME
    'Codo': 'Elbow',
    'Epicondilitis y epitrocleítis: el dolor de codo que no cede con reposo.': 'Lateral and medial epicondylitis: the elbow pain that does not settle with rest.',   // RUNTIME
    'Tobillo': 'Ankle',
    'Dolor que quedó después de un esguince o de una sobrecarga repetida.': 'Pain left behind after a sprain or repeated overload.',   // RUNTIME
    'Se dialoga con la persona y se le pregunta cuándo, cómo y dónde comenzó el dolor.': 'The clinician talks with the person and asks when, how and where the pain began.',
    'El paciente indica la zona donde le duele, lo que permite localizar el campo anatómico y determinar qué nervio está inflamado.': 'The patient points to the painful area, which locates the anatomical field and identifies which nerve is inflamed.',
    'Se identifican por palpación los puntos donde el nervio está sensibilizado. Estos puntos se denominan «puntos de Valleix».': 'Palpation identifies the points where the nerve is sensitised. These are known as «Valleix points».',
    'Se aplica dextrosa al 5% con una aguja ultrafina y de manera superficial, reduciendo al mínimo la posibilidad de experimentar dolor por la aplicación.': '5% dextrose is applied superficially with an ultra-fine needle, keeping any pain from the application itself to a minimum.',
    'La lista no es cerrada: PIT se aplica sobre nervios periféricos superficiales, y eso abarca más regiones de las que entran en este paneo.': 'The list is not closed: PIT is applied over superficial peripheral nerves, and that covers more regions than fit into this overview.',   // RUNTIME
    'Verificá que los conceptos de las dos primeras lecciones quedaron claros. Elegí una opción por pregunta y corregi al final. Necesitás al menos 2 correctas para aprobar.': 'Check that the concepts from the first two lessons are clear. Pick one option per question and check your answers at the end. You need at least 2 correct to pass.',   // RUNTIME
    '¿Qué solución se utiliza en las inyecciones de PIT?': 'Which solution is used in PIT injections?',   // RUNTIME
    'Corticoides': 'Corticosteroids',   // RUNTIME
    'Dextrosa al 5%': '5% dextrose',   // RUNTIME
    'Ácido hialurónico': 'Hyaluronic acid',   // RUNTIME
    '¿Dónde actúa principalmente el tratamiento?': 'Where does the treatment mainly act?',   // RUNTIME
    'En la articulación': 'In the joint',   // RUNTIME
    'En el músculo': 'In the muscle',   // RUNTIME
    'En el nervio periférico sensibilizado': 'In the sensitised peripheral nerve',   // RUNTIME
    '¿Cuántas sesiones tiene un tratamiento típico?': 'How many sessions does a typical course of treatment have?',   // RUNTIME
    'Una sola sesión': 'A single session',   // RUNTIME
    'Entre 6 y 8 sesiones': 'Between 6 and 8 sessions',   // RUNTIME
    'Más de 20 sesiones': 'More than 20 sessions',   // RUNTIME
    'Instructivo filmado en consultorio: qué materiales se necesitan para aplicar PIT, cómo se prepara la solución de dextrosa al 5% y cómo se ordena la mesa de trabajo antes de una sesión.': 'A walkthrough filmed in the office: which materials are needed to apply PIT, how the 5% dextrose solution is prepared and how the work surface is laid out before a session.',   // RUNTIME
    'Repasá el instructivo de materiales antes de responder. Elegí una opción por pregunta y corregi al final. Necesitás al menos 2 correctas para aprobar.': 'Review the materials walkthrough before answering. Pick one option per question and check your answers at the end. You need at least 2 correct to pass.',   // RUNTIME
    'Las inyecciones de PIT son:': 'PIT injections are:',   // RUNTIME
    'Intraarticulares profundas': 'Deep intra-articular',   // RUNTIME
    'Subcutáneas y superficiales': 'Subcutaneous and superficial',   // RUNTIME
    'Intramusculares': 'Intramuscular',   // RUNTIME
    '¿Qué tipo de aguja se utiliza habitualmente?': 'Which type of needle is usually used?',   // RUNTIME
    'Aguja ultrafina, de calibre 27 a 30G': 'An ultra-fine needle, 27 to 30G',   // RUNTIME
    'Trocar de biopsia': 'A biopsy trocar',   // RUNTIME
    'Cualquier aguja disponible': 'Any available needle',   // RUNTIME
    '¿PIT es compatible con otros tratamientos en curso?': 'Is PIT compatible with other ongoing treatments?',   // RUNTIME
    'No, hay que suspenderlos': 'No, they have to be stopped',   // RUNTIME
    'Sí, es un tratamiento complementario': 'Yes, it is a complementary treatment',   // RUNTIME
    'Solo con cirugía previa': 'Only with previous surgery',   // RUNTIME

    'PDF · 80 páginas': 'PDF · 80 pages',
    'Anatomía, técnica y puntos de inyección para cada región.': 'Anatomy, technique and injection points for each region.',
    'Descargar apuntes →': 'Download the notes →',
    'Foro · Cada semana': 'Forum · Every week',
    // Las dos cadenas fijas del listado de ultimas publicaciones que
    // escribe _build/sync-foro-home.js en la home. Las filas en si
    // (fecha, categoria, titulo, "Leer") reusan las cadenas que ya
    // existen en el foro, asi que no necesitan clave propia.
    'Lo último del foro': 'Latest from the forum',

    // ── Bloque de proximos cursos (lo escribe _build/sync-cursos-home.js) ──
    // Las etiquetas de los datos son fijas; la zona, la fecha, el lugar y la
    // modalidad salen del frontmatter de cada post y llevan su propia clave.
    'Próximos cursos': 'Upcoming courses',
    'Formación presencial, con práctica sobre pacientes reales': 'In-person training, with practice on real patients',
    'Fecha y hora': 'Date and time',
    'Lugar': 'Venue',
    'Modalidad': 'Format',
    'Inscripción por WhatsApp': 'Sign up on WhatsApp',
    'Curso anterior': 'Previous course',
    'Curso siguiente': 'Next course',
    // Los tres cursos del NOA, septiembre 2026.
    'Curso en Salta: el dolor de miembros inferiores, desde los nervios': 'Course in Salta: lower-limb pain, from the nerves',
    'Curso en Jujuy: tratamiento del dolor de la zona dorso-lumbar con Lyftogt PIT': 'Course in Jujuy: treating thoracolumbar pain with Lyftogt PIT',
    'Curso en Tucumán: el dolor de la cabeza, el cuello y el hombro con Lyftogt PIT': 'Course in Tucumán: head, neck and shoulder pain with Lyftogt PIT',
    'Miembros inferiores': 'Lower limbs',
    'Zona dorso-lumbar': 'Thoracolumbar area',
    'Cabeza, cuello y hombro': 'Head, neck and shoulder',
    'San Salvador de Jujuy': 'San Salvador de Jujuy',
    'Viernes 04/09 · 14 a 20 hs': 'Friday 04/09 · 2 to 8 pm',
    'Sábado 05/09 · 08:30 a 13:00 hs': 'Saturday 05/09 · 8:30 am to 1 pm',
    'Martes 08/09 · 08:30 a 15:00 hs': 'Tuesday 08/09 · 8:30 am to 3 pm',
    'Ciudad de Salta': 'City of Salta',
    'Consejo de Médicos de Jujuy · La Reina Mora 656': 'Consejo de Médicos de Jujuy · La Reina Mora 656',
    'San Miguel de Tucumán': 'San Miguel de Tucumán',
    'Presencial y virtual en vivo': 'In person and live online',
    'Presencial y virtual': 'In person and online',
    'Ir al curso de Salta': 'Go to the Salta course',
    'Ir al curso de San Salvador de Jujuy': 'Go to the San Salvador de Jujuy course',
    'Ir al curso de Tucumán': 'Go to the Tucumán course',
    'Ver todo el foro →': 'See the whole forum →',
    'El Dr. Frusso responde': 'Dr. Frusso answers',
    'Noticias, casos clínicos y tu pregunta respondida — sin datos personales.': 'News, clinical cases and your question answered — with no personal data.',
    'Ir al foro →': 'Go to the forum →',

    // Módulo de datos por patología
    'Qué trata PIT': 'What PIT treats',
    'Elegí una opción': 'Choose an option',
    'Lumbalgia': 'Low back pain',
    'Rodilla': 'Knee',
    'Cervical': 'Neck',
    'Hombro': 'Shoulder',
    'Sesiones típicas': 'Typical sessions',
    'Duración de cada sesión': 'Length of each session',
    'Primer alivio': 'First relief',
    'En la misma sesión': 'In the same session',
    '20–30 min': '20–30 min.',
    'Lumbalgia crónica.': 'Chronic low back pain.',
    'Dolor persistente en la parte baja de la espalda. Se mapean por palpación las ramas nerviosas superficiales sensibilizadas de la zona lumbar y se tratan con inyecciones subcutáneas de dextrosa al 5% (glucosa).': 'Persistent pain in the lower back. The sensitized superficial nerve branches of the lumbar area are mapped by palpation and treated with subcutaneous injections of 5% dextrose (glucose).',
    'Cómo es una sesión →': 'What a session is like →',
    'Valores orientativos · Cada caso requiere evaluación individual': 'Indicative values · Each case requires individual assessment',

    // Los testimonios de la home, los de alumnos del Modulo I, la pregunta
    // de cobertura de la FAQ y la fila de Horarios de Contacto estan
    // OCULTOS en sus fuentes hasta tener contenido real, asi que sus claves
    // se fueron de aca: sin texto en el HTML quedaban huerfanas y el build
    // lo corta. Cuando el bloque vuelva, vuelven sus claves.

    // FAQ del home
    '¿Duelen las inyecciones?': 'Do the injections hurt?',
    'Se usa una aguja muy fina y la aplicación es justo debajo de la piel: la molestia es mínima y breve. La mayoría de los pacientes nota alivio en la misma sesión.': 'A very fine needle is used and the injection goes just under the skin: the discomfort is minimal and brief. Most patients notice relief in the same session.',
    '¿Cuántas sesiones voy a necesitar?': 'How many sessions will I need?',
    'El tratamiento típico es de 6 a 8 sesiones según la región y el tiempo de evolución del dolor. El alivio suele sentirse desde la primera sesión.': 'A typical course is 6 to 8 sessions depending on the region and how long the pain has been present. Relief is usually felt from the first session.',
    '¿Es compatible con otros tratamientos?': 'Is it compatible with other treatments?',
    'Sí. PIT es complementario: no interfiere con medicación, kinesiología ni otros procedimientos en curso, y no requiere suspender nada.': 'Yes. PIT is complementary: it does not interfere with medication, physiotherapy or other ongoing procedures, and nothing needs to be stopped.',
    '¿Tiene efectos secundarios?': 'Are there side effects?',
    // La home ya aclaró "(glucosa)" en el panel de patologías, que está
    // más arriba; la FAQ suelta no tiene ese contexto y la repite. Son dos
    // cadenas distintas a propósito.
    'La dextrosa al 5% es una sustancia segura, sin los efectos adversos del corticoide. Puede haber una molestia local pasajera en el sitio de inyección. Cada caso se evalúa individualmente en la consulta.': '5% dextrose is a safe substance, without the adverse effects of corticosteroids. There may be brief local discomfort at the injection site. Each case is assessed individually during the consultation.',
    'La dextrosa al 5% (glucosa) es una sustancia segura, sin los efectos adversos del corticoide. Puede haber una molestia local pasajera en el sitio de inyección. Cada caso se evalúa individualmente en la consulta.': '5% dextrose (glucose) is a safe substance, without the adverse effects of corticosteroids. There may be brief local discomfort at the injection site. Each case is assessed individually during the consultation.',
    'Ver todas las preguntas →': 'See all questions →',

    // Cierre: curso pago
    '¿Querés profundizar?': 'Want to go deeper?',
    'Curso PIT · Módulo I': 'PIT Course · Module I',
    'Lumbalgia y Rodilla': 'Low Back and Knee',
    'Casos clínicos reales filmados en consultorio, sin cortes. Acceso permanente y certificado emitido por un instructor autorizado.': 'Real clinical cases filmed in practice, uncut. Lifetime access and a certificate issued by a certified instructor.',
    'Ver el curso →': 'View the course →',
    'USD 97.99 · Pago único': 'USD 97.99 · One-time payment',

    // ══ SOBRE EL DR. FRUSSO ═══════════════════════════════════════════════
    'Médico de Familia (UBA, 1992) con más de tres décadas de práctica en el Hospital Italiano de Buenos Aires. Fundador del Área de Medicina Musculoesquelética dentro del Servicio de Medicina Familiar en ese mismo hospital. Pionero en Argentina en la aplicación de PIT, formado directamente por el Dr. John Lyftogt — creador del método — e instructor autorizado para América Latina desde 2015. Miembro Fundador de la Escuela de PIT, donde forma a profesionales de toda la región junto a sus otros tres fundadores: el Dr. Heno Pigerl y las doctoras María Paz Caruso y María Julia Aparicio.': 'Family physician (University of Buenos Aires, 1992) with more than three decades of practice at Hospital Italiano de Buenos Aires. Founder of the Musculoskeletal Medicine Area within the hospital’s Family Medicine Service. A pioneer in the use of PIT in Argentina, he trained directly with Dr. John Lyftogt — creator of the method — and has been an authorized instructor for Latin America since 2015. He is a founding member of Escuela de PIT, where he trains professionals from across the region together with its other three founders: Dr. Heno Pigerl, Dr. María Paz Caruso and Dr. María Julia Aparicio.',
    'HIBA · 30+ años': 'HIBA · 30+ years',
    'Médico — Universidad de Buenos Aires': 'Medical degree — University of Buenos Aires',
    'Especialización posterior en Medicina Familiar.': 'He later specialized in Family Medicine.',
    'Más de 30 años de práctica clínica y docencia en Medicina Familiar.': 'More than 30 years of clinical practice and teaching in Family Medicine.',
    'Formación con el Dr. John Lyftogt': 'Training with Dr. John Lyftogt',
    'Entrenamiento directo con el creador del método PIT (Nueva Zelanda).': 'Direct training with the creator of the PIT method in New Zealand.',
    'Instructor autorizado para América Latina': 'Authorized instructor for Latin America',
    'Introduce y difunde PIT en la región; forma a cientos de profesionales.': 'Introduces and promotes PIT in the region, training hundreds of professionals.',
    'Junto al Dr. Pigerl y las doctoras Caruso y Aparicio, inauguran su propia escuela de formación en el método, para profesionales de la salud de toda la región.': 'Together with Dr. Pigerl, Dr. Caruso and Dr. Aparicio, he launches a school dedicated to training health professionals from across the region in the method.',
    'Hoy': 'Today',
    'Hospital Italiano, consultorio en Belgrano, docencia y divulgación': 'Hospital Italiano, private practice in Belgrano, teaching and outreach',
    'Atención de pacientes, formación de profesionales y divulgación de la técnica a través de medios digitales.': 'Patient care, professional training and communication about the technique through digital media.',
    'Leer el foro semanal →': 'Read the weekly forum →',

    // ══ FORO — portada ════════════════════════════════════════════════════
    'Foro PIT · Noticias, casos y respuestas': 'PIT Forum · News, cases and answers',
    'Cada semana, una respuesta.': 'One answer every week.',
    'El Dr. Frusso publica todas las semanas: responde preguntas de la comunidad, comenta casos clínicos, comparte evidencia nueva y novedades del método. Las preguntas se moderan antes de publicarse.': 'Dr. Frusso publishes every week: he answers questions from the community, comments on clinical cases, and shares new evidence and news about the method. Questions are moderated before they are published.',

    // Filtros del archivo
    'Todo': 'All',
    'Preguntas y respuestas': 'Questions and answers',
    'Casos clínicos': 'Clinical cases',
    'Consejos': 'Tips',
    'Noticias': 'News',
    'Audiencia': 'Audience',
    'Pacientes': 'Patients',
    'Profesionales': 'Professionals',

    // Publicación destacada
    'Esta semana': 'This week',
    'Leer →': 'Read →',

    // Archivo
    'Todas las publicaciones': 'All posts',
    'El archivo del foro.': 'The forum archive.',
    'Sin resultados en el archivo': 'No results in the archive',   // RUNTIME
    'Ver todas las publicaciones': 'See all posts',
    // El post mas nuevo aparece en la home (listado de sync-foro-home.js)
    // pero en foro.html es el DESTACADO, que arma su linea de otra forma:
    // esta clave existe solo por la home. Cuando se publica el siguiente,
    // el destacado de hoy baja al archivo del foro y la clave sigue
    // sirviendo; lo que hay que agregar es la del post nuevo.
    'Noticias · Para todos': 'News · For everyone',

    // Títulos de las publicaciones

    // Formulario del foro
    'Participá': 'Take part',
    'Enviá tu pregunta al foro.': 'Send your question to the forum.',
    'El Dr. Frusso selecciona y responde preguntas cada semana. Se publican sin nombre ni datos personales. Dejá tu email y te avisamos apenas esté la respuesta.': 'Dr. Frusso selects and answers questions every week. They are published without a name or personal data. Leave your email and we will let you know as soon as the answer is up.',
    'Sin registro': 'No sign-up',
    'Anónimas': 'Anonymous',
    'Soy paciente': 'I am a patient',
    'Soy profesional': 'I am a professional',
    'Tu pregunta': 'Your question',
    'Escribí tu pregunta acá. Cuanto más contexto (zona del dolor, tiempo de evolución, tratamientos previos), más completa podrá ser la respuesta.': 'Write your question here. The more context you give (where it hurts, how long you have had it, previous treatments), the more complete the answer can be.',
    'Escribí tu pregunta acá. Sumá el contexto clínico que ayude (región, hallazgos, qué probaste).': 'Write your question here. Add whatever clinical context helps (region, findings, what you have tried).',   // RUNTIME
    'Tu email — te avisamos cuando el Dr. Frusso responda': 'Your email — we will tell you when Dr. Frusso answers',
    'tu@email.com': 'you@email.com',
    'Sumarme también al newsletter: novedades del método y del foro, sin spam. Te podés dar de baja cuando quieras.': 'Sign me up to the newsletter as well: news about the method and the forum, no spam. You can unsubscribe whenever you like.',
    'Enviar pregunta': 'Send question',
    'Tu email no se publica ni se comparte: se usa solo para avisarte de la respuesta': 'Your email is not published or shared: it is used only to notify you of the answer',
    'y enviarte el newsletter': 'and to send you the newsletter',
    '. Las respuestas del foro son informativas y no reemplazan una consulta médica.': '. Forum answers are informational and do not replace a medical consultation.',
    'Pregunta recibida.': 'Question received.',
    'Pasa a moderación y, si el Dr. Frusso la selecciona, se publica sin tus datos. Te va a llegar un aviso a': 'It goes to moderation and, if Dr. Frusso selects it, it is published without your data. You will get a notice at',
    'cuando esté la respuesta.': 'once the answer is up.',
    '✓ Quedaste suscripto al newsletter': '✓ You are subscribed to the newsletter',
    'Enviar otra pregunta →': 'Send another question →',
    // Errores del formulario del foro
    'Escribí tu pregunta antes de enviar': 'Write your question before sending',   // RUNTIME
    'Revisá el email: es adonde te avisamos la respuesta': 'Check the email: that is where we send the answer',   // RUNTIME

    // ══ FORO — páginas de publicación ═════════════════════════════════════
    '← Foro PIT': '← PIT Forum',
    'Galería del curso': 'Course gallery',
    'Imagen anterior': 'Previous image',
    'Elegir imagen': 'Choose image',
    'Imagen siguiente': 'Next image',
    '5 piezas · usá las flechas o deslizá': '5 slides · use the arrows or swipe',
    'Pregunta de profesional': 'Question from a professional',   // RUNTIME
    'Por el Dr. Ricardo D. Frusso': 'By Dr. Ricardo D. Frusso',
    'M.N. 86.498 · Instructor autorizado PIT': 'M.N. 86.498 · Certified PIT instructor',
    '¿Tenés una pregunta?': 'Do you have a question?',
    'Se modera y se publica sin datos personales. Si dejás tu email, te avisamos cuando salga la respuesta.': 'It is moderated and published without personal data. If you leave your email, we will tell you when the answer is out.',
    'Seguí leyendo': 'Keep reading',
    'Archivo completo →': 'Full archive →',
    'Todas las publicaciones del foro': 'All the forum posts',
    'Este contenido es informativo y no reemplaza una consulta médica. Cada caso requiere evaluación profesional individual.': 'This content is informational and does not replace a medical consultation. Each case requires individual professional assessment.',
    'Idea clave': 'Key idea',

    // Fechas y navegación entre publicaciones

    // Etiquetas de las publicaciones
    // "Glucose 5%" y no "5% glucose": la etiqueta del post y el texto del
    // cuerpo ("Glucosa al 5%") tienen que dar traducciones DISTINTAS, si no
    // REV — el diccionario inverso — colapsa las dos claves en una y volver a
    // español rompe una de las dos.

    // Cuerpo de las publicaciones

    // Placeholders de contenido pendiente en las publicaciones

    // ══ RESTO DEL SITIO ═══════════════════════════════════════════════════
    // Cobertura PARCIAL: son las claves que seguían siendo válidas contra el
    // HTML actual. Estas páginas todavía no están traducidas al 100%.
    'Cómo es una sesión': 'What a session is like',
    'Conversación con el paciente (anamnesis)': 'Talking with the patient (history taking)',
    'Identificación de la zona de dolor': 'Identifying the painful area',
    'Breve examen físico': 'Brief physical examination',
    'Inyecciones subcutáneas': 'Subcutaneous injections',
    'Para profesionales de la salud': 'For health professionals',
    'El mecanismo, con el rigor que esperás.': 'The mechanism, with the rigor you expect.',
    'Evidencia científica publicada': 'Published scientific evidence',
    'Apuntes de PIT — 80 páginas (gratis)': 'PIT study notes — 80 pages (free)',
    'Formarme en PIT →': 'Train in PIT →',
    'La técnica, en imágenes': 'The technique, in pictures',
    'Preguntas frecuentes →': 'FAQ →',
    'Preguntar en el foro →': 'Ask in the forum →',
    'Pedir una consulta →': 'Request a consultation →',
    'Inscribirme en Hotmart →': 'Enroll on Hotmart →',
    'Para quién es': 'Who it is for',
    'Médicos': 'Physicians',
    'Profesionales del dolor': 'Pain professionals',
    'Sin experiencia previa': 'No prior experience',
    'Temario': 'Syllabus',
    'Dos regiones, de la anatomía al caso filmado.': 'Two regions, from anatomy to the filmed case.',
    'Certificado': 'Certificate',
    'Aprobación con respaldo': 'Approval with backing',
    'Compra segura': 'Secure purchase',
    'Garantía de 7 días': '7-day guarantee',
    'Empezá hoy. El acceso es tuyo para siempre.': 'Start today. The access is yours forever.',
    'Trayectoria': 'Career',
    'Dónde ejerce, enseña y se formó': 'Where he practices, teaches and received his training',
    'Miembro Fundador · Escuela de PIT': 'Founding member · Escuela de PIT',
    'Funda en conjunto la Escuela de PIT': 'Co-founds Escuela de PIT',
    'Bibliografía médica y experiencia clínica.': 'Medical literature and clinical experience.',
    'Las 28 referencias completas (PDF) ↓': 'All 28 references (PDF) ↓',
    'Lo que más nos preguntan.': 'What we get asked the most.',
    '¿Tiene efectos secundarios o contraindicaciones?': 'Are there side effects or contraindications?',
    '¿Es compatible con otros tratamientos que ya estoy haciendo?': 'Is it compatible with treatments I am already doing?',
    '¿Necesito formación previa en proloterapia?': 'Do I need prior training in prolotherapy?',
    '¿Qué materiales necesito para empezar a aplicar PIT?': 'What materials do I need to start applying PIT?',
    '¿El certificado del curso me habilita a ejercer la técnica?': 'Does the course certificate license me to practice the technique?',
    'El consultorio queda en Belgrano.': 'The practice is in Belgrano.',
    'Dirección': 'Address',
    'Escribinos': 'Write to us',
    'Nombre': 'Name',
    'Tu nombre': 'Your name',
    'Mensaje': 'Message',
    'Escribí tu consulta': 'Write your enquiry',
    'Enviar mensaje →': 'Send message →',
    'Paciente': 'Patient',
    'Profesional de la salud': 'Health professional',
    'Otro': 'Other',
    'Transparencia': 'Transparency',
    'Información legal, clara y completa.': 'Clear and complete legal information.',
    'Última actualización: 4 de septiembre de 2026': 'Last updated: September 4, 2026',
    'Secciones legales': 'Legal sections',
    'Cookies y almacenamiento': 'Cookies and storage',
    'Términos de uso y compra': 'Terms of use and purchase',
    'Política de privacidad': 'Privacy policy',
    'Responsable del sitio': 'Site owner',
    'Finalidad': 'Purpose',
    'Autoría, enlaces y disponibilidad': 'Authorship, links and availability',
    'Qué datos tratamos y para qué': 'What data we process and why',
    'Proveedores que intervienen': 'Service providers',
    'Conservación y seguridad': 'Retention and security',
    'Tus derechos': 'Your rights',
    'Uso del sitio': 'Use of this site',
    'Cursos y compras': 'Courses and purchases',
    'Cambios y ley aplicable': 'Changes and applicable law',
    'Interacción': 'Interaction',
    'Datos': 'Data',
    'Tipo y duración': 'Type and duration',
    'Uso': 'Use',
    'Mapa del consultorio': 'Practice location map',
    'Mapa de Google': 'Google Map',
    'El mapa se carga desde Google y puede enviarle datos técnicos de tu visita.': 'The map loads from Google and may send it technical data about your visit.',
    'Cargar mapa': 'Load map',
    'Abrir la dirección en Google Maps →': 'Open the address in Google Maps →',
    'Video de YouTube': 'YouTube video',
    'El video se carga desde YouTube y puede enviarle datos técnicos de tu visita.': 'The video loads from YouTube and may send it technical data about your visit.',
    'Cargar video': 'Load video',
    'Ver directamente en YouTube →': 'Watch directly on YouTube →',
    // Contacto
    'Teléfono': 'Phone',
    'Turnos': 'Appointments',
    'Sacar turno online →': 'Book an appointment online →',
    '+54 9 11 5458-2558': '+54 9 11 5458-2558',
    // Errores del formulario de contacto
    'Escribí tu nombre para poder responderte': 'Write your name so we can reply',   // RUNTIME
    'Revisá el email: no parece una dirección válida': 'Check the email: it does not look like a valid address',   // RUNTIME
    'Contanos tu consulta antes de enviar': 'Tell us your enquiry before sending'   // RUNTIME
  };

  // El mapa inverso (EN→ES) se arma recién cuando hace falta: solo se usa para
  // volver a español DESPUÉS de haber traducido. En la carga normal —visitante
  // en español, que es el caso de casi todas las visitas— no se construye
  // nunca, y nos ahorramos recorrer las 313 claves del diccionario.
  var REV = null;
  function reverse() {
    if (!REV) {
      REV = {};
      Object.keys(DICT).forEach(function (k) { REV[DICT[k]] = k; });
    }
    return REV;
  }

  // Los componentes que crean texto después de la carga (hoy, el chat) usan
  // esta misma fuente en vez de duplicar un segundo diccionario.
  window.pitTranslate = function (text) {
    var map = document.documentElement.lang === 'en' ? DICT : reverse();
    return Object.prototype.hasOwnProperty.call(map, text) ? map[text] : text;
  };

  // Marcar el idioma activo es barato (un atributo + dos botones) y hay que
  // hacerlo siempre. Traducir el documento es caro y solo hace falta cuando
  // el idioma pedido difiere del que ya está escrito en el HTML.
  function markActive(lang) {
    document.documentElement.lang = lang;
    var btns = document.querySelectorAll('.lang-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('lang-active', btns[j].getAttribute('data-lang') === lang);
    }
  }

  function apply(lang) {
    var map = lang === 'en' ? DICT : reverse();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      var t = raw.trim();
      if (t && Object.prototype.hasOwnProperty.call(map, t)) {
        node.nodeValue = raw.replace(t, map[t]);
      }
    }
    var phs = document.querySelectorAll('[placeholder]');
    for (var i = 0; i < phs.length; i++) {
      var p = phs[i].getAttribute('placeholder');
      if (Object.prototype.hasOwnProperty.call(map, p)) phs[i].setAttribute('placeholder', map[p]);
    }
    // Los nombres accesibles también se traducen: si no, quien usa lector de
    // pantalla en inglés recibe la página traducida pero los botones (el
    // burger, el asistente, el "volver arriba") anunciados en español.
    var labs = document.querySelectorAll('[aria-label]');
    for (var k = 0; k < labs.length; k++) {
      var l = labs[k].getAttribute('aria-label');
      if (Object.prototype.hasOwnProperty.call(map, l)) labs[k].setAttribute('aria-label', map[l]);
    }
    document.documentElement.lang = lang;
    var btns = document.querySelectorAll('.lang-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('lang-active', btns[j].getAttribute('data-lang') === lang);
    }
  }

  function current() {
    try { return localStorage.getItem('pit-lang') || 'es'; } catch (e) { return 'es'; }
  }
  function setLang(lang) {
    try { localStorage.setItem('pit-lang', lang); } catch (e) {}
    apply(lang);
  }
  window.pitSetLang = setLang;

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.lang-btn');
    if (b) setLang(b.getAttribute('data-lang'));
  });

  // El botón ES/EN ya viene en el HTML (ver _build/nav.js) — acá solo
  // aplicamos el idioma guardado. Sin polling ni inyección: nada que
  // aparezca "de la nada" ni mueva el layout después de pintar la página.
  apply(current());
})();
