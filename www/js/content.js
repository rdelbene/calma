/* Contenido de Calma.
   Estados de ánimo: ansiedad, acelerada, triste, estres, enojo, dormir, bien
   Cada frase: [categoría, texto, [estados]] */

window.MOODS = [
  { id: 'ansiedad',  label: 'Con ansiedad',        sub: 'Algo me inquieta',
    suggest: ['grounding', 'resp-caja'] },
  { id: 'acelerada', label: 'Con la cabeza a mil', sub: 'No paro de pensar',
    suggest: ['resp-calma', 'meditar'] },
  { id: 'triste',    label: 'Triste',              sub: 'Me siento bajón',
    suggest: ['relajacion', 'gratitud'],
    note: 'Si la tristeza se hace muy pesada o dura mucho, hablar con alguien de confianza o con un profesional puede ayudar mucho.' },
  { id: 'estres',    label: 'Cansado o estresado', sub: 'Demasiadas cosas',
    suggest: ['relajacion', 'resp-dormir'] },
  { id: 'enojo',     label: 'Enojado',             sub: 'Algo me molestó',
    suggest: ['resp-calma', 'grounding'] },
  { id: 'dormir',    label: 'Sin poder dormir',    sub: 'Quiero descansar',
    suggest: ['resp-dormir', 'modo-dormir'] },
  { id: 'bien',      label: 'Bien',                sub: 'Quiero cuidar esta calma',
    suggest: ['gratitud', 'meditar'] }
];

window.SUGGESTIONS = {
  'grounding':   { label: 'Ejercicio 5-4-3-2-1',    sub: 'Volver al presente con los sentidos' },
  'resp-caja':   { label: 'Respiración en caja',    sub: '4 · 4 · 4 · 4' },
  'resp-calma':  { label: 'Respiración calma',      sub: 'Exhalar largo baja el ritmo' },
  'resp-dormir': { label: 'Respiración para dormir', sub: '4 · 7 · 8' },
  'relajacion':  { label: 'Relajación guiada',      sub: 'Una voz te acompaña a aflojar el cuerpo' },
  'meditar':     { label: 'Meditar 5 minutos',      sub: 'Con campana al empezar y al terminar' },
  'gratitud':    { label: 'Diario de gratitud',     sub: 'Anotá algo bueno de hoy' },
  'modo-dormir': { label: 'Modo dormir con lluvia', sub: 'Sonido suave que se apaga solo' }
};

window.FRASES = [
  // Ahora / presente
  ['Ahora', 'Este momento es suficiente. No tenés que resolver todo hoy.', ['ansiedad','acelerada','estres']],
  ['Ahora', 'Lo único que existe de verdad es este respiro. Quedate en él.', ['ansiedad','acelerada']],
  ['Ahora', 'El pasado ya pasó y el futuro todavía no llegó. Acá, ahora, estás bien.', ['ansiedad','acelerada']],
  ['Ahora', 'No hace falta llegar a ningún lado en este momento.', ['estres','acelerada','dormir']],
  ['Ahora', 'Mirá a tu alrededor y nombrá tres cosas que ves. Volviste al presente.', ['ansiedad']],
  ['Ahora', 'Lo que estás sintiendo es real, y también es pasajero.', ['ansiedad','triste','enojo']],
  ['Ahora', 'En este instante no hay nada que tengas que arreglar.', ['acelerada','dormir']],
  ['Ahora', 'Estás a salvo en este momento. Tu cuerpo lo puede aprender de a poco.', ['ansiedad']],

  // Mente
  ['Mente', 'Los pensamientos son como nubes: pasan. Vos sos el cielo.', ['acelerada','ansiedad']],
  ['Mente', 'No tenés que creerle a cada pensamiento que aparece.', ['ansiedad','acelerada','triste']],
  ['Mente', 'Una mente agitada es como agua turbia: si la dejás quieta, se aclara sola.', ['acelerada','enojo']],
  ['Mente', 'Podés observar lo que sentís sin pelearte con eso.', ['ansiedad','enojo','triste']],
  ['Mente', 'Preocuparte no cambia el mañana, pero sí le quita paz al hoy.', ['ansiedad','dormir']],
  ['Mente', 'Cuando la mente corre, el cuerpo puede ir despacio. Empezá por ahí.', ['acelerada','estres']],
  ['Mente', 'No todo lo que pensás necesita una respuesta ahora.', ['acelerada','dormir']],
  ['Mente', 'Los pensamientos de la noche parecen más grandes de lo que son. Mañana se ven distinto.', ['dormir']],
  ['Mente', 'Podés dejar las preocupaciones en la puerta. Mañana van a seguir ahí, si las necesitás.', ['dormir','estres']],
  ['Mente', 'Nombrar lo que sentís ya le quita fuerza. “Esto es ansiedad, y va a pasar.”', ['ansiedad']],
  ['Mente', 'No tenés que entenderlo todo para sentirte mejor.', ['triste','acelerada']],

  // Soltar
  ['Soltar', 'Soltar no es rendirse. Es dejar de cargar lo que no te toca.', ['estres','enojo']],
  ['Soltar', 'Hay cosas que no dependen de vos. Esas, dejalas ir.', ['ansiedad','enojo','estres']],
  ['Soltar', 'Aflojá los hombros. Aflojá la mandíbula. Aflojá un poco el control.', ['estres','enojo','ansiedad']],
  ['Soltar', 'No tenés que tener todas las respuestas para estar en paz.', ['acelerada','ansiedad']],
  ['Soltar', 'Lo que te pesa hoy no es para siempre.', ['triste','estres']],
  ['Soltar', 'Perdonar también es una forma de descansar.', ['enojo']],
  ['Soltar', 'El enojo es una señal, no una orden. Podés escucharlo sin obedecerlo.', ['enojo']],
  ['Soltar', 'Antes de responder, respirá. La mejor respuesta casi nunca es la primera.', ['enojo']],
  ['Soltar', 'No hace falta ganar todas las discusiones. Tu paz vale más.', ['enojo']],
  ['Soltar', 'Por hoy ya hiciste suficiente. Lo que falta puede esperar.', ['estres','dormir']],

  // Cuerpo
  ['Cuerpo', 'Tu respiración siempre está con vos. Es tu lugar seguro.', ['ansiedad','triste']],
  ['Cuerpo', 'Sentí el peso de tu cuerpo apoyado. Algo te sostiene.', ['ansiedad','dormir']],
  ['Cuerpo', 'Exhalar largo le dice a tu cuerpo que no hay peligro.', ['ansiedad','enojo','dormir']],
  ['Cuerpo', 'Poné una mano en el pecho. Sentí cómo sube y baja. Estás acá.', ['ansiedad','triste']],
  ['Cuerpo', 'Tomate un vaso de agua, despacio. A veces la calma empieza por algo simple.', ['estres','ansiedad']],
  ['Cuerpo', 'Tu cuerpo hizo mucho hoy. Se merece descansar.', ['dormir','estres']],
  ['Cuerpo', 'Soltá la lengua del paladar, aflojá la frente. Ahí también se guarda tensión.', ['estres','dormir','enojo']],
  ['Cuerpo', 'Salir a caminar diez minutos puede cambiarte el día.', ['triste','acelerada','enojo']],
  ['Cuerpo', 'Dormir no es algo que se fuerza. Alcanza con descansar los ojos.', ['dormir']],

  // Vos
  ['Vos', 'Sos más que lo que estás sintiendo en este momento.', ['triste','ansiedad','enojo']],
  ['Vos', 'Tratate con la misma paciencia que le tendrías a alguien que querés.', ['triste','estres']],
  ['Vos', 'Está bien ir despacio. Está bien descansar.', ['estres','triste','dormir']],
  ['Vos', 'No tenés que ser perfecto para merecer tranquilidad.', ['estres','triste']],
  ['Vos', 'Ya superaste días difíciles antes. Este también va a pasar.', ['triste','ansiedad']],
  ['Vos', 'Hacer menos a veces es exactamente lo que necesitás.', ['estres']],
  ['Vos', 'Tu paz es importante. Cuidarla no es egoísmo.', ['estres','bien']],
  ['Vos', 'Está bien no estar bien. No tenés que disimularlo con vos mismo.', ['triste']],
  ['Vos', 'Pedir ayuda también es una forma de cuidarte.', ['triste','estres']],
  ['Vos', 'Hablale a tu tristeza como a un amigo: con paciencia y sin apuro.', ['triste']],
  ['Vos', 'Un día difícil no te hace una persona débil.', ['triste','estres']],
  ['Vos', 'Mañana es otra oportunidad. Esta noche, solo descansá.', ['dormir','triste']],
  ['Vos', 'No sos tus errores. Sos lo que hacés con ellos.', ['triste','enojo']],

  // Paz
  ['Paz', 'La paz no es la ausencia de problemas, es la calma en medio de ellos.', ['ansiedad','estres','bien']],
  ['Paz', 'Un paso a la vez. Una respiración a la vez.', ['ansiedad','estres','acelerada']],
  ['Paz', 'La calma no se busca afuera: se encuentra cuando dejás de correr.', ['acelerada','bien']],
  ['Paz', 'El silencio también es una respuesta.', ['enojo','bien']],
  ['Paz', 'La tranquilidad se practica, como cualquier otra cosa. Hoy es un buen día para practicar.', ['bien']],
  ['Paz', 'Lo simple también es valioso: un rato de sol, una charla, un té caliente.', ['bien','triste']],
  ['Paz', 'Así como el río no empuja, fluye. Podés hacer lo mismo.', ['acelerada','estres','bien']],
  ['Paz', 'No todo merece tu energía. Elegí en qué ponerla.', ['enojo','estres']],
  ['Paz', 'Agradecé una cosa pequeña de hoy. Solo una.', ['bien','triste']],
  ['Paz', 'Todo lo que necesitás en este instante ya está acá.', ['bien','ansiedad']],
  ['Paz', 'Cuando estás en calma, todo se ve un poco más claro.', ['bien','enojo']],
  ['Paz', 'Cuidá esta sensación. Volvé a ella cuando la necesites.', ['bien']],
  ['Paz', 'La noche es para soltar. Dejá que el día termine.', ['dormir']],
  ['Paz', 'Respirá lento, como si el aire fuera tibio y no hubiera apuro.', ['dormir','ansiedad']],
  ['Paz', 'Hay belleza en las cosas que pasan despacio.', ['bien','acelerada']],
  ['Paz', 'Tu calma también le hace bien a los que te rodean.', ['bien','enojo']],

  // Esperanza
  ['Esperanza', 'Después de la tormenta, el cielo siempre se despeja.', ['triste','ansiedad']],
  ['Esperanza', 'Las cosas pueden mejorar, aunque hoy no lo parezca.', ['triste']],
  ['Esperanza', 'Cada respiración es un pequeño comienzo.', ['triste','ansiedad','bien']],
  ['Esperanza', 'No necesitás ver todo el camino. Alcanza con el próximo paso.', ['ansiedad','estres']],
  ['Esperanza', 'Lo que hoy duele, mañana puede enseñarte algo.', ['triste']],
  ['Esperanza', 'Hay más cosas buenas esperándote de las que imaginás.', ['triste','bien']]
];

window.GROUNDING = [
  { n: 5, what: 'cosas que podés ver',     tip: 'Mirá a tu alrededor despacio. Colores, formas, la luz, algo que no habías notado.' },
  { n: 4, what: 'cosas que podés tocar',   tip: 'La ropa sobre la piel, el piso bajo los pies, la textura de lo que tenés cerca.' },
  { n: 3, what: 'sonidos que escuchás',    tip: 'Cercanos o lejanos. Un auto, un pájaro, tu propia respiración.' },
  { n: 2, what: 'olores que sentís',       tip: 'Si no sentís ninguno, pensá en dos olores que te gusten.' },
  { n: 1, what: 'sabor en tu boca',        tip: 'O algo amable que te puedas decir a vos mismo ahora.' }
];

window.BREATHING = {
  calma:  { label: 'Calma',  desc: 'Inhalá 4, sostené 4, exhalá 6. Exhalar largo le avisa al cuerpo que puede aflojar.', rounds: 6,
            phases: [['Inhalá', 4, 'in'], ['Sostené', 4, 'hold'], ['Exhalá', 6, 'out']] },
  caja:   { label: 'Caja',   desc: 'Cuatro tiempos iguales, como los lados de un cuadrado. Ayuda a ordenar la cabeza cuando hay ansiedad.', rounds: 5,
            phases: [['Inhalá', 4, 'in'], ['Sostené', 4, 'hold'], ['Exhalá', 4, 'out'], ['Sostené', 4, 'hold']] },
  dormir: { label: 'Dormir', desc: 'Inhalá 4, sostené 7, exhalá 8. Ideal en la cama, con la luz apagada.', rounds: 4,
            phases: [['Inhalá', 4, 'in'], ['Sostené', 7, 'hold'], ['Exhalá', 8, 'out']] }
};

window.RELAJACION = [
  ['Buscá una posición cómoda, sentado o acostado. Si querés, cerrá los ojos.', 4],
  ['Tomá una respiración profunda por la nariz, y soltala despacio por la boca.', 6],
  ['Una vez más. Inhalá, y exhalá dejando ir el aire de a poco.', 6],
  ['Llevá la atención a tus pies. Sentí su peso, su temperatura. Dejá que se aflojen.', 8],
  ['Subí hacia las piernas: pantorrillas, rodillas, muslos. Que se pongan pesadas y blandas.', 8],
  ['Ahora la cadera y la parte baja de la espalda. Soltá cualquier tensión que encuentres ahí.', 8],
  ['Notá tu panza. Dejá que suba y baje sola con cada respiración, sin esfuerzo.', 8],
  ['Sentí el pecho. El aire entra y sale. No tenés que hacer nada, solo observar.', 8],
  ['Llevá la atención a los hombros. Dejalos caer, lejos de las orejas.', 8],
  ['Brazos, codos, manos. Aflojá los dedos, uno por uno.', 8],
  ['Ahora el cuello. Movelo apenas si lo necesitás, y dejalo descansar.', 7],
  ['Relajá la cara: la mandíbula, la lengua, el espacio entre las cejas. Los ojos, suaves.', 8],
  ['Sentí todo tu cuerpo junto, apoyado, sostenido. Respirando tranquilo.', 10],
  ['Quedate acá unos momentos más. No hay nada que resolver ahora.', 14],
  ['Cuando quieras, mové suavemente los dedos de las manos y de los pies.', 5],
  ['Tomá una respiración profunda, y abrí los ojos despacio. Llevate esta calma con vos.', 2]
];
