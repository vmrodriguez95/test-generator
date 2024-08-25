import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'

import style from './c-hero.style.scss?inline'

const elementName = 'c-hero'

@customElement(elementName)
class CHero extends LitElement {
  /**
   * Properties and states
   */

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */

  render() {
    return html`
      <div class=${elementName}>
        <slot></slot>
      </div>
    `
  }
}
