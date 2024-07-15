import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Router } from '@lit-labs/router'
import { APP_ROUTES } from '../../utils/routes.utils.js'

@customElement('e-app')
class EApp extends LitElement {
  /**
   * Sets custom props
   */

  router = new Router(this, APP_ROUTES)

  /**
   * Renders template
   */
  render() {
    return this.router.outlet()
  }
}
