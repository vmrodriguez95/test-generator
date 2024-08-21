import * as PDFJS from 'pdfjs-dist'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { repeat } from 'lit/directives/repeat.js'
import { shuffle } from '../../utils/actions.utils.js'

import style from './v-test.style.scss?inline'

@customElement('v-test')
class VTest extends LitElement {

  /**
   * Properties and states
   */
  @state() questions

  @state() lastQuestionsFile

  @state() lastSolutionsFile

  @state() areSolutionsLoaded = false

  @state() isFormValidated = false

  @query('form') form

  inputFileQuestionsId = 'upload-questions'

  inputFileSolutionsId = 'upload-solutions'

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
              <e-button class="v-test__upload-questions" @click=${this.chooseFile.bind(this, 'questions')}>
                <span>Subir archivo de preguntas</span>
              </e-button>
              <input id=${this.inputFileQuestionsId} class="v-test__file" type="file" accept=".pdf" @change=${this.onChange} />

              ${when(this.lastQuestionsFile && this.questions, () => html`
                <e-button class="v-test__upload-solutions" type="secondary" @click=${this.chooseFile.bind(this, 'solutions')}>
                  <span>Subir archivo de respuestas</span>
                </e-button>
                <input id=${this.inputFileSolutionsId} class="v-test__file" type="file" accept=".pdf" @change=${this.onChange} />
              `)}
            </div>
          </div>

          ${when(this.isFormValidated, () => html`
            <e-button type="secondary" class="v-test__reload" @click=${this.reloadForm}>
              <e-icon icon="reload" size="sm"></e-icon>
            </e-button>  
          `)}

          <form class="v-test__form" @submit=${this.validate}>
            ${when(this.areSolutionsLoaded, () => html`
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
                    ${map(question.options, (option, idx) => html`
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

  setLastQuestionsFile(value) {
    this.lastQuestionsFile = value
  }

  setLastSolutionsFile(value) {
    this.lastSolutionsFile = value
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

  chooseFile(type) {
    let idInputFile = ''

    switch(type) {
      case 'questions':
        idInputFile = `#${this.inputFileQuestionsId}`
        break
      case 'solutions':
        idInputFile = `#${this.inputFileSolutionsId}`
        break
    }

    this.shadowRoot.querySelector(idInputFile).click()
  }

  convertSolutionsInArray() {
    this.questions = this.questions.map((question) => {
      question.options = Object.values(question.options)

      return question
    })
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

          if (block.str.match(/^\d+\.$/g)) { // Init question number.
            questionNumber = parseInt(block.str.trim().replace('.', '')) - 1
            questions[questionNumber] = {
              statement: '',
              options: {}
            }
            isStatement = true
          } else if (block.str.match(/^[ABCD]\.$/g)) { // Init response option
            responseMark = block.str.replace('.', '')
            questions[questionNumber].options[responseMark] = { text: '', isSolution: false }
            isStatement = false
          } else if (block.str.match(/^[ABCD]\..+/g)) { // Init response option with text
            [responseMark, text] = block.str.split('.')
            questions[questionNumber].options[responseMark] = { text: text, isSolution: false }
            isStatement = false
          } else if (isStatement) { // Fill question statement
            questions[questionNumber].statement += block.str
          } else { // Fill response text
            questions[questionNumber].options[responseMark].text += block.str
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

  async handlerSolutionsPdf(pdf) {
    try {
      let pdfText = ''
      let solutions = []
      const page = await pdf.getPage(1)
      const textContent = await page.getTextContent()

      for(let k = 0; k < textContent.items.length; k++) {
        let block = textContent.items[k]

        pdfText += block.str
      }

      solutions = pdfText.split('//')

      if (solutions.length < this.questions.length) {
        alert('Parece que hay MENOS respuestas que preguntas. Por favor, revisa que están todas las respuestas. En caso de ser así, revisa que todas cumplen el formato -> 1. A // 2. A // 3. B // ...')
        return
      } else if (solutions.length > this.questions.length) {
        alert('Parece que hay MÁS respuestas que preguntas. Por favor, revisa que están todas las respuestas. En caso de ser así, revisa que todas cumplen el formato -> 1. A // 2. A // 3. B // ...')
        return
      }

      solutions.forEach((item) => {
        const [question, solution] = item.split('.')

        this.questions[parseInt(question.trim()) - 1].options[solution.trim()].isSolution = true
      })

      this.convertSolutionsInArray()

      this.areSolutionsLoaded = true
    } catch(error) {
      alert('Formato del pdf incorrecto. Revisa que se cumple el formato -> 1. A // 2. A // 3. B // ... Si no sabes qué ocurre puedes recurrir a tu programador de confianza.')
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  onChange(e) {
    const file = e.target.files[0]
    const isQuestions = e.target.id === this.inputFileQuestionsId
    let reader = new FileReader()

    if (!file) return // Must not continue if file doesn't exists

    if (isQuestions) {
      this.setLastQuestionsFile(file)
    } else {
      this.setLastSolutionsFile(file)
    }

    reader.addEventListener('load', this.handlerReaderLoad.bind(this, reader, isQuestions))

    reader.readAsArrayBuffer(file)
  }

  async handlerReaderLoad(reader, isQuestions) {
    const arrayBuffer = new Uint8Array(reader.result)
    const pdf = await this.getPdf(arrayBuffer)

    if (isQuestions) {
      this.handlerQuestionsPdf(pdf)
    } else {
      this.handlerSolutionsPdf(pdf)
    }
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
