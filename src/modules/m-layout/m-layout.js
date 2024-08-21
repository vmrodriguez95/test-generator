import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { IMAGES_PATHNAME } from '../../utils/consts.utils.js'
import { DBController } from '../../controllers/db.controller.js'

import style from './e-layout.style.scss?inline'

const elementName = 'e-layout'

@customElement(elementName)
class ELayout extends LitElement {
  /**
   * Properties
   */
  @state() username = ''

  dbController = new DBController(this)

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
          <c-menu></c-menu>
          <slot></slot>
        </div>
      </main>
    `
  }

  /**
   * Methods
   */
}
