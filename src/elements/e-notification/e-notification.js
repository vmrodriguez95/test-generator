import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { notificationContext } from '../../context/notifcation.context.js'

import style from './e-notification.style.scss?inline'

const elementName = 'e-notification'

@customElement(elementName)
class ENotification extends LitElement {

  @property({ type: String }) type = 'info' // info, success, warning, error

  @consume({ context: notificationContext, subscribe: true })
  @property({ attribute: false }) notification

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /**
   * Lifecycle methods
   */
  render() {
    return html`
      <div class=${elementName}>
        <e-icon icon=${this.type} class="${elementName}__icon"></e-icon>
        <slot></slot>
        <button class="${elementName}__close" @click=${this.onClose}>
          <e-icon icon="close"></e-icon>
        </button>
      </div>
    `
  }

  /**
   * Methods
   */
  onClose() {
    this.notification.update(undefined)
  }
}
