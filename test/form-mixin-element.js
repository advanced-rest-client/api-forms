import { LitElement, html, css } from 'lit-element';
import { ApiFormMixin, apiFormStyles } from '../index.js';

export class FormMixinElement extends ApiFormMixin(LitElement) {
  static get styles() {
    return [
      apiFormStyles,
      css`
        :host {
          display: block;
        }
      `,
    ];
  }

  render() {
    const {
      apiModel: items,
      allowHideOptional,
      optionalOpened,
      allowDisableParams,
    } = this;
    return html` <h1>Form</h1>
        <form>
          ${items
            ? items.map(
                (item, index) => html`
                <div class="form-item">
                  <div
                    class="${this.computeFormRowClass(
                      item,
                      allowHideOptional,
                      optionalOpened,
                      allowDisableParams
                    )}"
                  >
                    <input
                      data-index="${index}"
                      type="text"
                      name="${item.name}"
                      ?required="${item.schema && item.schema.required}"
                      .value="${item.value}"
                      @change="${this._modelValueChanged}"
                    />
                  </div>
                </div>`
              )
            : undefined}
        </form>`;
  }

  _modelValueChanged(e) {
    const index = Number(e.target.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    this.apiModel[index].value = e.target.value;
    this.requestUpdate();
  }
}
window.customElements.define('form-mixin-element', FormMixinElement);
