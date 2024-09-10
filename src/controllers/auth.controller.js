import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { DEFAULT_INTERNAL_PATHNAME } from '../utils/consts.utils.js'

export class AuthController {
  host

  _auth

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

  signIn(email, password) {
    try {
      const { auth } = this.host.firebase.value

      onAuthStateChanged(auth, (user) => {
        if (user && location.pathname === '/') {
          location.pathname = DEFAULT_INTERNAL_PATHNAME
        }
      })

      signInWithEmailAndPassword(auth, email, password)
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error trying to sign in: ', error)
    }
  }

  signOut() {
    signOut(this.firebase.value.auth)
  }
}

