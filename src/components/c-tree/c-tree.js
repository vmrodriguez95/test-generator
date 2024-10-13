import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
// import { ref } from 'lit/directives/ref.js'

// Utils
import { urlify } from '../../utils/text.utils.js'

// Controllers
import { ExamController } from '../../controllers/exam.controller.js'
import { DBController } from '../../controllers/db.controller.js'

// Contexts
import { examContext } from '../../context/exam.context.js'
import { firebaseContext } from '../../context/firebase.context.js'

// Styles
import style from './c-tree.style.scss?inline'

const elementName = 'c-tree'

@customElement(elementName)
class CTree extends LitElement {
  /**
   * Properties
   */
  @consume({ context: firebaseContext, subscribe: true })
  @property({ attribute: false }) firebase

  @consume({ context: examContext, subscribe: true })
  @property({ attribute: false }) globalExam

  @state() examsStructure // property setted in `dbController.requestExamns` fired in connectedCallback

  focusedInput = null

  actualPopupOpened = null

  dbController = new DBController(this)

  examController = new ExamController(this)

  examActions = [
    {
      title: 'Editar nombre del examen',
      text: 'Editar nombre',
      icon: 'edit',
      callback: this.renameItem
    },
    {
      title: 'Eliminar examen',
      text: 'Eliminar examen',
      icon: 'delete',
      callback: this.removeItem
    }
  ]

  folderActions = [
    {
      title: 'Añadir exámen',
      text: 'Añadir exámen',
      icon: 'exam-new',
      callback: this.addExam
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
      icon: 'edit',
      callback: this.renameItem
    },
    {
      title: 'Eliminar carpeta',
      text: 'Eliminar carpeta',
      icon: 'delete',
      callback: this.removeItem
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

    this.dbController.requestExams()
    window.addEventListener('keyup', this.onClosePopupByKeypressed.bind(this))
  }

  updated() {
    this.focusedInput?.focus()
  }

  render() {
    return html`
      <div class=${elementName}>
        <div class="${elementName}__head">
          <p class="${elementName}__title">Exámenes</p>
          <button title="Añadir examen" @click=${() => this.addExam()}>
            <e-icon icon="exam-new" size="sm"></e-icon>
          </button>
          <button title="Añadir carpeta" @click=${() => this.addFolder()}>
            <e-icon icon="folder-new" size="sm"></e-icon>
          </button>
        </div>
        <div class="${elementName}__treemap">
          ${when(this.examsStructure, () => this.renderTreemap('', this.examsStructure))}
        </div>
      </div>
    `
  }

  renderTreemap(breadcrumbs, structure) {
    /* eslint-disable indent */
    return html`
      <ul class="${elementName}__list">
        ${when(structure.folders,
          () => map(Object.entries(structure.folders),
            ([folderId, folder]) => html`
              ${this.renderFolder(`${breadcrumbs}/folders/${folderId}`, folder)}
              ${this.renderTreemap(`${breadcrumbs}/folders/${folderId}`, folder)}
            `
          )
        )}
        ${when(structure.exams,
          () => map(Object.entries(structure.exams),
            ([examId, exam]) => this.renderExam(`${breadcrumbs}/exams/${examId}`, exam)
          )
        )}
      </ul>
    `
  }

  renderFolder(breadcrumbs, folder) {
    return html`
      <li class="${elementName}__item">
        <button
          class="${elementName}__open"
          title="Clica para abrir esta carpeta y ver el contenido"
        >
          <e-icon icon="folder" size="sm"></e-icon>
          <span class="${elementName}__text">${folder.name}</span>
        </button>
        <button class="${elementName}__menu" title="Abrir opciones del menú" @click=${this.openPopup}>
          <e-icon icon="menu" size="sm"></e-icon>
        </button>
        ${this.renderPopup(breadcrumbs, 'folder', folder, this.folderActions)}
      </li>
    `
  }

  renderExam(breadcrumbs, exam) {
    return html`
      <li class="${elementName}__item">
        <button
          class="${elementName}__open"
          title="Clica para cargar este examen"
          @click=${() => this.loadExamTest(exam)}
        >
          <e-icon icon="exam" size="sm"></e-icon>
          <span class="${elementName}__text">${exam.name}</span>
        </button>
        <button class="${elementName}__menu" title="Abrir opciones del menú" @click=${this.openPopup}>
          <e-icon icon="menu" size="sm"></e-icon>
        </button>
        ${this.renderPopup(breadcrumbs, 'exam', exam, this.examActions)}
      </li>
    `
  }

  renderPopup(breadcrumbs, type, item, actions) {
    return html`
      <div class="${elementName}__popup">
        <ul class="${elementName}__list">
          ${map(actions, (action) => html`
            <li class="${elementName}__item">
              <button
                title=${action.title}
                class="${elementName}__action"
                @click=${action.callback?.bind(this, breadcrumbs, type, item)}
              >
                <e-icon icon=${action.icon} size="sm"></e-icon>
                <span>${action.text}</span>
              </button>
            </li>
          `)}
        </ul>
      </div>
    `
  }

  inputChanged(input) {
    this.focusedInput = input
  }

  loadExamTest(exam) {
    if (this.globalExam.value?.name !== exam.name && exam.questions) {
      this.globalExam.update(exam)
    }
  }

  getActualItemIdFromBreadcrumbs(breadcrumbs) {
    const actualBreadcrumbs = breadcrumbs
    const chunks = actualBreadcrumbs.split('/')

    return chunks[chunks.length - 1]
  }

  replaceIdsInBreadcrumbs(breadcrumbs, newItemId) {
    const previousItemIdRegExp = new RegExp(`${this.getActualItemIdFromBreadcrumbs(breadcrumbs)}$`, 'g')

    return breadcrumbs.replace(previousItemIdRegExp, newItemId)
  }

  async addFolder(breadcrumbs) {
    const examName = prompt('¿Qué nombre le ponemos a carpeta nueva?')

    this.closeActualPopup()

    if (examName) {
      const value = { exams: {}, folders: {}, name: examName }

      breadcrumbs += `/folders/${urlify(examName)}`

      await this.dbController.addItem(breadcrumbs, value)
      this.dbController.requestExams()
    }
  }

  async addExam(breadcrumbs) {
    // Start process about to create new exam
    // If user add a correct file and controller can process it, updated method continue the task
    const newQuestions = await this.examController.startNewProcess()

    this.closeActualPopup()

    if (newQuestions) {
      // TODO: Move message to a constant
      const examName = prompt('¿Qué nombre le ponemos al nuevo exámen?')
      const value = { questions: newQuestions, name: examName }

      breadcrumbs += `/exams/${urlify(examName)}`

      await this.dbController.addItem(breadcrumbs, value)
      this.dbController.requestExams()
    }
  }

  removeItem(breadcrumbs, type) {
    let response = false
    let message = '¿Seguro que quieres eliminar el examen?'

    if (type === 'folder') {
      message = 'Se va a eliminar todo lo que haya dentro de la carpeta. ¿Seguro que quieres continuar?'
    }

    response = confirm(message)

    this.closeActualPopup()

    if (response) {
      this.dbController.removeItem(breadcrumbs)
      this.dbController.requestExams()
    }
  }

  renameItem(breadcrumbs, type, item) {
    const newItemName = prompt(`¿Qué nuevo nombre le ponemos ${type === 'folder' ? 'a la carpeta' : 'al examen'}?`)

    this.closeActualPopup()

    if (newItemName) {
      const newItemId = urlify(newItemName)
      const newBreadcrumbs = this.replaceIdsInBreadcrumbs(breadcrumbs, newItemId)

      item.name = newItemName

      this.dbController.removeItem(breadcrumbs)
      this.dbController.addItem(newBreadcrumbs, item)
      this.dbController.requestExams()
    }
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
