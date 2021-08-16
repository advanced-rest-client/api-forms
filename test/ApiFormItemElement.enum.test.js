import {
  fixture,
  assert,
  html,
  nextFrame
} from '@open-wc/testing';
import sinon from 'sinon';
import '../api-form-item.js';
import { enumTemplate } from '../src/ApiFormItemElement.js';

/** @typedef {import('..').ApiFormItemElement} ApiFormItemElement */

describe('ApiFormItemElement', () => {
  /**
   * @return {Promise<ApiFormItemElement>} 
   */
  async function basicFixture() {
    return (fixture(html `<api-form-item></api-form-item>`));
  }

  describe('Enum values', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let model;
    beforeEach(async () => {
      element = await basicFixture();
      model = {
        name: '',
        value: undefined,
        schema: {
          inputType: 'string',
          enum: ['apple', 'banana', 'cherries']
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('isEnum is true', () => {
      assert.isTrue(element._isEnum);
    });

    it('isInput is false', () => {
      assert.isFalse(element._isInput);
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

    it('Dropdown is rendered', () => {
      const {shadowRoot} = element;
      const menu = shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.equal(menu.dataset.type, 'enum');
    });

    it('Has no inputs', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-input');
      assert.lengthOf(nodes, 0);
    });

    it('Always passes validation', () => {
      assert.isTrue(element.validate());
    });

    it('renders template when no enum values', async () => {
      element.model = {
        name: '',
        value: '',
        schema: {},
      };
      const result = element[enumTemplate]();
      assert.ok(result);
    });

    it('sets value from list selection', () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-value="apple"]'));
      item.click();
      assert.equal(element.value, 'apple');
    });

    it('passes outlined style property', async () => {
      element.outlined = true;
      await nextFrame();
      const menu = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.isTrue(menu.outlined, 'dropdown has the property');
    });

    it('passes compatibility style property', async () => {
      element.compatibility = true;
      await nextFrame();
      const menu = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.isTrue(menu.compatibility, 'dropdown has the property');
      const listbox = element.shadowRoot.querySelector('anypoint-listbox');
      assert.isTrue(listbox.compatibility, 'listbox has the property');
    });

    it('adds an empty list value when optional', async () => {
      element.model.schema.required = false;
      await element.requestUpdate();
      const items = element.shadowRoot.querySelectorAll('anypoint-item');
      assert.lengthOf(items, 4, 'has an extra item');
      const item = items[0];
      assert.equal(item.getAttribute('data-value'), '', 'has no value');
    });
  });

  describe('Enum values: a11y', () => {
    let model;
    beforeEach(() => {
      model = {
        schema: {
          inputType: 'string',
          isEnum: true,
          enum: ['apple', 'banana', 'cherries']
        }
      };
    });

    it('is accessible', async () => {
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
          inputType: 'string',
          enum: ['apple', 'banana', 'cherries']
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('dispatches change event', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-value="apple"]'));
      item.click();
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].target.value, 'apple', 'target has value');
    });
  });
});
