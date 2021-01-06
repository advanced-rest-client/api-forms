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

  describe('Boolean values', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let model;
    beforeEach(async () => {
      element = await basicFixture();
      model = {
        name: '',
        value: undefined,
        schema: {
          inputType: 'string',
          isBool: true
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

    it('isArray is false', () => {
      assert.isFalse(element._isArray);
    });

    it('isBoolean is true', () => {
      assert.isTrue(element._isBoolean);
    });

    it('arrayValue is undefined', () => {
      assert.isUndefined(element._arrayValue);
    });

    it('Dropdown is rendered', () => {
      const {shadowRoot} = element;
      const menu = shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.equal(menu.dataset.type, 'boolean');
    });

    it('Has no inputs', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-input');
      assert.lengthOf(nodes, 0);
    });

    it('Always passes validation', () => {
      assert.isTrue(element.validate());
    });

    it('sets boolean false value from list selection', () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-value="false"]'));
      item.click();
      assert.equal(element.value, false);
    });

    it('sets boolean true value from list selection', () => {
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-value="true"]'));
      item.click();
      assert.equal(element.value, true);
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
  });

  describe('Boolean values: a11y', () => {
    let model;
    beforeEach(() => {
      model = {
        schema: {
          inputType: 'string',
          isBool: true
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
          isBool: true
        }
      };
      // @ts-ignore
      element.model = model;
      await nextFrame();
    });

    it('dispatches change event on boolean selection', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('anypoint-item[data-value="true"]'));
      item.click();
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].target.value, true, 'target has value');
    });
  });
});
