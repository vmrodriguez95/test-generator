/* eslint-disable indent */
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { APP_ROUTES } from '../../utils/routes.utils.js'
import { resetStorage } from '../../utils/storage.utils.js'
import { DBController } from '../../controllers/db.controller.js'

import style from './c-tree.style.scss?inline'

const elementName = 'c-tree'

@customElement(elementName)
class CTree extends LitElement {
  /**
   * Properties
   */
  @state() username = ''

  @state() exams = {}

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
      <aside class=${elementName}>
        <p class="${elementName}__user"><e-icon icon="user" size="md"></e-icon> Hola, <strong>${this.username}</strong></p>
        <p class="${elementName}__text"><strong>Exámenes</strong></p>
        <ul class="${elementName}__list">
          ${when(Object.keys(this.exams).length > 0,
            () => map(Object.keys(this.exams), (examId) => html`<li>${examId}</li>`),
            () => html`<li class="${elementName}__text">No hay exámenes subidos todavía.</li>`
          )}
        </ul>
        <button class="${elementName}__logout" @click=${this.onLogout}>Cerrar sesión</button>
      </aside>
    `
  }

  getMenuItems() {
    return APP_ROUTES.filter((route) => route.addToMenu)
  }

  onLogout() {
    resetStorage()

    location.pathname = '/'
  }
}
