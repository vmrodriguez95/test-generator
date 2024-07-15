import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import style from './e-button.style.scss?inline'

@customElement('e-button')
class EButton extends LitElement {

  @property({ type: String }) type = 'button'

  @state() isVisible = false

  static formAssociated = true

  constructor() {
    super()
    this._internals = this.attachInternals()
  }

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /**
   * Lifecycle methods
   */
  updated() {
    if (!this.isVisible) {
      setTimeout(() => this.isVisible = true, 100)
    }
  }

  render() {
    const classes = classMap({
      'e-button': true,
      'e-button--visible': this.isVisible
    })

    return html`
      <button
        type=${this.type}
        class=${classes}
        @click=${this.onClick}
      >
        <slot></slot>
      </button>
    `
  }

  /**
   * Methods
   */
  onClick() {
    if (this.type === 'submit') {
      this._internals?.form?.requestSubmit()
    }
  }
}
