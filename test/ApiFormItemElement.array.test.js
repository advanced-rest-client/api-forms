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

  describe('Array values', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let model;
    beforeEach(async () => {
      element = await basicFixture();
      model = {
        name: '',
        value: undefined,
        schema: {
          isArray: true,
          inputType: 'number',
          minimum: 2,
          maximum: 20
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('isEnum is false', () => {
      assert.isFalse(element._isEnum);
    });

    it('isInput is false', () => {
      assert.isFalse(element._isInput);
    });

    it('isArray is true', () => {
      assert.isTrue(element._isArray);
    });

    it('isBoolean is false', () => {
      assert.isFalse(element._isBoolean);
    });

    it('arrayValue is computed', () => {
      assert.typeOf(element._arrayValue, 'array');
    });

    it('Drop downs are not rendered', () => {
      const node = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.notOk(node);
    });

    it('<label> for array values is rendered', () => {
      const node = element.shadowRoot.querySelector('label');
      assert.ok(node);
    });

    it('Has no inputs', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-input');
      assert.lengthOf(nodes, 0);
    });

    it('Will not pass validation for invalid value', async () => {
      element.addEmptyArrayValue();
      element._arrayValue[0].value = 1;
      element._arrayValue = [...element._arrayValue];
      await nextFrame();
      assert.isFalse(element.validate());
    });

    it('Will pass validation for valid value', async () => {
      element.addEmptyArrayValue();
      element._arrayValue[0].value = 2;
      element._arrayValue = [...element._arrayValue];
      await nextFrame();
      assert.isTrue(element.validate());
    });

    it('Adds action button adds new input', async () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-action anypoint-button'));
      node.click();
      await nextFrame();

      const nodes = element.shadowRoot.querySelectorAll('.array-item');
      assert.lengthOf(nodes, 1);
    });

    it('sets value from array input', async () => {
      element.addEmptyArrayValue();
      await nextFrame();
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.array-item anypoint-input'));
      node.value = 'test';
      node.dispatchEvent(new CustomEvent('input'));
      assert.lengthOf(/** @type any */ (element.value), 1);
      assert.equal(element.value[0], 'test');
    });

    it('Removes value when button click', async () => {
      element.addEmptyArrayValue();
      element.addEmptyArrayValue();
      await nextFrame();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.array-item anypoint-icon-button'));
      node.click();
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.array-item');
      assert.lengthOf(nodes, 1);
    });

    it('adds new value on button click', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-action anypoint-button'));
      button.click();
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.array-item');
      assert.lengthOf(nodes, 1);
    });

    it('adds new value on icon click', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.add-action arc-icon'));
      button.click();
      await nextFrame();
      const nodes = element.shadowRoot.querySelectorAll('.array-item');
      assert.lengthOf(nodes, 1);
    });

    it('creates array value from string when changing type', () => {
      element._isInput = true;
      element._isArray = false;
      element.value = 'test';
      element._isInput = false;
      element._isArray = true;
      assert.deepEqual(element._arrayValue, [{ value: 'test' }]);
    });

    it('silently ignores invalid remove', () => {
      element.addEmptyArrayValue();
      // @ts-ignore
      element._removeArrayValue({
        currentTarget: document.createElement('span')
      });
      assert.lengthOf(element._arrayValue, 1);
    });
  });

  describe('Array values: a11y', () => {
    let model;
    beforeEach(() => {
      model = {
        schema: {
          isArray: true,
          inputType: 'number',
          minimum: 2,
          maximum: 20
        },
        value: ['value 1', 'value 2']
      };
    });

    it('is accessible with values', async () => {
      const element = await basicFixture();
      element.model = model;
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
          isArray: true,
          inputType: 'number',
          minimum: 2,
          maximum: 20
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('dispatches change event', async () => {
      const inputValue = 'test-input';
      element.addEmptyArrayValue();
      await nextFrame();
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.array-item anypoint-input'));
      node.value = inputValue;
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      node.dispatchEvent(new CustomEvent('input'));
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].target.value, inputValue, 'target has value');
    });
  });
});
