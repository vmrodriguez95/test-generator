import * as PDFJS from 'pdfjs-dist'
import { PDF_WORKER } from '../utils/consts.utils.js'

export class ExamController {
  host

  processStatus = 'waiting'

  _inputFileEl

  _solutionMark = '##'


  constructor(host) {
    this.host = host

    host.addController(this)
  }

  hostConnected() {
    this._setWorker(PDF_WORKER)
  }

  async startNewProcess() {
    this.processStatus = 'processing'
    return await this._createHiddenInputFile()
  }

  /**
   * Method to get pdf content based on ArrayBuffer given and processed by `pdfjs-dist`library.
   *
   * @param { Uint8Array } arrayBuffer - pdf array buffer
   * @returns { Promise }
   */
  async _getPdf(arrayBuffer) {
    return await PDFJS.getDocument({ data: arrayBuffer }).promise
  }

  /**
   * Method to set worker's src
   *
   * @param { String } worker - path of worker
   */
  _setWorker(worker) {
    PDFJS.GlobalWorkerOptions.workerSrc = worker
  }

  /**
   * Method to evaluate if a string pass the regex to be a question number. (1. / 2. / 3. / 4. ...)
   *
   * @param { String } value - String to evaluate
   * @returns { Boolean }
   */
  _isQuestionNumber(value) {
    return value.match(/^\d+\.$/g)
  }

  /**
   * Method to evaluate if a string pass the regex to be an option letter. (A. / B. / C. / D.)
   *
   * @param { String } value - String to evaluate
   * @returns { Boolean }
   */
  _isOptionMark(value) {
    return value.match(/^[ABCD]\.$/g)
  }

  /**
   * Method to evaluate if a string pass the regex to be an option letter and there is text. (A. Blablaa)
   *
   * @param { String } value - String to evaluate
   * @returns { Boolean }
   */
  _isOptionMarkWithText(value) {
    return value.match(/^[ABCD]\..+/g)
  }

  /**
   * Method to evaluate if a string pass the regex to be an option letter and there is text. (A. Blablaa)
   *
   * @param { String } value - String to evaluate
   * @returns { Boolean }
   */
  _isSolution(value) {
    const regex = new RegExp(`${this._solutionMark}$`, 'g')

    return regex.test(value)
  }

  /**
   * Method to create a hidden input file
   */
  _createHiddenInputFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      input.setAttribute('accept', '.pdf')
      input.addEventListener('change', (e) => this._onChange(resolve, e))
      input.addEventListener('cancel', () => this._onCancel(reject))

      document.body.appendChild(input)

      this._inputFileEl = input
      this._inputFileEl.click()
    })
  }

  /**
   * Method to destroy a hidden input file
   */
  _destroyHiddenInputFile() {
    document.body.removeChild(this.input)
  }

  async _handlerQuestionsPdf(resolve, pdf) {
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

          if (this._isQuestionNumber(block.str)) { // Init question number.
            questionNumber = parseInt(block.str.trim().replace('.', '')) - 1
            questions[questionNumber] = {
              statement: '',
              options: {}
            }
            isStatement = true
          } else if (this._isOptionMark(block.str)) { // Test if options is alone and has no text. PS: A.
            responseMark = block.str.replace('.', '')
            questions[questionNumber].options[responseMark] = {
              text: '',
              isSolution: false
            }
            isStatement = false
          } else if (this._isOptionMarkWithText(block.str)) { // Test if option has text. PS: A. bla bla
            [responseMark, text] = block.str.split('.')
            const isSolution = this._isSolution(text) // If option text ends with double hastag (##), it's the solution

            questions[questionNumber].options[responseMark] = {
              text: text.replace(this._solutionMark, ''),
              isSolution
            }
            isStatement = false
          } else if (isStatement) { // Fill question statement
            questions[questionNumber].statement += block.str
          } else { // Fill response text
            if (block.str !== '' && block.str !== ' ') {
              questions[questionNumber].options[responseMark].isSolution = this._isSolution(block.str)
            }
            questions[questionNumber].options[responseMark].text += block.str.replace(this._solutionMark, '')
          }
        }
      }

      resolve(questions)
    } catch(error) {
      // TODO: Show error throught a notification component.
      // TODO: Move message to a file with all messages.
      alert('No se ha podido cargar el archivo con las preguntas. Comprueba que el archivo tiene el formato correcto. En caso de no saber qué ocurre puedes ponerte en contacto con el programador tan guapo que ha hecho esta aplicación ;)')
      // eslint-disable-next-line no-console
      console.error(error)
      resolve(null)
    }
  }

  /**
   * Method to handle load event from file reader
   *
   * @param { FileReader } reader - File reader
   */
  async _handlerReaderLoad(resolve, reader) {
    const arrayBuffer = new Uint8Array(reader.result)
    const pdf = await this._getPdf(arrayBuffer)

    this._handlerQuestionsPdf(resolve, pdf)
  }

  /**
   * Method to handle change event
   *
   * @param { Event } e - Event Change
   */
  _onChange(resolve, e) {
    if(!e.target.files[0]) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.addEventListener('load', async() => await this._handlerReaderLoad(resolve, reader))

    reader.readAsArrayBuffer(file)
  }

  /**
   * Method to handle change event
   *
   * @param { Event } e - Event Change
   */
  _onCancel(reject) {
    this.processStatus = 'canceled'

    reject(null)
  }
}
