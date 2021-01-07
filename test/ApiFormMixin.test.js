import { fixture, html, assert, nextFrame } from '@open-wc/testing';
import './form-mixin-element.js';

/** @typedef {import('./form-mixin-element').FormMixinElement} FormMixinElement */

describe('ApiFormMixin', () => {
  /**
   * @return {Promise<FormMixinElement>} 
   */
  async function basicFixture() {
    return fixture(html`<form-mixin-element></form-mixin-element>`);
  }

  /**
   * @return {Promise<FormMixinElement>} 
   */
  async function allowOptionalFixture() {
    return fixture(html`<form-mixin-element allowHideOptional></form-mixin-element>`);
  }

  /**
   * @return {Promise<FormMixinElement>} 
   */
  async function allowCustomFixture() {
    return fixture(html`<form-mixin-element allowCustom></form-mixin-element>`);
  }

  describe('Basic computations', () => {
    it('hasOptional is not computed when model and allowHideOptional is not set', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.hasOptional);
    });

    it('renderOptionalCheckbox is not computed when model and allowHideOptional is not set', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.renderOptionalCheckbox);
    });

    it('hasOptional is computed when allowHideOptional is set', async () => {
      const element = await allowOptionalFixture();
      assert.isFalse(element.hasOptional);
    });

    it('renderOptionalCheckbox is computed when allowHideOptional is set', async () => {
      const element = await allowOptionalFixture();
      assert.isFalse(element.renderOptionalCheckbox);
    });

    it('renderEmptyMessage is true', async () => {
      const element = await basicFixture();
      assert.isTrue(element.renderEmptyMessage);
    });

    it('renderEmptyMessage is false when custom are allowed', async () => {
      const element = await allowCustomFixture();
      assert.isFalse(element.renderEmptyMessage);
    });

    it('renderEmptyMessage is false when model is set', async () => {
      const element = await basicFixture();
      element.apiModel = [{ name: '', value: '', schema: {} }];
      assert.isFalse(element.renderEmptyMessage);
    });

    it('renderEmptyMessage goes back to false', async () => {
      const element = await basicFixture();
      element.apiModel = [{ name: '', value: '', schema: {} }];
      assert.isFalse(element.renderEmptyMessage);
      element.apiModel = undefined;
      assert.isTrue(element.renderEmptyMessage);
    });
  });

  describe('computeFormRowClass()', () => {
    let element = /** @type FormMixinElement */ (null);
    before(async () => {
      element = await basicFixture();
    });

    it('returns the function without parameters', () => {
      const result = element.computeFormRowClass(undefined);
      assert.typeOf(result, 'function');
    });

    it('adds required class', async () => {
      element.apiModel = [{
        name: '',
        value: '',
        schema: {
          required: true,
        },
      }];
      await nextFrame();
      const div = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('.param-value'));
      assert.isTrue(div.classList.contains('required'));
    });

    it('adds optional class', async () => {
      element.apiModel = [{
        name: '',
        value: '',
        schema: {
          required: false,
        },
      }];
      element.allowHideOptional = true;
      await nextFrame();
      const div = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('.param-value'));
      assert.isTrue(div.classList.contains('optional'));
    });

    it('adds with-optional class', async () => {
      element.apiModel = [{
        name: '',
        value: '',
        schema: {
          required: false,
        },
      }];
      element.allowHideOptional = true;
      element.optionalOpened = true;
      await nextFrame();
      const div = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('.param-value'));
      assert.isTrue(div.classList.contains('with-optional'));
    });

    it('adds has-enable-button class', async () => {
      element.apiModel = [{
        name: '',
        value: '',
        schema: {
          required: false,
        },
      }];
      element.allowHideOptional = false;
      element.optionalOpened = false;
      element.allowDisableParams = true;
      await nextFrame();
      const div = /** @type HTMLDivElement */ (element.shadowRoot.querySelector('.param-value'));
      assert.isTrue(div.classList.contains('has-enable-button'));
    });
  });

  describe('toggleOptionalParams()', () => {
    it('Does nothing when optional are not allowed', async () => {
      const element = await basicFixture();
      element.toggleOptionalParams();
      assert.isUndefined(element.optionalOpened);
    });

    it('Toggles optionalOpened property', async () => {
      const element = await allowOptionalFixture();
      element.toggleOptionalParams();
      assert.isTrue(element.optionalOpened);
    });

    it('Toggles back optionalOpened property', async () => {
      const element = await allowOptionalFixture();
      element.optionalOpened = true;
      element.toggleOptionalParams();
      assert.isFalse(element.optionalOpened);
    });
  });

  describe('serializeForm()', () => {
    const model = [
      {
        name: 'test-name',
        value: 'test-value',
        schema: {
          required: true,
        }
      },
      {
        name: 'test-name-1',
        value: 'test-value-1',
        schema: {
          required: true,
        }
      },
    ];

    it('returns empty object when no model', async () => {
      const element = await basicFixture();
      const result = element.serializeForm();
      assert.typeOf(result, 'object');
      assert.lengthOf(Object.keys(result), 0);
    });

    it('returns model values', async () => {
      const element = await basicFixture();
      element.apiModel = model;
      await nextFrame();
      const result = element.serializeForm();
      assert.typeOf(result, 'object');
      assert.lengthOf(Object.keys(result), 2);
    });
  });

  describe('_computeIsCustom()', () => {
    let element = /** @type FormMixinElement */ (null);
    before(async () => {
      element = await basicFixture();
    });

    it('returns false when no model', () => {
      assert.isFalse(element._computeIsCustom(undefined));
    });

    it('returns false when no schema', () => {
      assert.isFalse(element._computeIsCustom({ name: '', value: '' }));
    });

    it('returns false when no isCustom', () => {
      assert.isFalse(
        element._computeIsCustom({
          name: '', value: '',
          schema: {},
        })
      );
    });

    it('returns true when isCustom', () => {
      assert.isTrue(
        element._computeIsCustom({
          name: '', value: '',
          schema: {
            isCustom: true,
          },
        })
      );
    });
  });

  describe('addCustom()', () => {
    const model = {
      required: true,
      name: 'test-name',
      value: 'test-value',
    };
    let element = /** @type FormMixinElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('adds an item to an undefined model', () => {
      element.addCustom();
      assert.typeOf(element.apiModel, 'array');
      assert.lengthOf(element.apiModel, 1);
    });

    it('adds an item to an existing model', () => {
      element.apiModel = [model];
      element.addCustom();
      assert.lengthOf(element.apiModel, 2);
    });
  });

  describe('computeIsOptional()', () => {
    let model;
    let element = /** @type FormMixinElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      model = {
        name: 'test-name',
        value: 'test-value',
        schema: {
          required: false,
        }
      };
    });

    it('Returns false when hasOptional is false', () => {
      const result = element.computeIsOptional(false, model);
      assert.isFalse(result);
    });

    it('Returns true when required is false', () => {
      const result = element.computeIsOptional(true, model);
      assert.isTrue(result);
    });

    it('Returns false when required is true', () => {
      model.schema.required = true;
      const result = element.computeIsOptional(true, model);
      assert.isFalse(result);
    });
  });
});
