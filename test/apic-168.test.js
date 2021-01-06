import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  const apiFile = 'APIC-168';

  function getQueryStringShape(element, scheme) {
    const qKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.queryString);
    let result = element._ensureArray(scheme[qKey]);
    if (result) {
      [result] = result;
    }
    return result;
  }

  describe('APIC-168', () => {
    [
      ['Full model', false],
      ['Compact model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        describe('PropertyShape schema', () => {
          let amf;

          before(async () => {
            amf = await AmfLoader.load(/** @type boolean */ (compact), apiFile);
          });

          let element = /** @type ApiViewModel */ (null);
          let model;
          beforeEach(async () => {
            element = new ApiViewModel({ amf });
            element.clearCache();

            const scheme = AmfLoader.lookupSecurityScheme(amf, '/querystring2', 'get');
            model = getQueryStringShape(element, scheme);
          });

          it('generates view model', () => {
            const result = element.computeViewModel(model);
            assert.typeOf(result, 'array', 'result is an array');
            assert.lengthOf(result, 2, 'result has 2 items');
          });

          it('generates property names', () => {
            const result = element.computeViewModel(model);
            assert.equal(result[0].name, 'start', 'has name for #1');
            assert.equal(result[1].name, 'page-size', 'has name for #2');
          });

          it('has description when applicable', () => {
            const result = element.computeViewModel(model);
            assert.equal(result[0].schema.description, 'Start page', 'has name for #1');
            assert.isUndefined(result[1].schema.description, 'description is not set for #2');
          });

          it('has examples', () => {
            const result = element.computeViewModel(model);
            assert.lengthOf(result[0].schema.examples, 1, '#1 has 1 example');
            assert.lengthOf(result[1].schema.examples, 1, '#2 has 1 example');

            const [first, second] = result;
            assert.deepEqual(first.schema.examples[0], {
              hasTitle: false,
              hasUnion: false,
              hasRaw: true,
              isScalar: true,
              raw: '5',
              value: 5
            });

            assert.deepEqual(second.schema.examples[0], {
              hasTitle: false,
              hasUnion: false,
              hasRaw: false,
              isScalar: true,
              value: 0
            });
          });
        });

        describe('ScalarShape schema', () => {
          let amf;

          before(async () => {
            amf = await AmfLoader.load(/** @type boolean */ (compact), apiFile);
          });

          let element = /** @type ApiViewModel */ (null);
          let model;
          beforeEach(async () => {
            element = new ApiViewModel({ amf });
            element.clearCache();

            const scheme = AmfLoader.lookupSecurityScheme(amf, '/querystring', 'get');
            model = getQueryStringShape(element, scheme);
          });

          it('generates view model', () => {
            const result = element.computeViewModel(model);
            assert.typeOf(result, 'array', 'result is an array');
            assert.lengthOf(result, 1, 'result has 1 item');
          });

          it('generates property name', () => {
            const result = element.computeViewModel(model);
            assert.equal(result[0].name, 'queryString');
          });

          it('generates property type', () => {
            const result = element.computeViewModel(model);
            assert.equal(result[0].schema.apiType, 'integer');
          });
          // Apparently the model has no information about this property being required.
          // See demo/APIC-168/APIC-168.raml
          // securitySchemes > queryString > describedBy > queryString
          it.skip('item is required', () => {
            const result = element.computeViewModel(model);
            assert.isTrue(result[0].schema.required);
          });
        });
      });
    });
  });
});
