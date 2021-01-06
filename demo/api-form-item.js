import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import '../api-form-item.js';

/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.AmfFormItem} AmfFormItem */

class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'readOnly', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11',
      'outlined'
    ]);
    this.componentName = 'api-form-item';
    this._readonlyHandler = this._readonlyHandler.bind(this);
    this._valueHandler = this._valueHandler.bind(this);
    this._inputStyleChange = this._inputStyleChange.bind(this);

    this.readOnly = false;
    this.outlined = false;
    this.v1 = 'Value';
    this.v2 = undefined;
    this.v3 = undefined;
    this.v4 = undefined;
    this.v5 = undefined;
    this.v6 = undefined;
    this.v7 = undefined;
    this.v8 = undefined;
    this.v9 = undefined;
    this.v10 = undefined;
    this.v11 = undefined;
    this.m1 = /** @type AmfFormItem */ ({ 
      name: '', 
      value: undefined, 
      schema: { inputLabel: 'Enter value' },
    });
    this.m2 = /** @type AmfFormItem */({ 
      name: '', 
      value: undefined, 
      schema: { inputLabel: 'Enter value', pattern: '[a-zA-Z0-9_]*' } 
    });
    this.m3 = /** @type AmfFormItem */ ({ 
      name: '', 
      value: undefined, 
      schema: { inputLabel: 'Enter value', required: true } 
    });
    this.m4 = /** @type AmfFormItem */({ 
      name: '', 
      value: undefined, 
      schema: {
        inputLabel: 'Enter value',
        inputPlaceholder: 'This is the placeholder',
      }
    });
    this.m5 = /** @type AmfFormItem */({ 
      name: '', 
      value: undefined, 
      schema: {
        inputLabel: 'Enter number value',
        inputType: 'number',
        minimum: 1,
        maximum: 100
      } 
    });
    this.m6 = /** @type AmfFormItem */({
      name: '', 
      value: undefined,
      schema: { inputLabel: 'Select date', inputType: 'date' } 
    });
    this.m7 = /** @type AmfFormItem */({
      name: '', 
      value: undefined,
      schema: {
        required: true,
        inputLabel: 'Select fruit',
        enum: ['apple', 'banana', 'cherries', 'grapes', 'lemon', 'orange', 'pear', 'watermelon']
      }
    });
    this.m8 = /** @type AmfFormItem */({ 
      name: '', 
      value: undefined, 
      schema: { inputLabel: 'Select boolean value', isBool: true, required: true, } 
    });
    this.m9 = /** @type AmfFormItem */({
      name: '', 
      value: undefined, 
      schema: {
        required: true,
        inputLabel: 'Enter values',
        isArray: true,
        inputType: 'text',
        minLength: 2,
        maxLength: 20,
        isNillable: true
      }
    });
    this.m10 = /** @type AmfFormItem */({
      name: '', 
      value: undefined, 
      schema: {
        required: true,
        apiType: 'union',
        inputLabel: 'Value or nil',
        isNillable: true,
        inputType: 'text'
      }
    });

    this.m11 = /** @type AmfFormItem */({
      name: '', 
      value: undefined, 
      schema: {
        required: true,
        apiType: 'union',
        inputLabel: 'Enum or nil',
        isNillable: true,
        inputType: 'text',
        enum: ['apple', 'banana', 'cherries', 'grapes', 'lemon', 'orange', 'pear', 'watermelon']
      }
    });
  }

  _readonlyHandler(e) {
    this.readOnly = e.target.checked;
  }

  _valueHandler(e) {
    const prop = e.target.dataset.target;
    this[prop] = e.target.value;
  }

  _inputStyleChange(e) {
    const { value } = e.detail;
    
    this.outlined = value === 1;
    this.compatibility = value === 2;
    this._updateCompatibility();
  }

  contentTemplate() {
    const {
      readOnly,
      outlined,
      compatibility,
    } = this;
    return html`
      <div class="demo-container">
        <section class="card">
          <h3>Configuration</h3>
          <anypoint-switch @checked-changed="${this._readonlyHandler}">Read only</anypoint-switch>

          <label id="styleLabel">Style</label>
          <anypoint-radio-group aria-labelledby="styleLabel" @selected-changed="${this._inputStyleChange}">
            <anypoint-radio-button name="inputStyle" checked>Filled</anypoint-radio-button>
            <anypoint-radio-button name="inputStyle">Outlined</anypoint-radio-button>
            <anypoint-radio-button name="inputStyle">Compatibility</anypoint-radio-button>
          </anypoint-radio-group>
        </section>
      </div>

      <section class="card">
        <h3>Text editor</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m1}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="simpleModel"
          data-target="v1"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v1}</code>
      </section>

      <section class="card">
        <h3>Text editor with pattern</h3>
        <p>Pattern: <code>[a-zA-Z0-9_]*</code></p>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m2}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="patternModel"
          data-target="v2"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v2}</code>
      </section>

      <section class="card">
        <h3>Required input</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m3}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          required
          name="requiredModel"
          data-target="v3"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v3}</code>
      </section>

      <section class="card">
        <h3>With placeholder</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m4}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="placeholderModel"
          data-target="v4"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v4}</code>
      </section>

      <section class="card">
        <h3>Number editor</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m5}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="numericModel"
          data-target="v5"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v5}</code>
      </section>

      <section class="card">
        <h3>Date editor</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m6}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="dateModel"
          data-target="v6"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v6}</code>
      </section>

      <section class="card">
        <h3>Enum values</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m7}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="enumModel"
          data-target="v7"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v7}</code>
      </section>

      <section class="card">
        <h3>Boolean value</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m8}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="enumModel"
          data-target="v8"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v8}</code>
      </section>

      <section class="card">
        <h3>Array value</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m9}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="arrayModel"
          data-target="v9"
          @change="${this._valueHandler}"
          isArray></api-form-item>
        <code>${this.v9 && this.v9.length ? JSON.stringify(this.v9, null, 2) : undefined}</code>
      </section>

      <section class="card">
        <h3>Enum with nil value</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m11}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="unionNilModel"
          data-target="v11"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v11}</code>
      </section>

      <section class="card">
        <h3>Union with nil value</h3>
        <api-form-item
          .readOnly="${readOnly}"
          .model="${this.m10}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          name="unionNilModel"
          data-target="v10"
          @change="${this._valueHandler}"></api-form-item>
        <code>${this.v10}</code>
      </section>
  `;
  }
}
const instance = new ComponentDemo();
instance.render();
