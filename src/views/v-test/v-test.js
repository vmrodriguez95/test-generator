import * as PDFJS from 'pdfjs-dist'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { repeat } from 'lit/directives/repeat.js'
import { shuffle } from '../../utils/actions.utils.js'
import { DBController } from '../../controllers/db.controller.js'

import style from './v-test.style.scss?inline'

@customElement('v-test')
class VTest extends LitElement {

  /**
   * Properties and states
   */
  @state() questions = []

  @state() isFormValidated = false

  @query('form') form

  @query('#upload-questions') questionsInputEl

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

    PDFJS.GlobalWorkerOptions.workerSrc = '/static/library/pdfjs/pdf.worker.min.mjs'
  }

  render() {
    return html`
      <m-layout>
        <section class="v-test">
          <div class="v-test__head">
            <div class="v-test__head__wrapper">
              <e-button @click=${this.openFileBrowser}>
                <span>Subir examen</span>
              </e-button>
              <input id="upload-questions" class="v-test__file" type="file" accept=".pdf" @change=${this.onChange} />
            </div>
          </div>

          ${when(this.isFormValidated, () => html`
            <e-button type="secondary" class="v-test__reload" @click=${this.reloadForm}>
              <e-icon icon="reload" size="sm"></e-icon>
            </e-button>  
          `)}

          <form class="v-test__form" @submit=${this.validate}>
            ${when(this.questions.length > 0, () => html`
              <ol class="v-test__questions">
              ${repeat(this.questions, (question) => question.statement, (question, questionIdx) => html`
                <li class="v-test__question">
                  <p class="v-test__statement">
                    ${question.statement.trim()}
                    ${when(!this.isFormValidated, () => html`
                      <button class="v-test__clear" @click=${this.clearQuestion} type="button">
                        <e-icon icon="broom" size="s"></e-icon>
                      </button>
                    `)}
                  </p>
                  <ul class="v-test__options">
                    ${map(Object.values(question.options), (option, idx) => html`
                      <li class="v-test__option">
                        <input id="question-${questionIdx}-response-${idx}" class="v-test__radio" type="radio" name="question-${questionIdx}" value=${idx} />
                        <label for="question-${questionIdx}-response-${idx}">${option.text.trim()}</label>
                      </li>
                    `)}
                  </ul>
                </li>
              `)}
              </ol>
              <e-button ?disabled=${this.isFormValidated} @click=${this.validate}>
                <span>Validar test</span>
              </e-button>
            `)}
          </form>
        </section>
      </m-layout>
    `
  }

  /**
   * Methods
   */
  async getPdf(arrayBuffer) {
    return await PDFJS.getDocument({ data: arrayBuffer }).promise
  }

  setQuestions(value) {
    this.questions = value
  }

  clearQuestion(ev) {
    const radioChecked = ev.target.parentElement.parentElement.querySelector('.v-test__radio:checked')

    if (radioChecked) radioChecked.checked = false
  }

  shakeOptions(questions) {
    questions.forEach((question) => {
      question.options = shuffle(Array.from(question.options))
    })
  }

  reloadForm() {
    this.isFormValidated = false
    this.resetRadios()
    const newQuestions = shuffle(Array.from(this.questions))
    this.shakeOptions(newQuestions)
    this.setQuestions(newQuestions)
  }

  resetRadios() {
    this.shadowRoot.querySelectorAll('.v-test__radio').forEach((radio) => {
      radio.checked = false
      radio.disabled = false
      radio.classList.remove('is-correct', 'is-wrong')
    })
  }

  openFileBrowser() {
    this.questionsInputEl.click()
  }

  isQuestionNumber(value) {
    return value.match(/^\d+\.$/g)
  }

  isOptionMark(value) {
    return value.match(/^[ABCD]\.$/g)
  }

  isOptionMarkWithText(value) {
    return value.match(/^[ABCD]\..+/g)
  }

  async handlerQuestionsPdf(pdf) {
    try {
      const questions = []
      const total = pdf.numPages
      let questionNumber, responseMark

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()

        let isStatement = true

        for(let k = 0; k < textContent.items.length; k++) {
          let block = textContent.items[k]
          let text

          if (this.isQuestionNumber(block.str)) { // Init question number.
            questionNumber = parseInt(block.str.trim().replace('.', '')) - 1
            questions[questionNumber] = {
              statement: '',
              options: {}
            }
            isStatement = true
          } else if (this.isOptionMark(block.str)) { // Test if options is alone and has no text. PS: A.
            responseMark = block.str.replace('.', '')
            questions[questionNumber].options[responseMark] = {
              text: '',
              isSolution: false
            }
            isStatement = false
          } else if (this.isOptionMarkWithText(block.str)) { // Test if option has text. PS: A. bla bla
            [responseMark, text] = block.str.split('.')
            const isSolution = /##$/g.test(text) // If option text ends with double hastag (##), it's the solution

            questions[questionNumber].options[responseMark] = {
              text: text.replace('##', ''),
              isSolution
            }
            isStatement = false
          } else if (isStatement) { // Fill question statement
            questions[questionNumber].statement += block.str
          } else { // Fill response text
            if (block.str !== '' && block.str !== ' ') {
              questions[questionNumber].options[responseMark].isSolution = /##$/g.test(block.str)
            }
            questions[questionNumber].options[responseMark].text += block.str.replace('##', '')
          }
        }
      }

      this.setQuestions(questions)
    } catch(error) {
      alert('No se ha podido cargar el archivo con las preguntas. Comprueba que el archivo tiene el formato correcto. En caso de no saber qué ocurre puedes ponerte en contacto con el programador tan guapo que ha hecho esta aplicación ;)')
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  onChange(e) {
    const file = e.target.files[0]
    let reader = new FileReader()

    if (!file) return // Must not continue if file doesn't exists

    reader.addEventListener('load', this.handlerReaderLoad.bind(this, reader))

    reader.readAsArrayBuffer(file)
  }

  async handlerReaderLoad(reader) {
    const arrayBuffer = new Uint8Array(reader.result)
    const pdf = await this.getPdf(arrayBuffer)

    this.handlerQuestionsPdf(pdf)
  }

  validate(e) {
    e.preventDefault()
    e.stopPropagation()

    if (this.isFormValidated) return // Must not revalidate form again

    let flag = true
    const numOfQuestions = this.questions.length
    const nonMarkedFields = this.getNonMarkedFields(numOfQuestions)

    if (nonMarkedFields.length > 0) {
      flag = confirm(`Las siguientes preguntas están sin responder: ${nonMarkedFields.join(', ')}. ¿Quieres continuar?`)
    }

    if (!flag) return

    this.showResultToUser(numOfQuestions)
    this.isFormValidated = true
  }

  getNonMarkedFields(numOfQuestions) {
    const { elements } = this.form
    const nonMarkedFields = []

    for(let i = 0; i < numOfQuestions; i++) {
      const radiogroup = elements.namedItem(`question-${i}`)

      if (radiogroup.value === '') {
        nonMarkedFields.push(i + 1)
      }
    }

    return nonMarkedFields
  }

  showResultToUser(numOfQuestions) {
    const { elements } = this.form

    for(let i = 0; i < numOfQuestions; i++) {
      const radiogroup = elements.namedItem(`question-${i}`)

      for(let radio of radiogroup.values()) {
        const { isSolution } = this.questions[i].options[radio.value]

        if (isSolution) {
          radio.classList.add('is-correct')
        } else if (!isSolution && radio.checked)  {
          radio.classList.add('is-wrong')
        }

        radio.disabled = true
      }
    }
  }
}
