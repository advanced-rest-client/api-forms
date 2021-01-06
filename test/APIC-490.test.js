import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  const apiFile = 'APIC-490';

  describe('APIC-490', () => {
    [
      ['Full model', false],
      ['Compact model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        describe('computeViewModel()', () => {
          let amf;
          let element = /** @type ApiViewModel */ (null);
          let model;

          before(async () => {
            amf = await AmfLoader.load(/** @type boolean */ (compact), apiFile);
          });

          beforeEach( () => {
            element = new ApiViewModel({ amf });
          });

          describe('UnionShape', () => {
            it('generates view model for union query string', () => {
              model = AmfLoader.lookupOperationQueryString(amf, '/file', 'get');
              const result = element.computeViewModel(model[0]);
              assert.typeOf(result, 'array', 'result is an array');
              assert.lengthOf(result, 3, 'result has 3 items');
            });
          })

          describe('Array', () => {
            it('generates view model for string query parameter', () => {
              model = AmfLoader.lookupOperationParameters(amf, '/file2', 'get');
              const result = element.computeViewModel(model);
              assert.typeOf(result, 'array', 'result is an array');
              assert.lengthOf(result, 1, 'result has 1 item');
            });
          })

          describe('NodeShape', () => {
            it('generates view model for object query string', () => {
              model = AmfLoader.lookupOperationQueryString(amf, '/file3', 'get');
              const result = element.computeViewModel(model[0]);
              assert.typeOf(result, 'array', 'result is an array');
              assert.lengthOf(result, 2, 'result has 1 item');
            });
          })
        });
      });
    });
  });
});
