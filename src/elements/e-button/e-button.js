import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import style from './e-button.style.scss?inline'

@customElement('e-button')
class EButton extends LitElement {

  @state() isVisible = false

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
      <button class=${classes}>
        <slot></slot>
      </button>
    `
  }
}
