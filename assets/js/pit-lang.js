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
    'Curso · Próximamente': 'Course · Coming soon',
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

    // Contenido gratuito
    'Contenido gratuito · Sin registro': 'Free content · No sign-up',
    'Aprendé sobre PIT, sin costo': 'Learn about PIT, at no cost',
    'Los apuntes completos y el foro semanal ya están disponibles. El curso introductorio estará disponible próximamente.': 'The complete study notes and weekly forum are available now. The introductory course is coming soon.',
    'Curso introductorio · Próximamente': 'Introductory course · Coming soon',
    'Introducción a PIT': 'Introduction to PIT',
    'Estamos terminando de editar los videos y el contenido. El acceso se habilitará cuando el curso esté completo.': 'We are finishing the videos and course content. Access will open when the course is complete.',
    'Próximamente': 'Coming soon',
    'Estamos terminando de editar los videos y el contenido para publicar el curso completo. El acceso se habilitará próximamente.': 'We are finishing the videos and content before publishing the complete course. Access will open soon.',
    'Volver a los recursos': 'Back to resources',
    'Descargar apuntes de PIT': 'Download the PIT study notes',
    'Mientras tanto:': 'In the meantime:',
    'podés consultar los apuntes de PIT y las respuestas del foro, que ya están disponibles sin registro.': 'you can read the PIT study notes and forum answers, which are already available without signing up.',
    'Ir al foro': 'Go to the forum',
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
    // Opción de una autoevaluación del curso intro: el aula la escribe desde su
    // array de preguntas, no está en el HTML servido.
    'Glucosa al 5%': '5% glucose',   // RUNTIME
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
