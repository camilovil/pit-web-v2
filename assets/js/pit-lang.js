// PIT — toggle de idioma ES/EN
// Traduce nodos de texto, placeholders y aria-label según el diccionario.
// Persiste en localStorage.
//
// CÓMO SE MANTIENE ESTE ARCHIVO
// El diccionario se REGENERA contra el HTML ya construido, nunca a ojo: la
// traducción se aplica por coincidencia exacta del texto recortado, así que
// cualquier cambio de una coma en el copy deja la clave huérfana y el texto sin
// traducir, sin que nada avise. Para revisarlo, en la consola de una página del
// sitio:
//
//   const t=new Set(); const w=document.createTreeWalker(document.body,
//     NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())) {
//     const s=n.nodeValue.trim(); if(s) t.add(s); }
//   document.querySelectorAll('[placeholder]').forEach(e=>t.add(e.placeholder));
//   document.querySelectorAll('[aria-label]').forEach(e=>t.add(e.getAttribute('aria-label')));
//
// y comparar contra Object.keys(DICT).
//
// DOS TRAMPAS DEL FORMATO
// 1. Es un objeto literal: una clave repetida NO da error, la última pisa a la
//    anterior en silencio. (Había tres: "Instructor autorizado", "Curso gratis"
//    y "Evidencia científica".)
// 2. El diccionario inverso (REV) se arma dando vuelta este: si dos claves en
//    español comparten la misma traducción al inglés, volver a ES rompe. Cada
//    valor tiene que ser único.
//
// COBERTURA ACTUAL: home, portal del foro, las 8 publicaciones y el chrome
// compartido (nav, footer, asistente) de las 18 páginas — completos.
// PENDIENTE: el cuerpo de Qué es PIT, Evidencia, FAQ, Contacto, Sobre el Dr.
// Frusso, Privacidad, Curso Módulo I y el aula de Curso Intro conservan las
// claves que seguían siendo válidas, pero no están cubiertos al 100%.
(function () {
  var DICT = {
    // ── Chrome compartido: nav + drawer (las 18 páginas) ──────────────────
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

    // ── Chrome compartido: footer ─────────────────────────────────────────
    'Curso gratis': 'Free course',
    'Evidencia científica': 'Scientific evidence',
    'Curso Módulo I': 'Course · Module I',
    'Foro semanal': 'Weekly forum',
    'Apuntes de PIT': 'PIT study notes',
    'Preguntas frecuentes': 'FAQ',
    'Tratamiento del dolor crónico, desde el nervio, en cada etapa': 'Chronic pain treatment, from the nerve, at every stage',
    'Instagram del Dr. Frusso · @drfrussoricardo': 'Dr. Frusso on Instagram · @drfrussoricardo',
    'Instagram de la Escuela de PIT · @escueladepit': 'Escuela de PIT on Instagram · @escueladepit',
    'Privacidad y aviso médico': 'Privacy & medical notice',
    'Ver el sitio anterior': 'View the previous site',

    // ── Chrome compartido: asistente IA y botón volver arriba ─────────────
    'Abrir asistente sobre PIT': 'Open the PIT assistant',
    'Cerrar asistente sobre PIT': 'Close the PIT assistant',   // RUNTIME
    'Asistente PIT': 'PIT assistant',
    'Cerrar el asistente': 'Close the assistant',
    'Conversación con el asistente': 'Conversation with the assistant',
    'Escribí tu pregunta sobre PIT': 'Type your question about PIT',
    'Preguntá sobre PIT…': 'Ask about PIT…',
    'Volver arriba': 'Back to top',

    // ══ HOME ══════════════════════════════════════════════════════════════
    // Hero
    'PIT · Neuroproloterapia · Dr. Ricardo D. Frusso': 'PIT · Neuroprolotherapy · Dr. Ricardo D. Frusso',
    'Aliviar el dolor crónico desde el nervio': 'Relieve chronic pain at its source: the nerve',
    'PIT es un tratamiento mínimamente invasivo que actúa donde nace el dolor. El alivio suele sentirse desde la primera sesión, sin interferir con otros tratamientos en curso.': 'PIT is a minimally invasive treatment that acts where pain begins. Relief is usually felt from the first session, without interfering with any ongoing treatment.',
    'Pedir una consulta': 'Request a consultation',

    // Franja de respaldos
    'Práctica y formación respaldadas por': 'Practice and training backed by',
    'Práctica clínica · 30+ años': 'Clinical practice · 30+ years',
    'Área de dolor · Cursos PIT': 'Pain unit · PIT courses',
    'Instructor autorizado': 'Certified instructor',
    'Fundador · Formación en PIT': 'Founder · PIT training',
    'Formación · 1992': 'Medical degree · 1992',

    // Bifurcación
    '¿Quién sos?': 'Who are you?',
    'La misma técnica, explicada para vos': 'The same technique, explained for you',
    'Para pacientes': 'For patients',
    'Tengo dolor crónico': 'I live with chronic pain',
    'Entendé por qué persiste tu dolor, cómo funciona PIT y si tiene sentido para tu caso — en lenguaje claro.': 'Understand why your pain persists, how PIT works and whether it makes sense for your case — in plain language.',
    'Entender mi dolor →': 'Understand my pain →',
    'Para profesionales': 'For professionals',
    'Soy profesional de la salud': 'I am a health professional',
    'Mecanismo de acción, evidencia publicada y técnica — con casos clínicos reales filmados en consultorio.': 'Mechanism of action, published evidence and technique — with real clinical cases filmed in practice.',
    'Conocer la técnica →': 'Learn the technique →',

    // Contenido gratuito
    'Contenido gratuito · Sin registro': 'Free content · No sign-up',
    'Aprendé sobre PIT, sin costo': 'Learn about PIT, at no cost',
    'Todo el material educativo del método es abierto: el curso introductorio, los apuntes completos y el foro semanal.': 'All the educational material for the method is open: the introductory course, the full study notes and the weekly forum.',
    'Curso gratis · 2 videos + autoevaluaciones': 'Free course · 2 videos + self-assessments',
    'Introducción a PIT': 'Introduction to PIT',
    'El método explicado por el Dr. Frusso, con autoevaluaciones y progreso guardado. Sin costo y sin registro.': 'The method explained by Dr. Frusso, with self-assessments and saved progress. Free and with no sign-up.',
    'Empezar el curso →': 'Start the course →',
    'PDF · 80 páginas': 'PDF · 80 pages',
    'Anatomía, técnica y puntos de inyección para cada región.': 'Anatomy, technique and injection points for each region.',
    'Descargar apuntes →': 'Download the notes →',
    'Foro · Cada semana': 'Forum · Every week',
    'El Dr. Frusso responde': 'Dr. Frusso answers',
    'Noticias, casos clínicos y tu pregunta respondida — sin datos personales.': 'News, clinical cases and your question answered — with no personal data.',
    'Ir al foro →': 'Go to the forum →',

    // Módulo de datos por patología
    'Qué trata PIT': 'What PIT treats',
    'Elegí dónde te duele': 'Choose where it hurts',
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
    'Se mapean por palpación las ramas nerviosas superficiales sensibilizadas de la zona lumbar y se tratan con inyecciones subcutáneas de glucosa al 5%. Es la región con la que abre el Módulo I del curso.': 'The sensitized superficial nerve branches of the lumbar area are mapped by palpation and treated with subcutaneous injections of 5% glucose. It is the region that opens Module I of the course.',
    'Cómo es una sesión →': 'What a session is like →',
    'Valores orientativos · Cada caso requiere evaluación individual': 'Indicative values · Each case requires individual assessment',

    // Testimonios (contenido pendiente de validación)
    'La diferencia': 'The difference',
    'de tratar el nervio': 'of treating the nerve',
    'Placeholder · Testimonio real': 'Placeholder · Real testimonial',
    'A validar con Ricardo': 'Placeholder · To be confirmed',
    '“Después de años de infiltraciones, con PIT el dolor cedió desde la primera sesión.”': '“After years of injections, with PIT the pain eased from the first session.”',
    'Paciente · Lumbalgia': 'Patient · Low back pain',
    '“El curso me dio una herramienta que uso todas las semanas en el consultorio.”': '“The course gave me a tool I use every week in my practice.”',
    'Médico de familia': 'Family physician',
    '“Volví a caminar sin pensar en la rodilla. Cinco sesiones.”': '“I walk again without thinking about my knee. Five sessions.”',
    'Paciente · Gonalgia': 'Patient · Knee pain',
    '“La formación más clara que hice en años: casos reales, sin cortes.”': '“The clearest training I have done in years: real cases, uncut.”',
    'Traumatóloga': 'Orthopaedic surgeon',

    // FAQ del home
    '¿Duelen las inyecciones?': 'Do the injections hurt?',
    'Se usa una aguja muy fina y la aplicación es justo debajo de la piel: la molestia es mínima y breve. La mayoría de los pacientes nota alivio en la misma sesión.': 'A very fine needle is used and the injection goes just under the skin: the discomfort is minimal and brief. Most patients notice relief in the same session.',
    '¿Cuántas sesiones voy a necesitar?': 'How many sessions will I need?',
    'El tratamiento típico es de 6 a 8 sesiones según la región y el tiempo de evolución del dolor. El alivio suele sentirse desde la primera sesión.': 'A typical course is 6 to 8 sessions depending on the region and how long the pain has been present. Relief is usually felt from the first session.',
    '¿Es compatible con otros tratamientos?': 'Is it compatible with other treatments?',
    'Sí. PIT es complementario: no interfiere con medicación, kinesiología ni otros procedimientos en curso, y no requiere suspender nada.': 'Yes. PIT is complementary: it does not interfere with medication, physiotherapy or other ongoing procedures, and nothing needs to be stopped.',
    '¿Tiene efectos secundarios?': 'Are there side effects?',
    'La glucosa al 5% es una sustancia segura, sin los efectos adversos del corticoide. Puede haber una molestia local pasajera en el sitio de inyección. Cada caso se evalúa individualmente en la consulta.': '5% glucose is a safe substance, without the adverse effects of corticosteroids. There may be brief local discomfort at the injection site. Each case is assessed individually during the consultation.',
    'Ver todas las preguntas →': 'See all questions →',

    // Cierre: curso pago
    '¿Querés profundizar?': 'Want to go deeper?',
    'Curso PIT · Módulo I': 'PIT Course · Module I',
    'Lumbalgia y Rodilla': 'Low Back and Knee',
    'Casos clínicos reales filmados en consultorio, sin cortes. Acceso permanente y certificado emitido por un instructor autorizado.': 'Real clinical cases filmed in practice, uncut. Lifetime access and a certificate issued by a certified instructor.',
    'Ver el curso →': 'View the course →',
    'USD 97.99 · Pago único': 'USD 97.99 · One-time payment',

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
    'Semana 28 · 09 jul 2026': 'Week 28 · 09 jul 2026',
    'Me infiltraron con corticoides y volvió el dolor. ¿PIT puede ayudarme?': 'I had a corticosteroid injection and the pain came back. Can PIT help me?',
    'Una pregunta muy frecuente en el consultorio. Ricardo explica la diferencia entre infiltrar la articulación y tratar el nervio sensibilizado — y por qué no son excluyentes.': 'A very common question in the practice. Ricardo explains the difference between injecting the joint and treating the sensitized nerve — and why the two are not mutually exclusive.',
    'Leer →': 'Read →',
    '5 min de lectura': '5 min read',

    // Archivo
    'Publicaciones anteriores': 'Previous posts',
    'El archivo del foro.': 'The forum archive.',
    '7 publicaciones en el archivo': '7 posts in the archive',
    'Sin resultados en el archivo': 'No results in the archive',   // RUNTIME
    'Ver todas las publicaciones': 'See all posts',
    'S27 · 03 jul': 'W27 · 03 jul',
    'S26b · 30 jun': 'W26b · 30 jun',
    'S26 · 26 jun': 'W26 · 26 jun',
    'S25 · 19 jun': 'W25 · 19 jun',
    'S24 · 12 jun': 'W24 · 12 jun',
    'S23 · 05 jun': 'W23 · 05 jun',
    'S22 · 29 may': 'W22 · 29 may',
    'Caso clínico · Prof.': 'Clinical case · Prof.',
    'Noticias · Para todos': 'News · For everyone',
    'Consejos · Pacientes': 'Tips · Patients',
    'Evidencia · Prof.': 'Evidence · Prof.',
    'P. y R. · Pacientes': 'Q&A · Patients',

    // Títulos de las 8 publicaciones
    'Gonalgia bilateral en corredor de 52 años: mapeo y evolución en 5 sesiones': 'Bilateral knee pain in a 52-year-old runner: mapping and progress over 5 sessions',
    'PIT en el Congreso de Medicina Familiar 2026: qué se presentó': 'PIT at the 2026 Family Medicine Congress: what was presented',
    'Qué hacer (y qué no) el día después de una sesión de PIT': 'What to do (and not do) the day after a PIT session',
    'Nueva revisión sistemática sobre glucosa perineural: qué dice y qué no dice': 'New systematic review on perineural glucose: what it says and what it does not',
    '¿Cuántas sesiones necesito antes de saber si PIT funciona para mí?': 'How many sessions do I need before I know whether PIT works for me?',
    'Cervicalgia post-latigazo: abordaje del plexo cervical superficial': 'Post-whiplash neck pain: approaching the superficial cervical plexus',
    '¿PIT sirve si ya tengo artrosis avanzada?': 'Does PIT help if I already have advanced osteoarthritis?',

    // Formulario del foro
    'Participá': 'Take part',
    'Enviá tu pregunta al foro.': 'Send your question to the forum.',
    'El Dr. Frusso selecciona y responde preguntas cada semana. Todas se revisan antes de publicarse y se publican sin nombre ni datos personales. Dejá tu email y te avisamos apenas esté la respuesta.': 'Dr. Frusso selects and answers questions every week. All of them are reviewed before publication and appear without a name or personal data. Leave your email and we will let you know as soon as the answer is up.',
    'Sin registro': 'No sign-up',
    'Anónimas': 'Anonymous',
    'Moderadas': 'Moderated',
    'Soy paciente': 'I am a patient',
    'Soy profesional': 'I am a professional',
    'Tu pregunta': 'Your question',
    'Escribí tu pregunta acá. Cuanto más contexto (zona del dolor, tiempo de evolución, tratamientos previos), mejor la respuesta.': 'Write your question here. The more context you give (where it hurts, how long you have had it, previous treatments), the better the answer.',
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
    'Pregunta de paciente': 'Question from a patient',
    'Pregunta de profesional': 'Question from a professional',   // RUNTIME
    'Caso clínico': 'Clinical case',
    'Responde el Dr. Ricardo D. Frusso': 'Answered by Dr. Ricardo D. Frusso',
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
    'S28 · 09 jul 2026 · P. y R. · Pacientes': 'W28 · 09 jul 2026 · Q&A · Patients',
    'S27 · 03 jul 2026 · Caso clínico · Prof.': 'W27 · 03 jul 2026 · Clinical case · Prof.',
    'S26b · 30 jun 2026 · Noticias · Para todos': 'W26b · 30 jun 2026 · News · For everyone',
    'S26 · 26 jun 2026 · Consejos · Pacientes': 'W26 · 26 jun 2026 · Tips · Patients',
    'S25 · 19 jun 2026 · Evidencia · Prof.': 'W25 · 19 jun 2026 · Evidence · Prof.',
    'S24 · 12 jun 2026 · P. y R. · Pacientes': 'W24 · 12 jun 2026 · Q&A · Patients',
    'S23 · 05 jun 2026 · Caso clínico · Prof.': 'W23 · 05 jun 2026 · Clinical case · Prof.',
    'S22 · 29 may 2026 · P. y R. · Pacientes': 'W22 · 29 may 2026 · Q&A · Patients',
    '09 jul 2026 · 5 min de lectura': '09 jul 2026 · 5 min read',
    '03 jul 2026 · 7 min de lectura': '03 jul 2026 · 7 min read',
    '30 jun 2026 · 4 min de lectura': '30 jun 2026 · 4 min read',
    '26 jun 2026 · 4 min de lectura': '26 jun 2026 · 4 min read',
    '19 jun 2026 · 6 min de lectura': '19 jun 2026 · 6 min read',
    '12 jun 2026 · 4 min de lectura': '12 jun 2026 · 4 min read',
    '05 jun 2026 · 6 min de lectura': '05 jun 2026 · 6 min read',
    '29 may 2026 · 4 min de lectura': '29 may 2026 · 4 min read',
    '← Anterior · S27': '← Previous · W27',
    '← Anterior · S26b': '← Previous · W26b',
    '← Anterior · S26': '← Previous · W26',
    '← Anterior · S25': '← Previous · W25',
    '← Anterior · S24': '← Previous · W24',
    '← Anterior · S23': '← Previous · W23',
    '← Anterior · S22': '← Previous · W22',

    // Etiquetas de las publicaciones
    'Infiltraciones': 'Joint injections',
    'Corticoides': 'Corticosteroids',
    'Congresos': 'Congresses',
    'Post-sesión': 'After the session',
    // "Glucose 5%" y no "5% glucose": la etiqueta del post y el texto del
    // cuerpo ("Glucosa al 5%") tienen que dar traducciones DISTINTAS, si no
    // REV — el diccionario inverso — colapsa las dos claves en una y volver a
    // español rompe una de las dos.
    'Glucosa 5%': 'Glucose 5%',
    'Sesiones': 'Sessions',
    'Tratamiento': 'Treatment',
    'Artrosis': 'Osteoarthritis',

    // Cuerpo de las publicaciones
    'Es una de las preguntas que más se repiten en el consultorio, y entiendo la frustración detrás: pasaste por una infiltración, hubo alivio, y a los meses el dolor volvió como si nada. Vale la pena entender por qué pasa eso antes de hablar de PIT.': 'It is one of the questions I hear most in the practice, and I understand the frustration behind it: you had an injection, there was relief, and months later the pain came back as if nothing had happened. It is worth understanding why that happens before talking about PIT.',
    'Por qué el alivio del corticoide se agota': 'Why relief from corticosteroids runs out',
    'El corticoide apaga la inflamación del tejido, pero no actúa sobre el nervio periférico sensibilizado — que en el dolor crónico suele ser el verdadero origen. Cuando el efecto antiinflamatorio termina, el nervio sigue irritado y el dolor reaparece.': 'Corticosteroids switch off inflammation in the tissue, but they do not act on the sensitized peripheral nerve — which in chronic pain is usually the real origin. When the anti-inflammatory effect wears off, the nerve is still irritated and the pain returns.',
    'Qué puede aportar PIT en este caso': 'What PIT can contribute in this case',
    'PIT trabaja exactamente en ese punto: desinflamar el nervio sensibilizado con inyecciones subcutáneas de glucosa al 5%. No compite con la infiltración previa ni interfiere con otros tratamientos en curso.': 'PIT works exactly on that point: calming the sensitized nerve with subcutaneous injections of 5% glucose. It does not compete with the earlier injection nor interfere with other ongoing treatments.',
    'Que una infiltración haya dejado de funcionar no significa que tu dolor no tenga tratamiento: significa que quizás el objetivo era otro.': 'An injection that stopped working does not mean your pain has no treatment: it may mean the target was a different one.',
    'Cuándo PIT no es la respuesta': 'When PIT is not the answer',
    'No todo dolor es de origen neuropático periférico. Por eso la primera sesión empieza siempre con una evaluación: si tu caso no es para PIT, también te lo voy a decir.': 'Not all pain is of peripheral neuropathic origin. That is why the first session always starts with an assessment: if your case is not one for PIT, I will tell you that too.',
    'Mapeo de ramas nerviosas · Consultorio': 'Mapping of nerve branches · Practice',
    'Caso clínico comentado: paciente de 52 años, corredor recreativo (30–40 km semanales), con gonalgia bilateral de 14 meses de evolución que no cedió con kinesiología ni antiinflamatorios.': 'Annotated clinical case: 52-year-old patient, recreational runner (30–40 km a week), with 14 months of bilateral knee pain that did not respond to physiotherapy or anti-inflammatories.',
    'El alivio en la misma sesión no es solo terapéutico: es parte del razonamiento diagnóstico.': 'Relief within the same session is not only therapeutic: it is part of the diagnostic reasoning.',
    'Lo que más preguntaron los colegas': 'What colleagues asked about most',
    'El interés por las técnicas mínimamente invasivas para dolor crónico crece cada año — y la pregunta ya no es "¿funciona?" sino "¿cómo me formo?".': 'Interest in minimally invasive techniques for chronic pain grows every year — and the question is no longer “does it work?” but “how do I train in it?”.',
    'Después de una sesión de PIT la mayoría de los pacientes retoma su rutina normal el mismo día. Aun así, hay algunas pautas simples que ayudan a que el tratamiento asiente mejor.': 'After a PIT session most patients go back to their normal routine the same day. Even so, a few simple guidelines help the treatment settle better.',
    'La regla general: movete con normalidad, sin exigencia máxima, y dejá que el alivio se consolide solo.': 'The general rule: move normally, without pushing to your limit, and let the relief settle on its own.',
    'Qué encontró': 'What it found',
    'Los límites que hay que decir': 'The limits worth stating',
    'Sin sobrevender: la evidencia es creciente pero heterogénea, y decirlo también es hacer buena medicina.': 'Without overselling: the evidence is growing but heterogeneous, and saying so is also good medicine.',
    'La respuesta corta: desde la primera sesión ya tenemos información valiosa, porque el alivio inmediato es parte del diagnóstico.': 'The short answer: from the very first session we already have valuable information, because immediate relief is part of the diagnosis.',
    'Es importante ser claros: PIT no regenera el cartílago ni revierte la artrosis. Pero buena parte del dolor que acompaña a la artrosis no viene del cartílago — que no tiene terminales de dolor — sino de los nervios periféricos sensibilizados alrededor de la articulación.': 'It is important to be clear: PIT does not regenerate cartilage or reverse osteoarthritis. But much of the pain that comes with osteoarthritis does not come from the cartilage — which has no pain endings — but from the sensitized peripheral nerves around the joint.',
    'El objetivo no es la imagen de la radiografía: es cómo caminás, dormís y vivís con esa rodilla.': 'The goal is not the image on the X-ray: it is how you walk, sleep and live with that knee.',

    // Placeholders de contenido pendiente en las publicaciones
    'Placeholder · Desarrollo completo de Ricardo (2–3 párrafos)': 'Placeholder · Full text from Ricardo (2–3 paragraphs)',
    'Placeholder · Desarrollo completo de Ricardo': 'Placeholder · Full text from Ricardo',
    'Placeholder · Desarrollo del caso por Ricardo — anamnesis, mapeo, evolución por sesión, imágenes': 'Placeholder · Case write-up by Ricardo — history, mapping, session-by-session progress, images',
    'Placeholder · Desarrollo del caso por Ricardo — mecanismo del latigazo, mapeo, evolución': 'Placeholder · Case write-up by Ricardo — whiplash mechanism, mapping, progress',
    'Placeholder · Cierre y aprendizajes del caso': 'Placeholder · Closing notes and takeaways from the case',
    'Placeholder · Crónica de Ricardo sobre la presentación — 3–4 párrafos, fotos del congreso': 'Placeholder · Ricardo’s report on the presentation — 3–4 paragraphs, photos from the congress',
    'Placeholder · Las 3 preguntas más repetidas en el auditorio, con respuestas cortas': 'Placeholder · The 3 most repeated questions from the audience, with short answers',
    'Placeholder · Guía completa de Ricardo — actividad recomendada, molestias esperables, cuándo consultar': 'Placeholder · Full guide from Ricardo — recommended activity, expected discomfort, when to seek advice',
    'Placeholder · Cita completa de la revisión (autores, revista, año, DOI)': 'Placeholder · Full citation of the review (authors, journal, year, DOI)',
    'Placeholder · Síntesis de resultados por Ricardo': 'Placeholder · Summary of results by Ricardo',
    'Placeholder · Lectura crítica — heterogeneidad, tamaños muestrales, comparadores': 'Placeholder · Critical appraisal — heterogeneity, sample sizes, comparators',
    'Placeholder · Desarrollo completo de Ricardo — qué esperar sesión a sesión, cuándo se decide continuar': 'Placeholder · Full text from Ricardo — what to expect session by session, when the decision to continue is made',

    // ══ RESTO DEL SITIO ═══════════════════════════════════════════════════
    // Cobertura PARCIAL: son las claves que seguían siendo válidas contra el
    // HTML actual. Estas páginas todavía no están traducidas al 100%.
    'Glucosa al 5%': '5% glucose',
    'Cómo es una sesión': 'What a session is like',
    'Evaluación y mapeo': 'Assessment and mapping',
    'Inyecciones subcutáneas': 'Subcutaneous injections',
    'Plan de tratamiento': 'Treatment plan',
    'Para profesionales de la salud': 'For health professionals',
    'El mecanismo, con el rigor que esperás.': 'The mechanism, with the rigor you expect.',
    'Evidencia científica publicada': 'Published scientific evidence',
    'Apuntes de PIT — 80 páginas, gratis': 'PIT study notes — 80 pages, free',
    'Curso introductorio gratuito': 'Free introductory course',
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
    'Lo que dicen los alumnos': 'What students say',
    'Empezá hoy. El acceso es tuyo para siempre.': 'Start today. The access is yours forever.',
    'Trayectoria': 'Career',
    'Congresos y prensa': 'Congresses and press',
    'Dónde ejerce, enseña y se formó': 'Where he practices, teaches and trained',
    'Fundador · Escuela de PIT': 'Founder · Escuela de PIT',
    'Funda la Escuela de PIT': 'Founds Escuela de PIT',
    'Qué dice la literatura — y qué dice la clínica.': 'What the literature says — and what the clinic says.',
    'Descargar referencias (PDF) ↓': 'Download references (PDF) ↓',
    'Lo que más nos preguntan.': 'What we get asked the most.',
    '¿Tiene efectos secundarios o contraindicaciones?': 'Are there side effects or contraindications?',
    '¿Es compatible con otros tratamientos que ya estoy haciendo?': 'Is it compatible with treatments I am already doing?',
    '¿Lo cubre mi obra social o prepaga?': 'Is it covered by my health insurance?',
    '¿Necesito formación previa en proloterapia?': 'Do I need prior training in prolotherapy?',
    '¿Qué materiales necesito para empezar a aplicar PIT?': 'What materials do I need to start applying PIT?',
    '¿El certificado del curso me habilita a ejercer la técnica?': 'Does the course certificate license me to practice the technique?',
    'El consultorio queda en Belgrano.': 'The practice is in Belgrano.',
    'Dirección': 'Address',
    'Horarios': 'Hours',
    'Escribinos': 'Write to us',
    'Nombre': 'Name',
    'Tu nombre': 'Your name',
    'Mensaje': 'Message',
    'Escribí tu consulta': 'Write your enquiry',
    'Enviar mensaje →': 'Send message →',
    'Paciente': 'Patient',
    'Profesional de la salud': 'Health professional',
    'Otro': 'Other',
    'Privacidad y aviso médico.': 'Privacy & medical notice.',
    'Qué datos guardamos': 'What data we keep',
    'Para qué los usamos': 'What we use it for',
    'Cómo darte de baja': 'How to unsubscribe',
    'Aviso médico': 'Medical notice',
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
