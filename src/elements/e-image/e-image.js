import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { classMap } from 'lit/directives/class-map.js'

import style from './e-image.style.scss?inline'

const elementName = 'e-image'

@customElement(elementName)
class EImage extends LitElement {

  @property({ type: String }) src = ''

  @property({ type: String }) alt = ''

  @property({ type: String }) width = 0

  @property({ type: String }) height = 0

  // sm = 768px, md = 1024px, lg = 2000px
  @property({ type: String }) responsive = {}

  @property({ type: String }) fit = 'cover'

  /**
   * Component's styles
   */
  static styles = css`${unsafeCSS(style)}`

  /**
   * Lifecycle methods
   */
  render() {
    const classes = classMap({
      [elementName]: true,
      [`${elementName}--${this.fit}`]: true
    })

    return html`
      <figure class=${classes}>
        ${when(this.responsive.md, () => html`
          <img
            srcset="
              320w,
              ${this.responsive.sm.src} 768w,
              ${this.responsive.md.src} 1024w,
              ${this.responsive.lg.src} 2000w
            "
            sizes="
              ${this.width}
              (min-width: 768px) ${this.responsive.sm.src},
              (min-width: 1024px) ${this.responsive.md.src},
              (min-width: 2000px) ${this.responsive.lg.src},
            "
            src=${this.src}
            alt=${this.alt} />
        `, () => html`
          <img src=${this.src} alt=${this.alt} width=${this.width} height=${this.height} />
        `)}
        
      </figure>
    `
  }
}
