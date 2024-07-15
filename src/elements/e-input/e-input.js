import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import style from './e-input.style.scss?inline'

const elementName = 'e-input'

@customElement(elementName)
class EInput extends LitElement {

  @property({ type: String }) id = ''

  @property({ type: String }) type = ''

  @property({ type: String }) value = ''

  @property({ type: String }) label = ''

  @property({ type: String }) regexp = ''

  @property({ type: Boolean }) disabled = false

  @property({ type: Boolean }) readonly = false

  @property({ type: Boolean }) autofocus = false

  @property({ type: Boolean }) required = false

  @property({ type: Boolean }) isFilled = false

  @query('input') input

  static _regex

  static formAssociated = true

  static styles = css`${unsafeCSS(style)}`

  constructor() {
    super()
    this._internals = this.attachInternals()
  }

  /**
   * Lifecycle methods
   */
  connectedCallback() {
    super.connectedCallback()

    this._regex = new RegExp(this.regexp)
  }

  render() {
    const classes = classMap({
      [elementName]: true,
      [`${elementName}--readonly`]: this.readonly,
      [`${elementName}--disabled`]: this.disabled,
      [`${elementName}--filled`]: this.isFilled
    })

    return html`
      <div class=${classes}>
        <label for=${this.id} class="${elementName}__wrapper">
          <input
            id=${this.id}
            class="${elementName}__field"
            type=${this.type}
            value=${this.value}
            ?readonly=${this.readonly}
            ?disabled=${this.disabled}
            ?autofocus=${this.autofocus}
            ?required=${this.required}
            pattern=${this.pattern}
            @input=${this.onInput}
            @change=${this.onChange}
          />
          <span class="${elementName}__label">${this.label}</span>
        </label>
      </div>
    `
  }

  updated() {
    this.isFilled = this.value !== ''
  }

  /**
   * Methods
   */

  onInput() {
    this.dispatchEvent(new CustomEvent('input', { detail: this.value }))
  }

  onChange(ev) {
    this.value = ev.target.value
  }

  validate() {
    return this._regex.test(this.value)
  }
}
