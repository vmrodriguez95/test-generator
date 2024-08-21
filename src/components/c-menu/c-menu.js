import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { DBController } from '../../controllers/db.controller.js'

import style from './c-menu.style.scss?inline'
import { APP_ROUTES } from '../../utils/routes.utils.js'

const elementName = 'c-menu'

@customElement(elementName)
class CMenu extends LitElement {
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
      <aside class=${elementName}>
        <e-icon icon="user" size="xl"></e-icon>
        <p>Hola, <strong>${this.username}</strong></p>
        <nav>
          <ul class="${elementName}__list">
            ${map(this.getMenuItems(), (route) => html`
              <li class="${elementName}__item">
                <a href=${route.path} class="${elementName}__link">${route.name}</a>
              </li>
            `)}
          </ul>
        </nav>
        <button>Cerrar sesión</button>
      </aside>
    `
  }

  getMenuItems() {
    return APP_ROUTES.filter((route) => route.addToMenu)
  }
}
