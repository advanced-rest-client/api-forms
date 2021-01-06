import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import '../api-form-item.js';

/** @typedef {import('..').ApiFormItemElement} ApiFormItemElement */

describe('ApiFormItemElement', () => {
  /**
   * @return {Promise<ApiFormItemElement>} 
   */
  async function basicFixture() {
    return (fixture(html `<api-form-item></api-form-item>`));
  }

  /**
   * @return {Promise<ApiFormItemElement>} 
   */
  async function nilFixture() {
    return (fixture(html `<api-form-item value="test"></api-form-item>`));
  }

  describe('Basics', () => {
    it('_isInput is default value without the model', async () => {
      const element = await basicFixture();
      assert.isTrue(element._isInput);
    });
  });

  describe('_getInputElement()', () => {
    it('returns anypoint-input for text types', async () => {
      const element = await basicFixture();
      element.model = {
        name: '',
        value: '',
        schema: {
          inputType: 'text'
        }
      };
      await nextFrame();
      const result = /** @type HTMLElement */ (element._getInputElement());
      assert.ok(result);
      assert.equal(result.nodeName, 'ANYPOINT-INPUT');
    });

    it('returns anypoint-dropdown-menu for enum type', async () => {
      const element = await basicFixture();
      element.model = {
        name: '',
        value: '',
        schema: {
          inputType: 'text',
          enum: ['apple', 'banana', 'cherries']
        }
      };
      await nextFrame();
      const result = /** @type HTMLElement */ (element._getInputElement());
      assert.ok(result);
      assert.equal(result.nodeName, 'ANYPOINT-DROPDOWN-MENU');
    });

    it('returns anypoint-dropdown-menu for boolean type', async () => {
      const element = await basicFixture();
      element.model = {
        value: 'true',
        name: '',
        schema: {
          inputType: 'text',
          isBool: true,
        }
      };
      await nextFrame();
      const result = /** @type HTMLElement */ (element._getInputElement());
      assert.ok(result);
      assert.equal(result.nodeName, 'ANYPOINT-DROPDOWN-MENU');
    });

    it('returns nodes list for array type', async () => {
      const element = await basicFixture();
      element.model = {
        name: 'test',
        value: ['a', 'b'],
        schema: {
          required: false,
          isArray: true
        }
      };
      await nextFrame();
      const result = /** @type any[] */ (element._getInputElement());
      assert.lengthOf(Array.from(result), 2);
    });
  });

  describe('_nillableChanged()', () => {
    let element = /** @type ApiFormItemElement */ (null);
    let button;

    beforeEach(async () => {
      element = await nilFixture();
      element.model = {
        name: '',
        value: '',
        schema: {
          inputType: 'text',
          isNillable: true
        }
      };
      await nextFrame();
      button = element.shadowRoot.querySelector('.nil-option');
    });

    it('disables the input when nil is enabled', async () => {
      button.click();
      await nextFrame();
      const input = element._getInputElement();
      assert.isTrue(input.disabled);
    });

    it('Re-enables the input', async () => {
      button.click();
      await nextFrame();
      button.click();
      await nextFrame();
      const input = element._getInputElement();
      assert.isFalse(input.disabled);
    });

    it('Sets _nilEnabled property when nil enabled', () => {
      button.click();
      assert.isTrue(element._nilEnabled);
    });

    it('Sets _nilEnabled property when nil disabled', async () => {
      button.click();
      await nextFrame();
      button.click();
      assert.isFalse(element._nilEnabled);
    });

    it('Sets _oldNilValue property', () => {
      button.click();
      assert.equal(element._oldNilValue, 'test');
    });

    it('Clears _oldNilValue property', async () => {
      button.click();
      await nextFrame();
      button.click();
      assert.isUndefined(element._oldNilValue);
    });

    it('Sets value to nil', () => {
      button.click();
      assert.equal(element.value, 'nil');
    });

    it('Re-sets value', async () => {
      button.click();
      await nextFrame();
      button.click();
      assert.equal(element.value, 'test');
    });

    it('Re-sets empty value', async () => {
      element.value = '';
      button.click();
      await nextFrame();
      button.click();
      assert.equal(element.value, '');
    });
  });

  describe('_defaultValidator()', () => {
    let element = /** @type ApiFormItemElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns true when no model', () => {
      const result = element._defaultValidator();
      assert.isTrue(result);
    });

    it('Returns true when no value and not required', () => {
      element.model = {
        name: 'test',
        value: '',
        schema: {
          required: false,
        }
      };
      const result = element._defaultValidator();
      assert.isTrue(result);
    });

    it('Returns true when value and required', () => {
      element.model = {
        name: 'test',
        value: 'test',
        schema: {
          required: true,
        }
      };
      const result = element._defaultValidator();
      assert.isTrue(result);
    });

    it('Returns false when no value and required', () => {
      element.model = {
        name: 'test',
        value: '',
        schema: {
          required: true,
        }
      };
      const result = element._defaultValidator();
      assert.isFalse(result);
    });
  });

  describe('_itemsForArray()', () => {
    let element = /** @type ApiFormItemElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns array from string input', () => {
      const result = element._itemsForArray('test');
      assert.deepEqual(result, [{
        value: 'test'
      }]);
    });

    it('Returns array from array input', () => {
      const result = element._itemsForArray(['test']);
      assert.deepEqual(result, [{
        value: 'test'
      }]);
    });
  });

  describe('_prepareArraySchema()', () => {
    let element = /** @type ApiFormItemElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets _isArray', () => {
      const model = {
        name: 'test',
        value: '',
        schema: {
          required: false,
          isArray: true
        }
      };
      element._prepareArraySchema(model);
      assert.isTrue(element._isArray);
    });

    it('Sets default value when model value is not an array', () => {
      const model = {
        name: 'test',
        value: '',
        schema: {
          required: false,
          isArray: true
        }
      };
      element._prepareArraySchema(model);
      assert.deepEqual(element._arrayValue, []);
    });

    it('Sets value from the model', () => {
      const model = {
        name: 'test',
        value: ['a', 'b'],
        schema: {
          required: false,
          isArray: true
        }
      };
      element._prepareArraySchema(model);
      assert.deepEqual(element._arrayValue, [{
        value: 'a'
      }, {
        value: 'b'
      }]);
    });
  });
});
