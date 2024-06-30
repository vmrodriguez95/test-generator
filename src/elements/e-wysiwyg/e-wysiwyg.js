import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import style from './e-wysiwyg.style.scss?inline'

@customElement('e-wysiwyg')
class EWysiwyg extends LitElement {
  /**
   * Properties and states
   */
  @property({ type: Boolean }) center

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */

  render() {
    const classes = {
      'e-wysiwyg': true,
      'e-wysiwyg--center': this.center
    }

    return html`
      <article class=${classMap(classes)}>
        <slot></slot>
      </article>
    `
  }

  /**
   * Methods
   */
}
