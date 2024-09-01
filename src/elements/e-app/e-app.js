import { provide } from '@lit/context'
import { Router } from '@lit-labs/router'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { firebaseContext } from '../../context/firebase.context.js'
import { RouterController } from '../../controllers/router.controller.js'

@customElement('e-app')
class EApp extends LitElement {
  /**
   * Sets custom props
   */

  updateFirebase = (value) => {
    this.firebase = {
      value,
      update: this.updateFirebase
    }
  }

  @provide({ context: firebaseContext })
  @property({ type: Object })
    firebase = {
      value: undefined,
      update: this.updateFirebase
    }

  routerController = new RouterController(this)

  router = new Router(this, this.routerController.getRoutes())

  /**
   * Renders template
   */
  render() {
    return html`
      <!-- Create notifications -->
      ${this.router.outlet()}
    `
  }
}
