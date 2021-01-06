import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  const apiFile = 'APIC-298';

  describe('APIC-298', () => {
    [
      // ['Full model', false],
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

            model = AmfLoader.lookupEndpointParameters(amf, '/prescreens/{id}');
          });

          it('generates view model', () => {
            const result = element.computeViewModel(model);
            assert.typeOf(result, 'array', 'result is an array');
            assert.lengthOf(result, 1, 'result has 1 item');
          });

          it('generates view data model', () => {
            const result = element.computeViewModel(model);
            const item = result[0];
            assert.equal(item.name, 'id', 'has name form input');
            assert.equal(item.schema.pattern,
              '^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$', 'has pattern');
            assert.equal(item.schema.inputLabel, 'id*', 'has input label');
          });
        });
      });
    });
  });
});
