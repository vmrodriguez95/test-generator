import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'

import style from './e-button.style.scss?inline'

@customElement('e-button')
class EButton extends LitElement {
  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /**
   * Lifecycle methods
   */
  connectedCallback() {
    super.connectedCallback()
  }

  render() {
    return html`
      <button class="e-button">
        <slot></slot>
      </button>
    `
  }
}
