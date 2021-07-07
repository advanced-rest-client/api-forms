/* eslint-disable arrow-body-style */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { html, LitElement } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import styles from './styles/ApiFormItem.styles.js';

/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput *
/** @typedef {import('@anypoint-web-components/anypoint-dropdown-menu').AnypointDropdownMenu} AnypointDropdownMenu *
/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.AmfFormItem} AmfFormItem */
/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.AmfFormItemSchema} AmfFormItemSchema */

export const enumTemplate = Symbol('enumTemplate');
export const booleanTemplate = Symbol('booleanTemplate');
export const inputTemplate = Symbol('inputTemplate');
export const arrayTemplate = Symbol('arrayTemplate');
export const modelValue = Symbol('modelValue');
export const valueValue = Symbol('valueValue');
export const isArrayValue = Symbol('isArrayValue');
export const isNillableValue = Symbol('isNillableValue');
const decimalInputTypes = ['float', 'double'];

/**
 * An element that renders a form input to edit API type value.
 */
export class ApiFormItemElement extends ValidatableMixin(LitElement) {
  get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * View model generated for this view.
       */
      model: { type: Object },
      /**
       * Name of the form item
       */
      name: { type: String, reflect: true },
      /**
       * When set, prohibits inputs to have floating labels
       */
      noLabelFloat: { type: Boolean },
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean, reflect: true },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * Input's value.
       */
      value: { type: String },
      // Computed value, True if current item is a dropdown with values.
      _isEnum: { type: Boolean },
      // Computed value, True if current item is an regular input
      _isInput: { type: Boolean },
      // Computed value, True if current item is an array object
      _isArray: { type: Boolean, reflect: true, attribute: 'isArray' },
      // Computed value, True if current item is an union with nill value.
      _isNillable: { type: Boolean, reflect: true, attribute: 'isNillable' },

      _nilEnabled: { type: Boolean },
      // Computed value, True if current item is a boolean value
      _isBoolean: { type: Boolean },
      // A value of an array item (only if `isArray` is set)
      _arrayValue: { type: Array },
      /**
       * Set to indicate that the consol is required
       */
      required: { type: Boolean, reflect: true },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean, reflect: true },
      /**
       * When set the editor renders form controls disabled.
       */
      disabled: { type: Boolean, reflect: true },
      /**
       * Warning message for single text input value
       */
      _valueWarningMessage: { type: String },
      /**
       * Warning messages for array values
       */
      _arrayWarningMessages: { type: Array },
    };
  }

  /**
   * @returns {AmfFormItem}
   */
  get model() {
    return this[modelValue];
  }

  /**
   * @param {AmfFormItem} value
   */
  set model(value) {
    const old = this[modelValue];
    /* istanbul ignore if */
    if (value === old) {
      return;
    }
    this[modelValue] = value;
    this._modelChanged(value);
  }

  get value() {
    return this[valueValue];
  }

  set value(value) {
    const old = this[valueValue];
    /* istanbul ignore if */
    if (value === old) {
      return;
    }
    if (value === undefined || value === null || value === 'undefined') {
      value = '';
    }
    this[valueValue] = value;
    this.requestUpdate('value', old);
    this._isArrayChanged(this._isArray);
    this._updateValueWarningMessage();
  }

  get _isArray() {
    return this[isArrayValue];
  }

  set _isArray(value) {
    const old = this[isArrayValue];
    /* istanbul ignore if */
    if (value === old) {
      return;
    }
    this[isArrayValue] = value;
    this._isArrayChanged(value);
    this.requestUpdate('_isArray', old);
  }

  get _isNillable() {
    return this[isNillableValue];
  }

  set _isNillable(value) {
    const old = this[isNillableValue];
    /* istanbul ignore if */
    if (value === old) {
      return;
    }
    this[isNillableValue] = value;
    this.requestUpdate('_isNillable', old);
  }

  constructor() {
    super();
    this._isInput = true;
    this.value = '';
    this.compatibility = false;
    this.outlined = false;
    this.readOnly = false;
    this.disabled = false;
    this.noLabelFloat = false;
    this.name = undefined;
    this._arrayWarningMessages = [];
  }

  /**
   * Resets UI state variables
   */
  _resetStates() {
    this._isEnum = false;
    this._isInput = false;
    this._isArray = false;
    this._isBoolean = false;
    this._isNillable = false;
  }

  /**
   * Sets the template depending on model configuration
   * @param {AmfFormItem} model 
   */
  _modelChanged(model) {
    this._resetStates();
    if (!model) {
      return;
    }
    const { schema={} } = model;
    switch (true) {
      case Array.isArray(schema.enum):
        this._isEnum = true;
        break;
      case schema.isArray:
        this._prepareArraySchema(model);
        break;
      case schema.isBool:
        this._isBoolean = true;
        break;
      default:
        this._isInput = true;
    }
    this._isNillable = !!schema.isNillable;
    this._updateValueWarningMessage();
  }

  /**
   * Sets `arrayValue` from model's value.
   *
   * @param {AmfFormItem} model ARC amf view model.
   */
  _prepareArraySchema(model) {
    this._isArray = true;
    let value;
    if (model.value && Array.isArray(model.value)) {
      value = model.value.map((item) => {
        return {
          value: item,
        };
      });
    } else {
      value = [];
    }
    this._arrayValue = value;
    this._setWarningMessagesForArray(value);
  }

  /**
   * Sets array values if needed
   * @param {boolean} isArray
   */
  _isArrayChanged(isArray) {
    const v = this.value;
    if (!v || !isArray) {
      this._arrayValue = undefined;
      return;
    }
    this._arrayValue = this._itemsForArray(v);
  }

  /**
   * @param {string[]} value An array of values.
   * @return {Array}
   */
  _itemsForArray(value) {
    let result = [];
    if (Array.isArray(value)) {
      result = value.map((item) => {
        return {
          value: item
        };
      });
    } else {
      result.push({
        value
      });
    }
    return result;
  }

  // Handles array value change and sets the `value` property.
  _arrayValueChanged() {
    let arr = this._arrayValue;
    if (arr) {
      arr = arr.map((item) => item.value);
    }
    this[valueValue] = arr;
    this._notifyInput();
  }

  /**
   * Adds new element to the array value.
   * @return {number} Index of the value in the values array.
   * Note that the index may change over time if the user remove any value.
   */
  addEmptyArrayValue() {
    const items = this._arrayValue || [];
    items.push({
      value: ''
    });
    this._arrayValue = [...items];
    this._addEmptyArrayWarningMessage();
    return this._arrayValue.length - 1;
  }

  /**
   * Removes an array value for given index.
   * @param {Number} index A position of the value in the array
   */
  removeArrayValue(index) {
    const value = this._arrayValue;
    value.splice(index, 1);
    this._arrayValue = [...value];
    this._removeArrayWarningMessage(index);
    this._arrayValueChanged();
  }

  // Removes item from array value.
  _removeArrayValue(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    this.removeArrayValue(index);
  }

  /**
   * Fallback validator if form validator is unavailable.
   *
   * @return {boolean} True if the control is valid.
   */
  _defaultValidator() {
    const { model } = this;
    if (!model) {
      return true;
    }
    const { schema={} } = model;
    if (!schema.required) {
      return true;
    }
    return !!model.value;
  }

  /**
   * Returns input(s) depending on model type.
   * @return {AnypointInput|AnypointInput[]|AnypointDropdownMenu|undefined} Returns an element for input, enum, and
   * boolean types. Returns NodeList for array type. Returns undefined when model is not set
   * or DOM is not ready.
   */
  _getInputElement() {
    if (this._isInput) {
      return /** @type AnypointInput */ (this.shadowRoot.querySelector('anypoint-input[data-type="input"]'));
    }
    if (this._isBoolean) {
      return /** @type AnypointDropdownMenu */ (this.shadowRoot.querySelector('anypoint-dropdown-menu[data-type="boolean"]'));
    }
    if (this._isEnum) {
      return /** @type AnypointDropdownMenu */ (this.shadowRoot.querySelector('anypoint-dropdown-menu[data-type="enum"]'));
    }
    if (this._isArray) {
      return Array.from(this.shadowRoot.querySelectorAll('anypoint-input[data-type="array"]'));
    }
    return undefined;
  }

  /**
   * Overrides `ValidatableMixin._getValidity`.
   * If the element is set to be `NIL` value it always returns true.
   * Otherwise it calls `_getInputsValidity()` for input validation result.
   * @return {Boolean} Validation result
   */
  _getValidity() {
    if (this._nilEnabled) {
      return true;
    }
    return this._getInputsValidity();
  }

  /**
   * Validates the inputs and returns validation state.
   * @return {Boolean}
   */
  _getInputsValidity() {
    const nodes = this._getInputElement();
    if (!nodes) {
      return this._defaultValidator();
    }
    if (Array.isArray(nodes)) {
      // const typed = /** @type NodeList */ (node);
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i].validate()) {
          return false;
        }
      }
      return true;
    }
    return nodes.validate(nodes.value);
  }

  /**
   * Controls value and input state when "nil" checkbox value change.
   * @param {CustomEvent} e
   */
  async _nillableChanged(e) {
    const { value } = e.detail;
    this._nilEnabled = value;
    if (value) {
      this._oldNilValue = this.value;
      this.value = 'nil';
    } else if (this._oldNilValue) {
      this.value = this._oldNilValue;
      this._oldNilValue = undefined;
    } else if (this.value === 'nil') {
      this.value = '';
    }
    this._notifyInput();
    await this.updateComplete;
    this._getInputsValidity();
  }

  _listSelectionHandler(e) {
    if (this._isBoolean) {
      this.value = e.target.selected === 'true';
    } else {
      this.value = e.target.selected;
    }
    this._notifyInput();
  }

  /**
   * Handler for `input` event coming from regular input.
   * @param {Event} e
   */
  _inputHandler(e) {
    const input = /** @type AnypointInput */ (e.target);
    this.value = input.value;
    this.dispatchEvent(new Event('input'));
    this._notifyInput();
  }

  /**
   * Handler for `change` event coming from regular input.
   * This is a special case for FF where input event won't be dispatched
   * for number type and when using arrow up/down.
   *
   * @param {Event} e
   */
  _inputChangeHandler(e) {
    const input = /** @type AnypointInput */ (e.target);
    if (input.type === 'number') {
      this.value = input.value;
      this._notifyInput();
    }
  }

  /**
   * Handler for input event coming from array items.
   * @param {Event} e
   */
  _arrayValueHandler(e) {
    const input = /** @type AnypointInput */ (e.target);
    const index = Number(input.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const value = this._arrayValue;
    value[index].value = input.value;
    this._updateArrayValueWarningMessage(index);
    this._arrayValue = [...value];
    this._arrayValueChanged();
    this._notifyInput();
  }

  /**
   * Dispatches non-bubbling `input` event.
   */
  _notifyInput() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    const { readOnly, disabled, _isEnum, _isBoolean, _isInput, _isArray, _isNillable } = this;
    return html`
    <style>${this.styles}</style>
    <div class="content">
      ${_isEnum ? this[enumTemplate]() : undefined}
      ${_isBoolean ? this[booleanTemplate]() : undefined}
      ${_isInput ? this[inputTemplate]() : undefined}
      ${_isArray ? this[arrayTemplate]() : undefined}

      ${_isNillable ? html`<anypoint-checkbox
        ?disabled="${readOnly || disabled}"
        class="nil-option"
        @checked-changed="${this._nillableChanged}">Nil</anypoint-checkbox>` : undefined}
    </div>`;
  }

  [enumTemplate]() {
    const { name, readOnly, disabled, value, outlined, compatibility, _nilEnabled } = this;
    const viewModel = /** @type AmfFormItem */ (this.model);
    const { schema = {} } = viewModel;
    const values = schema.enum || [];
    return html`
    <anypoint-dropdown-menu
      name="${name}"
      ?required="${!_nilEnabled && schema.required}"
      autoValidate
      data-type="enum"
      ?disabled="${readOnly || disabled || _nilEnabled}"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}"
    >
      <label slot="label">${schema.inputLabel}</label>
      <anypoint-listbox
        slot="dropdown-content"
        attrforselected="data-value"
        .selected="${value}"
        ?compatibility="${compatibility}"
        @selected-changed="${this._listSelectionHandler}"
      >
        ${values.map((item) => html`<anypoint-item data-value="${item}">${item}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  [booleanTemplate]() {
    const { name, readOnly, disabled, value, outlined, compatibility, _nilEnabled } = this;
    const viewModel = /** @type AmfFormItem */ (this.model);
    if (!viewModel) {
      return '';
    }
    const { schema = {} } = viewModel;
    const bindValue = (value === true || value === 'true') ? 'true' : 'false';
    return html`
    <anypoint-dropdown-menu
      name="${name}"
      ?required="${!_nilEnabled && schema.required}"
      autoValidate
      data-type="boolean"
      ?disabled="${readOnly || disabled || _nilEnabled}"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}"
    >
      <label slot="label">${schema.inputLabel}</label>
      <anypoint-listbox
        slot="dropdown-content"
        attrforselected="data-value"
        .selected="${bindValue}"
        ?compatibility="${compatibility}"
        @selected-changed="${this._listSelectionHandler}"
      >
        <anypoint-item data-value="true">True</anypoint-item>
        <anypoint-item data-value="false">False</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  /**
   * Determines whether the input should have step value.
   * @param {AmfFormItemSchema} schema
   * @returns {String}
   */
  _stepValue(schema) {
    let step = '1';
    const {format, inputType, multipleOf} = schema;
    if (inputType) {
      const anyNumberFormat = inputType === 'number' && !format;
      const anyDecimalNumber = decimalInputTypes.indexOf(format) !== -1;
      if (multipleOf) {
        step = multipleOf
      } else if (anyNumberFormat || anyDecimalNumber) {
        step = 'any';
      }
    }
    return step;
  }

  [inputTemplate]() {
    const { name, noLabelFloat, readOnly, disabled, value, outlined, compatibility, _nilEnabled, _valueWarningMessage } = this;
    const viewModel = /** @type AmfFormItem */ (this.model);
    if (!viewModel) {
      return '';
    }
    const { schema = {} } = viewModel;
    const required = this._computeIsRequired(schema);
    const step = this._stepValue(schema);
    return html`<anypoint-input
      .value="${value}"
      ?required="${!_nilEnabled && required}"
      .pattern="${schema.pattern}"
      .name="${name}"
      autoValidate
      .type="${/** @type any */(schema.inputType)}"
      .min="${typeof schema.minimum !== 'undefined' ? String(schema.minimum) : undefined}"
      .max="${typeof schema.maximum !== 'undefined' ? String(schema.maximum) : undefined}"
      .maxLength="${schema.maxLength}"
      .minLength="${schema.minLength}"
      .placeholder="${schema.inputPlaceholder}"
      ?noLabelFloat="${noLabelFloat}"
      ?readonly="${readOnly}"
      ?disabled="${disabled || _nilEnabled}"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}"
      data-type="input"
      @input="${this._inputHandler}"
      @change="${this._inputChangeHandler}"
      invalidMessage="${`${name} is invalid. Check documentation.`}"
      .infoMessage="${_valueWarningMessage}"
      .step="${step}"
    >
      <label slot="label">${schema.inputLabel}</label>
    </anypoint-input>`;
  }

  [arrayTemplate]() {
    const { name, readOnly, disabled, _arrayValue=[], outlined, compatibility, _nilEnabled, _arrayWarningMessages } = this;
    const viewModel = /** @type AmfFormItem */ (this.model);
    if (!viewModel) {
      return '';
    }
    const { schema = {} } = viewModel;
    const itemLabel = schema.inputLabel || 'Parameter value';
    return html`
    <label class="array-label">${itemLabel}</label>

    ${_arrayValue.map((item, index) => {
      const required = this._computeIsRequired(schema);
      const warningMessage = _arrayWarningMessages[index];
      return html`
    <div class="array-item">
      <anypoint-input
        .value="${item.value}"
        ?required="${!_nilEnabled && required}"
        .pattern="${schema.pattern}"
        .name="${name}"
        autoValidate
        .type="${ /** @type any */(schema.inputType)}"
        .min="${typeof schema.minimum !== 'undefined' ? String(schema.minimum) : undefined}"
        .max="${typeof schema.maximum !== 'undefined' ? String(schema.maximum) : undefined}"
        .maxLength="${schema.maxLength}"
        .minLength="${schema.minLength}"
        noLabelFloat
        ?readonly="${readOnly}"
        ?disabled="${disabled || _nilEnabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        data-type="array"
        data-index="${index}"
        @input="${this._arrayValueHandler}"
        invalidMessage="${`${name} is invalid. Check documentation.`}"
        .infoMessage="${warningMessage}"
      >
        <label slot="label">${itemLabel}</label>
      </anypoint-input>
      ${index ? html`<anypoint-icon-button
        class="action-icon"
        data-index="${index}"
        ?compatibility="${compatibility}"
        @click="${this._removeArrayValue}"
        title="Remove array value"
        ?disabled="${this.readOnly || disabled}"
      >
        <arc-icon icon="removeCircleOutline"></arc-icon>
      </anypoint-icon-button>` : undefined}
    </div>`;
    })}
    <div class="add-action">
      <anypoint-button
        @click="${this.addEmptyArrayValue}"
        title="Add an array value"
        ?disabled="${readOnly || disabled}"
        ?compatibility="${compatibility}"
      >
        <arc-icon class="action-icon" icon="addCircleOutline"></arc-icon>
        Add array value
      </anypoint-button>
    </div>
    `;
  }

  /**
   * Determines whether the schema is required. Returns true for
   * non-text inputs, returns false if the schema is a text type
   * and has no minCount or pattern restrictions
   * @param {AmfFormItemSchema} schema
   * @returns {Boolean}
   */
  _computeIsRequired(/** @type AmfFormItemSchema */ schema) {
    if (this._computeIsTextInput(schema)) {
      return (schema.minLength > 0 || Boolean(schema.pattern)) && schema.required;
    } 
      return schema.required;
    
  }

  /**
   * Determines whether warning message should be returned.
   * If value is present, show nothing.
   * Otherwise, return message if schema is text input, required, and
   * input is not required.
   * @param {AmfFormItemSchema} schema
   * @param {Boolean} required Input field computed required value
   * @returns {String|undefined}
   */
  _computeInputWarningMessage(value, required, /** @type AmfFormItemSchema */ schema) {
    if (!value && this._computeIsTextInput(schema) && !required && schema.required) {
      return `Value is required but currently empty.`
    }
    return undefined;
  }

  /**
   * Determines whether the schema for a form item
   * describes a text inpuot
   * @param {AmfFormItemSchema} schema 
   * @returns {Boolean} True is there is no input type, or if it 'text'
   */
  _computeIsTextInput(/** @type AmfFormItemSchema */ schema) {
    return !schema.inputType || schema.inputType === 'text';
  }

  /**
   * Set `_valueWarningMessage` based on `_value`'s content and
   * the model's schema.
   */
  _updateValueWarningMessage() {
    const { model, value } = this
    const viewModel = /** @type AmfFormItem */ model;
    if (!viewModel) {
      return;
    }
    const { schema = {} } = viewModel;
    const required = this._computeIsRequired(schema);
    this._valueWarningMessage = this._computeInputWarningMessage(value, required, schema);
  }

  /**
   * Set `_arrayWarningMessages` at @index based on the value of the array
   * at `index` value, using model's schema.
   * @param {Number} index Index of value in `_arrayValue` array
   */
  _updateArrayValueWarningMessage(index) {
    const { model, _arrayValue } = this;
    const { value } = _arrayValue[index];
    const viewModel = /** @type AmfFormItem */ model;
    if (!viewModel) {
      return;
    }
    const { schema = {} } = viewModel;
    const required = this._computeIsRequired(schema);
    this._arrayWarningMessages[index] = this._computeInputWarningMessage(value, required, schema);
  }

  /**
   * Adds new empty warning message to `_arrayWarningMessages` array
   * and immediately calls method to update the warning message at that
   * index.
   */
  _addEmptyArrayWarningMessage() {
    this._arrayWarningMessages = [...this._arrayWarningMessages, ''];
    this._updateArrayValueWarningMessage(this._arrayWarningMessages.length - 1);
  }

  /**
   * Removes warning messages at specified index.
   * @param {Number} index Index of `_arrayWarningMessages` array
   */
  _removeArrayWarningMessage(index) {
    const value = this._arrayWarningMessages;
    value.splice(index, 1);
    this._arrayWarningMessages = [...value];
  }

  _setWarningMessagesForArray(values) {
    if (!values) {
      return;
    }
    for (let i = 0; i < values.length; i++) {
      this._addEmptyArrayWarningMessage();
    }
  }
}
