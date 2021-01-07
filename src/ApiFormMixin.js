/**
@license
Copyright 2021 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
/* eslint-disable class-methods-use-this */

import { dedupeMixin } from '@open-wc/dedupe-mixin';
// eslint-disable-next-line no-unused-vars
import { LitElement } from 'lit-element';
import { ApiViewModel } from './ApiViewModel.js';
import * as Utils from './Utils.js';

/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.AmfFormItem} AmfFormItem */
/** @typedef {import('lit-html').Part} Part */
/** @typedef {import('./types').AddCustomItemOptions} AddCustomItemOptions */

export const modelValue = Symbol('modelValue');
export const allowCustomValue = Symbol('allowCustomValue');
export const allowHideOptionalValue = Symbol('allowHideOptionalValue');
export const hasOptionalValue = Symbol('hasOptionalValue');

/**
 * @param {typeof LitElement} base
 */
const mxFunction = base => {
  class ApiFormMixinImpl extends base {
    static get properties() {
      return {
        /**
         * View model to use to render the form.
         */
        apiModel: { type: Array },
        /**
         * Set to true to show optional parameters (not required by the API).
         */
        optionalOpened: { type: Boolean, reflect: true, },
        /**
         * Computed value from `allowHideOptional` and view model.
         * `true` if current model has any optional property.
         */
        hasOptional: { type: Boolean, reflect: true, },
        /**
         * If set it computes `hasOptional` property and shows checkbox in the
         * form to show / hide optional properties.
         */
        allowHideOptional: { type: Boolean, reflect: true, },
        /**
         * Computed flag to determine if optional checkbox can be rendered
         */
        renderOptionalCheckbox: { type: Boolean, reflect: true, },
        /**
         * If set, enable / disable param checkbox is rendered next to each
         * form item.
         */
        allowDisableParams: { type: Boolean, reflect: true, },
        /**
         * When set, renders "add custom" item button.
         * If the element is to be used without AMF model this should always
         * be enabled. Otherwise users won't be able to add a parameter.
         */
        allowCustom: { type: Boolean, reflect: true, },
        /**
         * Renders items in "narrow" view
         */
        narrow: { type: Boolean, reflect: true, },
        /**
         * Computed value. The form renders empty message (if supported by
         * the form element). It occurs when model is not set and allowCustom
         * is not set
         */
        renderEmptyMessage: { type: Boolean, reflect: true, },
      };
    }

    /**
     * @returns {AmfFormItem[]|undefined}
     */
    get apiModel() {
      return this[modelValue];
    }

    /**
     * @param {AmfFormItem[]|undefined} value
     */
    set apiModel(value) {
      const old = this[modelValue];
      if (old === value) {
        return;
      }
      this[modelValue] = value;
      this.renderEmptyMessage = this._computeRenderEmptyMessage(
        this.allowCustom,
        value
      );
      this.hasOptional = this._computeHasOptionalParameters(
        this.allowHideOptional,
        value
      );
      this.requestUpdate();
    }

    /**
     * @returns {boolean|undefined}
     */
    get allowCustom() {
      return this[allowCustomValue];
    }

    /**
     * @param {boolean|undefined} value
     */
    set allowCustom(value) {
      const old = this[allowCustomValue];
      if (old === value) {
        return;
      }
      this[allowCustomValue] = value;
      this.renderEmptyMessage = this._computeRenderEmptyMessage(
        value,
        this.apiModel
      );
      this.requestUpdate('allowCustom', old);
    }

    /**
     * @returns {boolean|undefined}
     */
    get allowHideOptional() {
      return this[allowHideOptionalValue];
    }

    /**
     * @param {boolean|undefined} value
     */
    set allowHideOptional(value) {
      const old = this[allowHideOptionalValue];
      if (old === value) {
        return;
      }
      this[allowHideOptionalValue] = value;
      this.hasOptional = this._computeHasOptionalParameters(
        value,
        this.apiModel
      );
      this.renderOptionalCheckbox = this._computeRenderCheckbox(
        value,
        this.hasOptional
      );
      this.requestUpdate('allowHideOptional', old);
    }

    /**
     * @returns {boolean|undefined}
     */
    get hasOptional() {
      return this[hasOptionalValue];
    }

    /**
     * @param {boolean|undefined} value
     */
    set hasOptional(value) {
      const old = this[hasOptionalValue];
      if (old === value) {
        return;
      }
      this[hasOptionalValue] = value;
      this.renderOptionalCheckbox = this._computeRenderCheckbox(
        this.allowHideOptional,
        value
      );
      this.requestUpdate('hasOptional', old);
    }

    constructor() {
      super();
      this.renderEmptyMessage = true;
    }

    /**
     * Computes class name for each form item depending on the item state.
     *
     * This method to be overwritten by child classes.
     *
     * @param {AmfFormItem} item Model item
     * @param {Boolean=} allowHideOptional
     * @param {Boolean=} optionalOpened True if optional parameters are rendered.
     * @param {Boolean=} allowDisableParams
     * @returns {(part: Part) => void}
     */
    computeFormRowClass(item, allowHideOptional, optionalOpened, allowDisableParams) {
      return Utils.rowClass(
        item,
        allowHideOptional,
        optionalOpened,
        allowDisableParams
      );
    }

    /**
     * Toggles visibility of optional parameters.
     */
    toggleOptionalParams() {
      if (!this.allowHideOptional) {
        return;
      }
      this.optionalOpened = !this.optionalOpened;
    }

    /**
     * Serialize function.
     * @returns {any} Serialized form values
     */
    serializeForm() {
      const items = this.shadowRoot.querySelectorAll('anypoint-input,anypoint-checkbox,anypoint-dropdown-menu,input');
      const result = {};
      Array.from(items).forEach((node) => {
        const input = /** @type HTMLInputElement */ (node);
        const { name, localName } = input;
        if (!name) {
          return;
        }
        if (localName === 'anypoint-checkbox') {
          result[input.name] = input.checked;
        } else if (localName === 'anypoint-dropdown-menu') {
          result[input.name] = /** @type any */ (input).selected;
        } else {
          result[input.name] = input.value;
        }
      });
      return result;
    }

    /**
     * Computes if any of the parameters are required.
     * It iterates over the model to find any first element that has `required`
     * property set to `false`.
     *
     * @param {boolean} allowHideOptional State of `allowHideOptional` property.
     * If `false` this function always returns `false`.
     * @param {AmfFormItem[]} model Current model
     * @return {boolean} `true` if model has at leas one element that is not required.
     */
    _computeHasOptionalParameters(allowHideOptional, model) {
      return Utils.hasOptionalParameters(allowHideOptional, model);
    }

    /**
     * Computes value for `renderOptionalCheckbox` property.
     *
     * @param {boolean} render Value of `allowHideOptional` property
     * @param {boolean} has Value of `hasOptional` property.
     * @return {boolean} True if both values are `true`.
     */
    _computeRenderCheckbox(render, has) {
      return Utils.renderCheckbox(render, has);
    }

    /**
     * Computes if given model item is a custom property (not generated by
     * AMF model transformation).
     * @param {AmfFormItem} model Model item.
     * @return {boolean} `true` if `isCustom` property is set on model's schema
     * property.
     */
    _computeIsCustom(model) {
      return Utils.isCustom(model);
    }

    /**
     * Adds empty custom property to the list.
     *
     * @param {AddCustomItemOptions=} opts Default options for the ModelItem.
     */
    addCustom(opts = {}) {
      const { name = '', value = '', inputLabel } = opts;
      const defaults = /** @type AmfFormItem */ ({
        name,
        value,
        enabled: true,
        schema: {
          isCustom: true,
          inputLabel,
        },
      });
      const worker = new ApiViewModel();
      const item = worker.buildProperty(defaults);
      const model = this.apiModel || [];
      this.apiModel = [...model, item];
      this.optionalOpened = true;
    }

    /**
     * Removes custom item from the UI.
     *
     * @param {Event} e
     */
    _removeCustom(e) {
      const target = /** @type HTMLElement */ (e.currentTarget);
      const index = Number(target.dataset.index);
      if (Number.isNaN(index)) {
        return;
      }
      const { apiModel } = this;
      if (!apiModel || !apiModel.length) {
        return;
      }
      apiModel.splice(index, 1);
      this.requestUpdate();
    }

    /**
     * Computes if model item is optional.
     * The items is always optional if is not required and when `hasOptional`
     * is set to `true`.
     *
     * @param {boolean} hasOptional [description]
     * @param {AmfFormItem} model Model item.
     * @return {boolean} `true` if the model item is optional in the form.
     */
    computeIsOptional(hasOptional, model) {
      return Utils.isOptional(hasOptional, model);
    }

    /**
     * Computes value for `renderEmptyMessage`.
     *
     * @param {boolean} allowCustom True if the form allows to add custom values.
     * @param {AmfFormItem[]=} model Current model
     * @return {boolean} `true` when allowCustom is falsy set and model is empty
     */
    _computeRenderEmptyMessage(allowCustom, model) {
      return Utils.canRenderEmptyMessage(allowCustom, model);
    }
  }
  return ApiFormMixinImpl;
}

/**
 * A mixin to be implemented to elements that processes AMF data via form
 * data model and displays forms from the model.
 *
 * It contains common methods used in forms.
 * @mixin
 */
export const ApiFormMixin = dedupeMixin(mxFunction);
