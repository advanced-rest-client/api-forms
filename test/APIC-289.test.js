import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  const apiFile = 'APIC-289';

  describe('APIC-289', () => {
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
          beforeEach(() => {
            element = new ApiViewModel({ amf });
            element.clearCache();
          });

          it('generates view model', () => {
            model = AmfLoader.lookupOperationParameters(amf, '/organization', 'get');
            const result = element.computeViewModel(model);

            assert.lengthOf(result, 1, 'result has 1 item');
            const [item] = result;
            assert.equal(item.name, 'foo');
          });
        });
      });
    });
  });
});
