// PIT — toggle de idioma ES/EN (referencia: Home)
// Traduce nodos de texto y placeholders según el diccionario. Persiste en localStorage.
(function () {
  var DICT = {
    // Nav
    'Qué es PIT': 'What is PIT',
    'Contenido': 'Content',
    'Foro': 'Forum',
    'Curso': 'Course',
    'Contacto': 'Contact',
    'Apuntes gratis': 'Free notes',
    // Hero
    'Aliviar el dolor crónico desde el nervio.': 'Relieve chronic pain at its source: the nerve.',
    'PIT (neuroproloterapia) es un tratamiento complementario para el dolor crónico: actúa donde nace el dolor, sin interferir con otros tratamientos en curso.': 'PIT (neuroprolotherapy) is a complementary treatment for chronic pain: it acts where pain originates, without interfering with any ongoing treatment.',
    'Qué es PIT →': 'What is PIT →',
    'Apuntes gratis (PDF)': 'Free notes (PDF)',
    'SESIÓN DE PIT · CONSULTORIO · BUENOS AIRES': 'PIT SESSION · PRACTICE · BUENOS AIRES',
    // Bifurcación
    '¿Quién sos?': 'Who are you?',
    'Para pacientes': 'For patients',
    'Tengo dolor crónico': 'I live with chronic pain',
    'Entendé por qué persiste tu dolor, cómo funciona PIT y si tiene sentido para tu caso — explicado en lenguaje claro.': 'Understand why your pain persists, how PIT works and whether it makes sense for your case — in plain language.',
    'Entender mi dolor →': 'Understand my pain →',
    'Para profesionales': 'For professionals',
    'Soy profesional de la salud': 'I am a health professional',
    'Mecanismo de acción, evidencia publicada y técnica — con casos clínicos reales filmados en consultorio.': 'Mechanism of action, published evidence and technique — with real clinical cases filmed in practice.',
    'Conocer la técnica →': 'Learn the technique →',
    // Cómo funciona
    'Cómo funciona': 'How it works',
    'Una técnica que actúa donde nace el dolor.': 'A technique that acts where pain is born.',
    'El nervio se sensibiliza': 'The nerve becomes sensitized',
    'Cuando un nervio periférico se inflama de forma crónica, pierde su capacidad de regulación y el dolor persiste.': 'When a peripheral nerve becomes chronically inflamed, it loses its ability to self-regulate and pain persists.',
    'Glucosa al 5%': '5% glucose',
    'Inyecciones subcutáneas mínimamente invasivas desinflaman el nervio sensibilizado y restauran su función.': 'Minimally invasive subcutaneous injections reduce nerve inflammation and restore its function.',
    'El dolor cede': 'Pain subsides',
    'Alivio desde la primera sesión. Tratamiento típico de 4 a 8 sesiones, compatible con cualquier tratamiento en curso.': 'Relief from the first session. Typical treatment: 4 to 8 sessions, compatible with any ongoing treatment.',
    'Lumbalgia': 'Low back pain',
    'Rodilla': 'Knee',
    'Cervical': 'Neck',
    'Hombro': 'Shoulder',
    'Más patologías': 'More conditions',
    // Contenido gratuito
    'Contenido gratuito': 'Free content',
    'Aprendé sobre PIT, sin costo.': 'Learn about PIT, at no cost.',
    'Ver todo →': 'View all →',
    'Curso gratis': 'Free course',
    'Introducción a PIT — gratis': 'Introduction to PIT — free',
    'Qué es el método, cómo funciona y qué esperar de un tratamiento, explicado por el Dr. Frusso. Sin costo y sin registro.': 'What the method is, how it works and what to expect from treatment, explained by Dr. Frusso. Free, no sign-up.',
    'Empezar ahora →': 'Start now →',
    '80 páginas': '80 pages',
    'Apuntes de PIT — sin registro': 'PIT study notes — no sign-up',
    'Anatomía, técnica y puntos de inyección para cada región del cuerpo. Elaborado por el Dr. Frusso junto al Dr. Pigerl Heno.': 'Anatomy, technique and injection points for each body region. Written by Dr. Frusso with Dr. Pigerl Heno.',
    'Descargar →': 'Download →',
    'Caso clínico': 'Clinical case',
    'Lumbalgia crónica: tratamiento sin cortes': 'Chronic low back pain: treatment, uncut',
    'Paciente real, filmado en consultorio: técnica, conversación y seguimiento.': 'A real patient, filmed in practice: technique, conversation and follow-up.',
    'El método, explicado por quien lo enseña': 'The method, explained by the one who teaches it',
    'Introducción al PIT con el Dr. Ricardo D. Frusso.': 'An introduction to PIT with Dr. Ricardo D. Frusso.',
    'Evidencia': 'Evidence',
    'Referencias científicas del método': 'Scientific references behind the method',
    'Ensayos, estudios comparativos y revisiones, con la lectura clínica del Dr. Frusso.': "Trials, comparative studies and reviews, with Dr. Frusso's clinical reading.",
    'Artículos': 'Articles',
    'Notas sobre el método y el dolor': 'Notes on the method and pain',
    '¿Duelen las inyecciones? ¿Cuántas sesiones necesito? Respuestas en lenguaje claro.': 'Do the injections hurt? How many sessions do I need? Answers in plain language.',
    'Preguntas frecuentes': 'FAQ',
    'Lo que más nos preguntan': 'What we get asked the most',
    'Para pacientes y profesionales: indicaciones, seguridad y compatibilidad.': 'For patients and professionals: indications, safety and compatibility.',
    'Casos y técnica desde el consultorio': 'Cases and technique from the practice',
    'Contenido clínico y actualizaciones en @drfrussoricardo.': 'Clinical content and updates at @drfrussoricardo.',
    // Foro teaser
    'Foro PIT · Cada semana': 'PIT Forum · Every week',
    'Ricardo responde, todas las semanas.': 'Ricardo answers, every week.',
    'Preguntas de pacientes y profesionales, casos clínicos comentados y evidencia nueva. Enviá tu pregunta: se modera y se publica sin datos personales.': 'Questions from patients and professionals, annotated clinical cases and new evidence. Send your question: it is moderated and published without personal data.',
    'Ir al foro →': 'Go to the forum →',
    'Enviar pregunta': 'Send a question',
    'ESTA SEMANA': 'THIS WEEK',
    '"Me infiltraron con corticoides y volvió el dolor. ¿PIT puede ayudarme?"': '"I had corticosteroid injections and the pain came back. Can PIT help me?"',
    'Gonalgia bilateral en corredor de 52 años: mapeo y evolución en 5 sesiones': 'Bilateral knee pain in a 52-year-old runner: mapping and progress over 5 sessions',
    'Qué hacer (y qué no) el día después de una sesión de PIT': 'What to do (and not do) the day after a PIT session',
    // Respaldo
    'Quién lo enseña': 'Who teaches it',
    '30+ años acompañando el dolor crónico.': '30+ years working with chronic pain.',
    'El Dr. Ricardo D. Frusso es Médico de Familia (UBA, 1992) con más de tres décadas en el Hospital Italiano de Buenos Aires. Pionero en Argentina en la aplicación de PIT, formado por el Dr. John Lyftogt — creador del método — e instructor autorizado para América Latina desde 2015.': 'Dr. Ricardo D. Frusso is a Family Physician (UBA, 1992) with over three decades at the Hospital Italiano de Buenos Aires. A pioneer of PIT in Argentina, trained by Dr. John Lyftogt — creator of the method — and certified instructor for Latin America since 2015.',
    'HIBA · Reumatología': 'HIBA · Rheumatology',
    'Instructor autorizado': 'Certified instructor',
    'Sobre el Dr. Frusso →': 'About Dr. Frusso →',
    // Instagram
    'El consultorio, en tu feed.': 'The practice, in your feed.',
    'Seguir →': 'Follow →',
    'Mapeo de ramas nerviosas en gonalgia crónica': 'Mapping nerve branches in chronic knee pain',
    'Reel · Técnica': 'Reel · Technique',
    'Lumbalgia: qué esperar de la primera sesión': 'Low back pain: what to expect from your first session',
    'Post · Pacientes': 'Post · Patients',
    'Presentando PIT en el congreso de medicina familiar': 'Presenting PIT at the family medicine congress',
    'Post · Congresos': 'Post · Congresses',
    'Materiales: qué se usa (y qué no) en PIT': 'Materials: what is used (and what is not) in PIT',
    'Reel · Método': 'Reel · Method',
    'Los viernes · La publicación del foro también sale en Instagram': 'Fridays · The forum post is also published on Instagram',
    // Newsletter
    'Novedades del método, sin spam.': 'Method updates, no spam.',
    'Avisamos cuando hay contenido nuevo, evidencia publicada o actualizaciones de la técnica.': 'We let you know when there is new content, published evidence or technique updates.',
    'tu@email.com': 'you@email.com',
    'Suscribirme': 'Subscribe',
    // Curso (cierre)
    '¿Querés profundizar?': 'Want to go deeper?',
    'Curso PIT · Módulo I — Lumbalgia y Rodilla': 'PIT Course · Module I — Low Back & Knee',
    'Casos clínicos reales filmados en consultorio, sin cortes. Acceso permanente, certificado de aprobación emitido por un instructor autorizado.': 'Real clinical cases filmed in practice, uncut. Lifetime access, certificate of approval issued by a certified instructor.',
    'Ver el curso →': 'View the course →',
    'USD 97.99 · PAGO ÚNICO': 'USD 97.99 · ONE-TIME PAYMENT',
    // Footer
    'Neuroproloterapia · PIT · Dolor crónico': 'Neuroprolotherapy · PIT · Chronic pain',
    'Privacidad y aviso médico': 'Privacy & medical notice',
    // --- Páginas internas (chrome común + títulos) ---
    'Enviar pregunta →': 'Send a question →',
    'Preguntar en el foro →': 'Ask in the forum →',
    'Pedir una consulta →': 'Request a consultation →',
    'Leer la respuesta →': 'Read the answer →',
    'Archivo completo →': 'Full archive →',
    'Volver al sitio': 'Back to site',
    // Qué es PIT
    'El dolor crónico se trata donde nace: en el nervio.': 'Chronic pain is treated where it is born: at the nerve.',
    'Soy paciente ↓': 'I am a patient ↓',
    'Soy profesional de la salud ↓': 'I am a health professional ↓',
    'Entender tu dolor es el primer paso.': 'Understanding your pain is the first step.',
    'Cómo es una sesión': 'What a session is like',
    'Evaluación y mapeo': 'Assessment and mapping',
    'Inyecciones subcutáneas': 'Subcutaneous injections',
    'Alivio inmediato': 'Immediate relief',
    'Plan de tratamiento': 'Treatment plan',
    'Para profesionales de la salud': 'For health professionals',
    'El mecanismo, con el rigor que esperás.': 'The mechanism, with the rigor you expect.',
    'Evidencia científica publicada': 'Published scientific evidence',
    'Apuntes de PIT — 80 páginas, gratis': 'PIT study notes — 80 pages, free',
    'Curso introductorio gratuito': 'Free introductory course',
    'Formarme en PIT →': 'Train in PIT →',
    'La técnica, en imágenes': 'The technique, in pictures',
    'Preguntas frecuentes →': 'FAQ →',
    'O preguntale a Ricardo en el foro': 'Or ask Ricardo in the forum',
    // Curso Módulo I
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
    // Sobre
    'Sobre el Dr. Frusso': 'About Dr. Frusso',
    'Trayectoria': 'Career',
    'Congresos y prensa': 'Congresses and press',
    'Leer el foro semanal': 'Read the weekly forum',
    // Evidencia
    'Evidencia científica': 'Scientific evidence',
    'Qué dice la literatura — y qué dice la clínica.': 'What the literature says — and what the clinic says.',
    'Descargar referencias (PDF) ↓': 'Download references (PDF) ↓',
    // FAQ
    'Lo que más nos preguntan.': 'What we get asked the most.',
    '¿Duelen las inyecciones?': 'Do the injections hurt?',
    '¿Cuántas sesiones voy a necesitar?': 'How many sessions will I need?',
    '¿Tiene efectos secundarios o contraindicaciones?': 'Are there side effects or contraindications?',
    '¿Es compatible con otros tratamientos que ya estoy haciendo?': 'Is it compatible with treatments I am already doing?',
    '¿Lo cubre mi obra social o prepaga?': 'Is it covered by my health insurance?',
    '¿Necesito formación previa en proloterapia?': 'Do I need prior training in prolotherapy?',
    '¿Qué materiales necesito para empezar a aplicar PIT?': 'What materials do I need to start applying PIT?',
    '¿El certificado del curso me habilita a ejercer la técnica?': 'Does the course certificate license me to practice the technique?',
    '¿Tu pregunta no está acá? Ricardo responde una por semana en el foro.': 'Your question is not here? Ricardo answers one per week in the forum.',
    // Contacto
    'Contacto y turnos': 'Contact & appointments',
    'El consultorio queda en Belgrano.': 'The practice is in Belgrano.',
    'Dirección': 'Address',
    'Horarios': 'Hours',
    'Escribinos': 'Write to us',
    'Nombre': 'Name',
    'Tu nombre': 'Your name',
    'Mensaje': 'Message',
    'Enviar mensaje →': 'Send message →',
    'Paciente': 'Patient',
    'Profesional de la salud': 'Health professional',
    'Otro': 'Other',
    // Privacidad
    'Privacidad y aviso médico.': 'Privacy & medical notice.',
    'Qué datos guardamos': 'What data we keep',
    'Para qué los usamos': 'What we use it for',
    'Cómo darte de baja': 'How to unsubscribe',
    'Aviso médico': 'Medical notice',
    // --- Home v2 (Docshield) ---
    'Aliviar el dolor crónico desde el nervio': 'Relieve chronic pain at its source: the nerve',
    'PIT es un tratamiento mínimamente invasivo que actúa donde nace el dolor. Alivio desde la primera sesión, sin interferir con otros tratamientos en curso.': 'PIT is a minimally invasive treatment that acts where pain originates. Relief from the first session, without interfering with any ongoing treatment.',
    'Pedir una consulta': 'Request a consultation',
    // Franja de respaldos: el rótulo y las credenciales de cada logo.
    // Hay dos rótulos porque la franja aparece en dos contextos: en la home
    // habla de respaldos; en la biografía describe el vínculo de Ricardo.
    'Práctica y formación respaldadas por': 'Practice and training backed by',
    'Dónde ejerce, enseña y se formó': 'Where he practices, teaches and trained',
    'Fundador · Escuela de PIT': 'Founder · Escuela de PIT',
    'Funda la Escuela de PIT': 'Founds Escuela de PIT',
    'Práctica clínica · 30+ años': 'Clinical practice · 30+ years',
    'Área de dolor · Cursos PIT': 'Pain unit · PIT courses',
    'Instructor autorizado': 'Certified instructor',
    'Fundador · Formación en PIT': 'Founder · PIT training',
    'Formación · 1992': 'Medical degree · 1992',
    'Años de práctica clínica': 'Years of clinical practice',
    'Instructor autorizado desde': 'Certified instructor since',
    'Regiones del cuerpo tratadas': 'Body regions treated',
    'De apuntes, gratis': 'Of study notes, free',
    'La misma técnica, explicada para vos': 'The same technique, explained for you',
    'Qué trata PIT': 'What PIT treats',
    'Elegí dónde te duele': 'Choose where it hurts',
    'Sesiones típicas': 'Typical sessions',
    'Duración de cada sesión': 'Length of each session',
    'Primer alivio': 'First relief',
    'En la misma sesión': 'In the same session',
    'Cómo es una sesión →': 'What a session is like →',
    'Valores orientativos · Cada caso requiere evaluación individual': 'Indicative values · Each case requires individual assessment',
    'Aprendé sobre PIT, sin costo': 'Learn about PIT, at no cost',
    'Introducción a PIT': 'Introduction to PIT',
    'El método explicado por el Dr. Frusso. Sin costo y sin registro.': 'The method explained by Dr. Frusso. Free, no sign-up.',
    'Anatomía, técnica y puntos de inyección para cada región.': 'Anatomy, technique and injection points for each region.',
    'Ricardo responde': 'Ricardo answers',
    'Enviá tu pregunta: se modera y se publica sin datos personales.': 'Send your question: it is moderated and published without personal data.',
    'La diferencia': 'The difference',
    'de tratar el nervio': 'of treating the nerve',
    'Ver todas las preguntas →': 'See all questions →',
    '¿Es compatible con otros tratamientos?': 'Is it compatible with other treatments?',
    '¿Tiene efectos secundarios?': 'Are there side effects?',
    'Casos clínicos reales filmados en consultorio, sin cortes. Acceso permanente y certificado emitido por un instructor autorizado.': 'Real clinical cases filmed in practice, uncut. Lifetime access and a certificate issued by a certified instructor.',
    'Tratamiento del dolor crónico, desde el nervio, en cada etapa': 'Chronic pain treatment, from the nerve, at every stage',
    'Curso gratis': 'Free course',
    'Evidencia científica': 'Scientific evidence',
    'Foro semanal': 'Weekly forum',
    'Apuntes (PDF)': 'Study notes (PDF)',
    'Ver versión actual': 'View current version'
  };

  var REV = {};
  Object.keys(DICT).forEach(function (k) { REV[DICT[k]] = k; });

  function apply(lang) {
    var map = lang === 'en' ? DICT : REV;
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
