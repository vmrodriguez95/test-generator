/* eslint-disable indent */
import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { DBController } from '../../controllers/db.controller.js'
import { firebaseContext } from '../../context/firebase.context.js'

import style from './c-tree.style.scss?inline'

const elementName = 'c-tree'

@customElement(elementName)
class CTree extends LitElement {
  /**
   * Properties
   */
  @consume({ context: firebaseContext, subscribe: true })
  @property({ attribute: false }) firebase

  @state() exams = {}

  dbController = new DBController(this)

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */
  connectedCallback() {
    super.connectedCallback()

    this.dbController.getExamns()
  }

  render() {
    return html`
      <div class=${elementName}>
        <p class="${elementName}__text"><strong>Exámenes</strong></p>
        <ul class="${elementName}__list">
          ${when(Object.keys(this.exams).length > 0,
            () => map(Object.keys(this.exams), (examId) => html`<li>${examId}</li>`),
            () => html`<li class="${elementName}__text">No hay exámenes subidos todavía.</li>`
          )}
        </ul>
      </div>
    `
  }
}
