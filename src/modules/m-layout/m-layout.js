import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { IMAGES_PATHNAME } from '../../utils/consts.utils.js'
import { DBController } from '../../controllers/db.controller.js'
import { AuthController } from '../../controllers/auth.controller.js'
import { firebaseContext } from '../../context/firebase.context.js'

import style from './m-layout.style.scss?inline'

const elementName = 'm-layout'

@customElement(elementName)
class MLayout extends LitElement {
  /**
   * Properties
   */
  @consume({ context: firebaseContext, subscribe: true })
  @property({ attribute: false }) firebase

  @state() username = ''

  dbController = new DBController(this)

  authController = new AuthController(this)

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */
  connectedCallback() {
    super.connectedCallback()

    this.dbController.getUsername()
  }

  render() {
    return html`
      <main class=${elementName}>
        <c-hero>
          <e-image
            src="${IMAGES_PATHNAME}/background.jpg"
            width="3000"
            height="2000"
            alt="Background image"
          ></e-image>
        </c-hero>
        <div class=${elementName}__wrapper>
          <aside class=${elementName}__aside>
            <p class="${elementName}__user"><e-icon icon="user" size="md"></e-icon> Hola, <strong>${this.username}</strong></p>
            <c-tree></c-tree>
            <button class="${elementName}__logout" @click=${this.authController.signOut}>Cerrar sesión</button>
          </aside>
          <section class=${elementName}__content>
            <slot></slot>
          </section>
        </div>
      </main>
    `
  }

  /**
   * Methods
   */
}
