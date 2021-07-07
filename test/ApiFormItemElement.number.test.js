import {
  fixture,
  assert,
  html,
  nextFrame
} from '@open-wc/testing';
import * as sinon from 'sinon';
import '../api-form-item.js';

/** @typedef {import('..').ApiFormItemElement} ApiFormItemElement */

describe('ApiFormItemElement', () => {
  /**
   * @return {Promise<ApiFormItemElement>} 
   */
  async function basicFixture() {
    return (fixture(html `<api-form-item></api-form-item>`));
  }

  describe('Number values', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let model;
    beforeEach(async () => {
      element = await basicFixture();
      model = {
        name: '',
        value: undefined,
        schema: {
          inputType: 'number',
          minimum: 10,
          maximum: 100
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('isEnum is false', () => {
      assert.isFalse(element._isEnum);
    });

    it('isInput is true', () => {
      assert.isTrue(element._isInput);
    });

    it('isArray is false', () => {
      assert.isFalse(element._isArray);
    });

    it('isBoolean is false', () => {
      assert.isFalse(element._isBoolean);
    });

    it('arrayValue is undefined', () => {
      assert.isUndefined(element._arrayValue);
    });

    it('Dropdown is not rendered', () => {
      const {shadowRoot} = element;
      const menu = shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.notOk(menu);
    });

    it('Input type is number', () => {
      const {shadowRoot} = element;
      const node = shadowRoot.querySelector('anypoint-input');
      assert.equal(node.type, model.schema.inputType);
    });

    it('Passing minimum model property', () => {
      const {shadowRoot} = element;
      const node = shadowRoot.querySelector('anypoint-input');
      assert.ok(node.min);
      assert.equal(node.min, model.schema.minimum);
    });

    it('Passing maximum model property', () => {
      const {shadowRoot} = element;
      const node = shadowRoot.querySelector('anypoint-input');
      assert.ok(node.max);
      assert.equal(node.max, model.schema.maximum);
    });

    it('Will not pass validation for invalid value', async () => {
      element.value = 1;
      await nextFrame();
      assert.isFalse(element.validate());
    });

    it('passes validation for valid value', async () => {
      element.value = 10;
      await nextFrame();
      assert.isTrue(element.validate());
    });
  });

  describe('Number values: a11y', () => {
    let model;
    beforeEach(() => {
      model = {
        schema: {
          inputType: 'number',
          inputLabel: 'test label',
          minimum: 10,
          maximum: 100
        }
      };
    });

    it('is accessible in normal state', async () => {
      const element = await basicFixture();
      element.model = model;
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible when invalid', async () => {
      const element = await basicFixture();
      element.model = model;
      element.value = 1;
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible when disabled', async () => {
      const element = await basicFixture();
      element.model = model;
      element.readOnly = true;
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible when outlined', async () => {
      const element = await basicFixture();
      element.model = model;
      element.outlined = true;
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });

    it('is accessible when compatibility', async () => {
      const element = await basicFixture();
      element.model = model;
      element.compatibility = true;
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast'],
      });
    });
  });

  describe('change event', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let model;
    beforeEach(async () => {
      element = await basicFixture();
      model = {
        name: '',
        value: '',
        schema: {
          inputType: 'number',
          minimum: 10,
          maximum: 100
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('dispatches change event', async () => {
      const inputValue = 15;
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-input');
      node.value = inputValue;
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      node.dispatchEvent(new CustomEvent('input'));
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].target.value, inputValue, 'target has value');
    });

    it('dispatches change event on change', async () => {
      const inputValue = 15;
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-input');
      node.value = inputValue;
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      node.dispatchEvent(new CustomEvent('change'));
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].target.value, inputValue, 'target has value');
    });
  });

  describe('Number values', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let model;
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      [undefined, 'any'],
      ['int', '1'],
      ['int8', '1'],
      ['int16', '1'],
      ['int32', '1'],
      ['long', '1'],
      ['float', 'any'],
      ['double', 'any']
    ].forEach(([format, expectedStep]) => {
      it(`${expectedStep} step for ${format} input`, async () => {
        model = {
          name: '',
          value: undefined,
          schema: {
            required: true,
            format,
            inputType: 'number'
          }
        };
        element.model = model;
        await nextFrame();

        const node = element.shadowRoot.querySelector('anypoint-input');
        assert.equal(node.step, expectedStep);
      });
    })

    it('step matching multipleOf value if defined', async () => {
      const multipleOf = 0.1;
      model = {
        name: '',
        value: undefined,
        schema: {
          required: true,
          multipleOf,
          inputType: 'number'
        }
      };
      element.model = model;
      await nextFrame();

      const node = element.shadowRoot.querySelector('anypoint-input');
      assert.equal(node.step, multipleOf);
    });
  });
});
