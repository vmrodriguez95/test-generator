import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'
import { IMAGES_PATHNAME } from '../../utils/consts.utils.js'

import style from './m-layout.style.scss?inline'

const elementName = 'm-layout'

@customElement(elementName)
class MLayout extends LitElement {
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
        <c-hero>
          <e-image
            src="${IMAGES_PATHNAME}/background.jpg"
            width="3000"
            height="2000"
            alt="Background image"
          ></e-image>
        </c-hero>
        <div class=${elementName}__wrapper>
          <c-tree></c-tree>
          <div class=${elementName}__content>
            <slot></slot>
          </div>
        </div>
      </main>
    `
  }

  /**
   * Methods
   */
}
