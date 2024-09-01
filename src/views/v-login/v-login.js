import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { AuthController } from '../../controllers/auth.controller.js'
import { firebaseContext } from '../../context/firebase.context.js'
import style from './v-login.style.scss?inline'

const elementName = 'v-login'

@customElement(elementName)
class VLogin extends LitElement {

  /**
   * Properties and states
   */
  @consume({ context: firebaseContext, subscribe: true })
  @property({ attribute: false }) firebase

  authController = new AuthController(this)

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */
  render() {
    return html`
      <main class=${elementName}>
        <section class="${elementName}__wrapper">
          <c-form-login @submit=${this.onSubmit}></c-form-login>
        </section>
      </main>
    `
  }

  /**
   * Methods
   */
  async onSubmit(ev) {
    const { username, password } = ev.detail

    await this.authController.signIn(username, password)
  }
}
