import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { setStorageItem } from '../utils/storage.utils.js'
import { DEFAULT_ERROR_MESSAGE, FIREBASE_ERROR_MESSAGES } from '../utils/consts.utils.js'
import { DEFAULT_INTERNAL_PATHNAME } from '../utils/routes.utils.js'

export class AuthController {
  host

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    // TODO
  }

  hostDisconnected() {
    // TODO
  }

  requestSignIn(email, password) {
    // eslint-disable-next-line no-undef
    const auth = getAuth(initializeApp(FIREBASE))

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        setStorageItem('uid', userCredential.user.uid)
        window.location.href = DEFAULT_INTERNAL_PATHNAME
      })
      .catch((error) => {
        const errorCode = error.code
        const erroMessage = FIREBASE_ERROR_MESSAGES[errorCode]

        this.host.notification.update({
          type: 'error',
          message: erroMessage || DEFAULT_ERROR_MESSAGE
        })
      })
  }
}

