import { html } from 'lit'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { DEFAULT_INTERNAL_PATHNAME } from '../utils/consts.utils.js'

export class RouterController {
  host

  _routes = [
    {
      path: '/',
      addToMenu: false,
      render: () => html`<v-login></v-login>`,
      enter: this.middleware.bind(this)
    },
    {
      path: DEFAULT_INTERNAL_PATHNAME,
      name: 'Tests',
      addToMenu: true,
      render: () => html`<v-test></v-test>`,
      enter: this.middleware.bind(this)
    },
    {
      path: '*',
      addToMenu: false,
      enter: () => {
        location.pathname = '/'
      }
    }
  ]

  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    this.setFirebase()
  }

  hostDisconnected() {
    // TODO
  }

  getRoutes() {
    return this._routes
  }

  setFirebase() {
    // eslint-disable-next-line no-undef
    const app = initializeApp(FIREBASE)
    const auth = getAuth(app)

    this.host.firebase.update({ app, auth })
  }

  middleware() {
    onAuthStateChanged(this.host.firebase.value.auth, (user) => {
      if (user === null && location.pathname !== '/') {
        location.pathname = '/'
      }
    })
  }
}

