import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, queryAll } from 'lit/decorators.js'

import style from './c-form-login.style.scss?inline'

const elementName = 'c-form-login'

@customElement(elementName)
class CFormLogin extends LitElement {
  /**
   * Properties and states
   */
  @queryAll('e-input') inputs

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */

  render() {
    return html`
      <form class=${elementName} @submit=${this.onSubmit}>
        <fieldset class="${elementName}__fieldset">
          <legend class="${elementName}__legend">A<br/>estudiar</legend>
          <e-input
            id="username"
            label="Username"
            type="email"
            required
            theme="light"
            regexp="[a-z0-9._+-]+@[a-z0-9.-]+.[a-z]{2,}"
          ></e-input>
          <e-input
            id="password"
            label="Password"
            type="password"
            required
            theme="light"
            regexp="[a-zA-Z0-9;\\[\\]\\^\\-|\\{\\}]{1,20}"
          ></e-input>
          <e-button
            type="submit"
            class="${elementName}__submit"
            theme="secondary"
          >
            <span>Iniciar sesión</span>
          </e-button>
        </fieldset>
      </form>
    `
  }

  /**
   * Methods
   */
  validate() {
    return Array.from(this.inputs).every(input => input.validate())
  }

  onSubmit(e) {
    e.preventDefault()

    if (this.validate()) {
      this.dispatchEvent(new CustomEvent('submit', {
        detail: {
          username: e.target.username.value,
          password: e.target.password.value
        }
      }))
    }

    return false
  }
}
