import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  const apiFile = 'APIC-666';

  describe('APIC-666', () => {
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

          describe('Array', () => {
            it('generates view model for string query parameter', () => {
              model = AmfLoader.lookupOperationParameters(amf, '/weatherReports500', 'get');
              const result = element.computeViewModel(model);
              assert.typeOf(result, 'array', 'result is an array');
              assert.lengthOf(result, 9, 'result has 1 item');
              assert.equal(result[0].schema.inputType, 'number');
              assert.isUndefined(result[0].schema.format);
              assert.equal(result[1].schema.inputType, 'number');
              assert.equal(result[1].schema.format, 'integer');
              assert.equal(result[2].schema.inputType, 'number');
              assert.equal(result[2].schema.format, 'integer');
              assert.equal(result[3].schema.inputType, 'number');
              assert.equal(result[3].schema.format, 'integer');
              assert.equal(result[4].schema.inputType, 'number');
              assert.equal(result[4].schema.format, 'integer');
              assert.equal(result[5].schema.inputType, 'number');
              assert.equal(result[5].schema.format, 'integer');
              assert.equal(result[6].schema.inputType, 'number');
              assert.equal(result[6].schema.format, 'integer');
              assert.equal(result[7].schema.inputType, 'number');
              assert.equal(result[7].schema.format, 'long');
              assert.equal(result[8].schema.inputType, 'number');
              assert.equal(result[8].schema.format, 'float');
              assert.equal(result[9].schema.inputType, 'number');
              assert.equal(result[9].schema.format, 'double');
            });
          })
        });
      });
    });
  });
});
