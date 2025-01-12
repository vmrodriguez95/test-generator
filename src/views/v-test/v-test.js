import { consume } from '@lit/context'
import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { when } from 'lit/directives/when.js'
import { repeat } from 'lit/directives/repeat.js'

// Utils
import { shuffle } from '../../utils/actions.utils.js'

// Controllers
import { DBController } from '../../controllers/db.controller.js'

// Contexts
import { examContext } from '../../context/exam.context.js'
import { firebaseContext } from '../../context/firebase.context.js'

// Styles
import style from './v-test.style.scss?inline'

@customElement('v-test')
class VTest extends LitElement {

  /**
   * Properties and states
   */
  @consume({ context: firebaseContext, subscribe: true })
  @property({ attribute: false }) firebase

  @consume({ context: examContext, subscribe: true })
  @property({ attribute: false }) globalExam

  @state() correctAnswers = 0

  @state() isFormValidated = false

  @query('form') form

  @query('#upload-questions') questionsInputEl

  questions

  dbController = new DBController(this)

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /*
   * Lifecycle methods
   */

  render() {
    this.questions = this.globalExam.value?.questions || []

    return html`
      <m-layout>
        <section class="v-test">
          ${when(this.globalExam.value, () => html`
            <h1 class="v-test__title">${this.globalExam.value.name}</h1>
          `)}
          <form class="v-test__form" @submit=${this.validate}>
            ${when(this.globalExam.value, () => html`
              <ol class="v-test__questions">
              ${repeat(this.questions, (question) => question.statement, (question, questionIdx) => html`
                <li class="v-test__question">
                  <p class="v-test__statement">
                    ${question.statement.trim()}
                    ${when(!this.isFormValidated, () => html`
                      <button class="v-test__clear" @click=${this.clearQuestion} type="button" title="Limpiar la respuesta de esta pregunta">
                        <e-icon icon="close" size="s"></e-icon>
                      </button>
                    `)}
                  </p>
                  <ul class="v-test__options">
                    ${map(Object.keys(question.options), (key, idx) => html`
                      <li class="v-test__option">
                        <input id="question-${questionIdx}-response-${idx}" class="v-test__radio" type="radio" name="question-${questionIdx}" value=${key} />
                        <label class="v-test__answer" for="question-${questionIdx}-response-${idx}">${question.options[key].text.trim()}</label>
                      </li>
                    `)}
                  </ul>
                </li>
              `)}
              </ol>
              <div class="v-test__bottom">
                ${when(this.isFormValidated, () => html`
                  <e-button theme="secondary" class="v-test__reload" @click=${this.reloadForm}>
                    <span>Repetir examen</span>
                  </e-button>
                  <p class="v-test__result"><strong>Has acertado ${this.correctAnswers} preguntas de un total de ${this.questions.length}.</strong></p>
                `, () => html`
                  <e-button @click=${this.validate}>
                    <span>Validar test</span>
                  </e-button>
                `)}
              </div>
            `)}
          </form>
        </section>
      </m-layout>
    `
  }

  /**
   * Methods
   */
  clearQuestion(ev) {
    const radioChecked = ev.target.parentElement.parentElement.querySelector('.v-test__radio:checked')

    if (radioChecked) radioChecked.checked = false
  }

  shuffleOptions(question) {
    const [ A, B, C, D ] = shuffle(Object.values(question.options))

    question.options = { A, B, C, D }
  }

  shuffleQuestions() {
    let aux
    let randomPos
    let arrayLength = this.questions.length

    // While there remain elements to shuffle...
    while (arrayLength) {

      // Pick a remaining element...
      randomPos = Math.floor(Math.random() * arrayLength--)

      // And swap it with the current element.
      aux = this.questions[arrayLength]
      this.questions[arrayLength] = this.questions[randomPos]
      this.questions[randomPos] = aux

      this.shuffleOptions(this.questions[randomPos])
      this.shuffleOptions(this.questions[arrayLength])
    }
  }

  resetRadios() {
    this.shadowRoot.querySelectorAll('.v-test__radio').forEach((radio) => {
      radio.checked = false
      radio.disabled = false
      radio.classList.remove('is-correct', 'is-wrong')
    })
  }

  reloadForm() {
    this.resetRadios()
    this.shuffleQuestions()
    this.correctAnswers = 0
    this.isFormValidated = false
  }

  validate(e) {
    e.preventDefault()
    e.stopPropagation()

    if (this.isFormValidated) return // Must not revalidate form again

    let flag = true
    const numOfQuestions = this.questions.length
    const nonMarkedFields = this.getNonMarkedFields(numOfQuestions)

    if (nonMarkedFields.length > 0) {
      flag = confirm(`¡¡¡ATENCIÓN!!! ¿De verdad quieres validar el examen? Las siguientes preguntas están sin responder: ${nonMarkedFields.join(', ')}.`)
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
    let correctAnswers = 0
    const { elements } = this.form

    for(let i = 0; i < numOfQuestions; i++) {
      const radiogroup = elements.namedItem(`question-${i}`)

      for(let radio of radiogroup.values()) {
        const { isSolution } = this.questions[i].options[radio.value]

        if (isSolution && radio.checked) {
          correctAnswers++
          radio.classList.add('is-correct')
        } else if (isSolution && !radio.checked) {
          radio.classList.add('is-correct')
        }  else if (!isSolution && radio.checked)  {
          radio.classList.add('is-wrong')
        }

        radio.disabled = true
      }
    }

    this.correctAnswers = correctAnswers
  }
}
