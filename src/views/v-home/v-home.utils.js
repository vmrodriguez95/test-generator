function getBirthdayKey() {
  let birthdayKey = 'default'
  const actualDate = new Date()
  const today = actualDate.getDate()
  const month = actualDate.getMonth()

  if (today === 18 && month === 4) {
    birthdayKey = 'previous'
  } else if (today === 19 && month === 4) {
    birthdayKey = 'theDay'
  } else if (today === 20 && month === 4) {
    birthdayKey = 'next'
  }

  return birthdayKey
}

const birthdayMessages = {
  default: ['Se que no es tu cumple pero...', 'Qué te apetece hacer?'],
  previous: ['¡¡¡¡Pero si mañana es tu cumple reina!!!!!', 'Para que te entretengas antes de tu cumple, elige:'],
  next: ['Espero que ayer tuvieses un día tan maravilloso como tú ❤️', '¿Qué te gustaría ver?'],
  theDay: ['¡¡¡Muchisisisisisimas felicidades!!!', 'Te sienta muy bien cumplir años 😏. ¿Qué quieres hacer por tu cumple?']
}


export function getMessages() {
  const birthdayMessagesToShow = birthdayMessages[getBirthdayKey()]

  return [
    {
      text: 'Holiii',
      isHeading: true,
      returningMessage: {
        text: 'Holiii de nuevo',
        isHeading: true
      }
    },
    {
      text:'Qué tal estás?',
      delay: 800
    },
    {
      text: '¡Muy bien! 😎',
      delay: 600,
      associatedMessage: {
        text: 'Genial!!',
        delay: 800
      },
      returningMessage: {
        text: 'Ole ole loh caracoleh. Que no pare esto.',
        delay: 100
      }
    },
    {
      text: 'Regulin regular',
      buttonType: 'secondary',
      delay: 300,
      associatedMessage: {
        text: 'Bueeeeno, a ver que se puede hacer...',
        delay: 800
      },
      returningMessage: {
        text: 'Esto te ha tenido que animar un poquito al menos 😊',
        delay: 100
      }
    },
    {
      text: 'De puta pena Hulio',
      buttonType: 'light',
      delay: 300,
      associatedMessage: {
        text: 'Eso no puede ser!! Vamos a levantar ese ánimo',
        delay: 800
      },
      returningMessage: {
        text: 'Seguro que, por lo menos, has sonreído 👉🏻👈🏻',
        delay: 100
      },
      stopThread: true
    },
    {
      text: 'Mmmmmmm...',
      delay: 1500
    },
    {
      text: birthdayMessagesToShow[0],
      delay: 2000
    },
    {
      text: birthdayMessagesToShow[1],
      delay: 2000
    },
    {
      text: 'Leeré una historia',
      delay: 600,
      route: '/story/',
      associatedMessage: {
        text: 'De acuerdo, veamos que tenemos por aquí...',
        delay: 800
      },
      returningMessage: {
        text: 'Espero que hayas disfrutado de la historia ❤️. Ahora qué te apetece hacer?',
        delay: 100
      }
    },
    {
      text: '¡Quiero jugar!',
      buttonType: 'secondary',
      delay: 600,
      route: '/games/',
      associatedMessage: {
        text: 'En serio? ¡¡A jugar se ha dicho!!',
        delay: 800
      },
      returningMessage: {
        text: 'Te lo habrás pasado en grande jugando 🎮. Ahora qué te apetece hacer?',
        delay: 100
      }
    }
  ]
}
