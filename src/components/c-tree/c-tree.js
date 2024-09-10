/* eslint-disable indent */
import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { ref } from 'lit/directives/ref.js'
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

  actualPopupOpened = null

  dbController = new DBController(this)

  focusedInput = null

  popupActions = [
    {
      title: 'Añadir exámen',
      text: 'Añadir exámen',
      icon: 'exam-new'
    },
    {
      title: 'Añadir carpeta',
      text: 'Añadir carpeta',
      icon: 'folder-new',
      callback: this.addFolder
    },
    {
      title: 'Editar nombre de la carpeta',
      text: 'Editar nombre',
      icon: 'edit'
    },
    {
      title: 'Eliminar carpeta',
      text: 'Eliminar carpeta',
      icon: 'delete',
      callback: this.removeFolder
    }
  ]

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
    window.addEventListener('keyup', this.onClosePopupByKeypressed.bind(this))
  }

  updated() {
    this.focusedInput?.focus()
  }

  render() {
    return html`
      <div class=${elementName}>
        <button class="${elementName}__add" title="Añadir carpeta" @click=${this.addFolder.bind(this, this.exams)}>
          <e-icon icon="add"></e-icon>
          <strong>Exámenes</strong>
        </button>
        ${when(Object.keys(this.exams).length === 0,
          () => html`
            <p class="${elementName}__text">No hay exámenes subidos todavía.</p>
          `,
          () => this.loopExams(this.exams)
        )}
        </ul>
      </div>
    `
  }

  inputChanged(input) {
    this.focusedInput = input
  }

  loopExams(exams, breadcrumbs = '') {
    return html`
      <ul class="${elementName}__list">
        ${map(Object.keys(exams), (examId) => html`
          <li class="${elementName}__item">
            ${when(examId === 'undefined', () => html`
              <input
                class="${elementName}__input"
                placeholder="Nombre de la carpeta"
                ${ref(this.inputChanged)}
                @keyup=${(ev) => this.onKeyup(ev, exams)}
              />
              <button title="Crear carpeta" @click=${(ev) => this.setFolderName(ev, exams, `${breadcrumbs}/${examId}`)}>
                <e-icon icon="add"></e-icon>
              </button>
              <button title="Cancelar creación de carpeta" @click=${this.removeFolder.bind(this, exams, examId)}>
                <e-icon icon="close"></e-icon>
              </button>
            `, () => html`
              <button class="${elementName}__open" title="Desplegar carpeta">
                <e-icon icon="folder"></e-icon>
                <span class="${elementName}__text">${examId}</span>
              </button>
              <button class="${elementName}__menu" title="Abrir opciones del menú" @click=${this.openPopup}>
                <e-icon icon="menu"></e-icon>
              </button>
              ${this.renderPopup(exams, examId, breadcrumbs)}
            `)}
          </li>
        `)}
      </ul>
    `
  }

  renderPopup(exams, examId, breadcrumbs) {
    return html`
      <div class="${elementName}__popup">
        <ul class="${elementName}__list">
          ${map(this.popupActions, (action) => html`
            <li class="${elementName}__item">
              <button title=${action.title} class="${elementName}__action" @click=${action.callback?.bind(this, exams, examId, breadcrumbs)}>
                <e-icon icon=${action.icon} size="sm"></e-icon>
                <span>${action.text}</span>
              </button>
            </li>
          `)}
        </ul>
      </div>
    `
  }

  addFolder(folders) {
    folders['undefined'] = {}
    this.requestUpdate()
  }

  removeFolder(exams, examId) {
    delete exams[examId]
    this.dbController.removeFolder(examId)
    this.requestUpdate()
  }

  onClosePopupByKeypressed(ev) {
    if (ev.key === 'Escape') {
      this.closeActualPopup()
    }
  }

  closeActualPopup() {
    this.actualPopupOpened?.classList.remove(`${elementName}__popup--open`)
    this.actualPopupOpened = null
  }

  openPopup(ev) {
    const popupOpenClass = `${elementName}__popup--open`
    const newPopup = ev.target.nextElementSibling

    if (this.actualPopupOpened === newPopup) {
      newPopup.classList.remove(popupOpenClass)
      this.actualPopupOpened = null
    } else {
      this.actualPopupOpened?.classList.remove(popupOpenClass)
      newPopup.classList.add(popupOpenClass)
      this.actualPopupOpened = newPopup
    }
  }

  setFolderName(ev, exams, breadcrumbs = '') {
    const folderName = ev.target.parentElement.querySelector('input').value

    if (folderName !== '') {
      exams[folderName] = {}
      this.dbController.addFolder(breadcrumbs + folderName)
      this.removeFolder(exams, 'undefined')
    }
  }

  onKeyup(ev, exams) {
    if (ev.key === 'Enter') {
      this.setFolderName(ev, exams)
    }
  }
}
