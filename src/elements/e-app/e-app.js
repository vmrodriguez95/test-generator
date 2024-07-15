import { provide } from '@lit/context'
import { Router } from '@lit-labs/router'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { APP_ROUTES } from '../../utils/routes.utils.js'
import { notificationContext } from '../../context/notifcation.context.js'

@customElement('e-app')
class EApp extends LitElement {
  /**
   * Sets custom props
   */

  updateNotification = (value) => {
    this.notification = {
      value,
      update: this.updateNotification
    }
  }

  @provide({ context: notificationContext })
  @property({ type: Object })
    notification = {
      value: undefined,
      update: this.updateNotification
    }

  router = new Router(this, APP_ROUTES)

  /**
   * Renders template
   */
  render() {
    return html`
      ${this.router.outlet()}
      ${when(this.notification.value, () => html`
        <e-notification type=${this.notification.value.type}>
          <p>${this.notification.value.message}</p>
        </e-notification>
      `)}
    `
  }
}
