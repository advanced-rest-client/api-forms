import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  [
    ['Regular model', false],
    ['Compact model', true]
  ].forEach((item) => {
    describe(String(item[0]), () => {
      describe('Model for headers', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        describe('computeViewModel()', () => {
          let model;
          let element = /** @type ApiViewModel */ (null);
          beforeEach(async () => {
            element = new ApiViewModel();
            element.clearCache();
            element.amf = amf;
            model = AmfLoader.lookupOperationHeaders(amf, '/people/{personId}', 'get');
          });

          it('Returns an array', () => {
            const result = element.computeViewModel(model);
            assert.typeOf(result, 'array');
          });

          it('Has 3 items', () => {
            const result = element.computeViewModel(model);
            assert.lengthOf(result, 3);
          });

          it('Item #1 has all defined properties', () => {
            const result = element.computeViewModel(model.slice(0, 1));
            const header = result[0];
            assert.equal(header.name, 'x-client-id', 'Name is set');
            assert.equal(header.value, '123456-acme.client.com', 'value is set');
            assert.typeOf(header.schema, 'object', 'Schema is set');
            assert.isTrue(header.enabled, 'Is enabled');
            
            const { schema } = header;
            assert.notEqual(schema.description.indexOf('The application id used'), -1, 'Description is set');
            assert.isTrue(schema.required, 'Required is set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.isUndefined(schema.enum, 'enum is undefined');
            assert.typeOf(schema.examples, 'array', 'Examples are set');
            assert.lengthOf(schema.examples, 1, 'Examples has 1 item');
            const example = schema.examples[0];
            assert.isUndefined(example.title, 'example.title is undefined');
            assert.equal(example.value, '123456-acme.client.com', 'example.value is set');
            assert.equal(schema.inputPlaceholder, 'Example: 123456-acme.client.com', 'inputPlaceholder is set');
            assert.equal(schema.inputLabel, 'x-client-id*', 'inputLabel is set and required');
            assert.equal(schema.inputType, 'text', 'inputType is set');
            assert.isFalse(schema.isArray, 'is not isArray');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.isUndefined(schema.items, 'items is undefined');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.isUndefined(schema.pattern, 'pattern is undefined');
            assert.equal(schema.apiType, 'string', 'type is set');
          });

          it('Item #2 has all defined properties', () => {
            const result = element.computeViewModel(model.slice(1, 2));
            const header = result[0];
            assert.isTrue(header.enabled, 'Is enabled');
            
            assert.equal(header.name, 'x-people-op-id', 'Name is set');
            assert.equal(header.value, '9719fa6f-c666-48e0-a191-290890760b30', 'Default value is set');
            assert.typeOf(header.schema, 'object', 'Schema is set');
            
            const {schema} = header;
            assert.notEqual(schema.description.indexOf('People'), -1, 'Description is set');
            assert.typeOf(schema.extendedDescription, 'string', 'extendedDescription is set');
            assert.isTrue(schema.required, 'Required is set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.isUndefined(schema.enum, 'enum is undefined');
            assert.typeOf(schema.examples, 'array', 'Examples are set');
            assert.lengthOf(schema.examples, 1, 'Examples has 1 item');
            const example = schema.examples[0];
            assert.isUndefined(example.title, 'example.title is undefined');
            assert.equal(example.value, '9719fa6f-c666-48e0-a191-290890760b30', 'example.value is set');
            assert.equal(schema.inputPlaceholder,
              'Example: 9719fa6f-c666-48e0-a191-290890760b30',
              'inputPlaceholder is set');
            assert.equal(schema.inputLabel, 'x-people-op-id*', 'inputLabel is set and required');
            assert.equal(schema.inputType, 'text', 'inputType is set');
            assert.isFalse(schema.isArray, 'is not isArray');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.isUndefined(schema.items, 'items is undefined');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.equal(schema.pattern,
              '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
              'pattern is set');
            assert.equal(schema.apiType, 'string', 'type is set');
          });

          it('Item #3 has all defined properties', () => {
            const result = element.computeViewModel(model.slice(2, 3));
            const header = result[0];

            assert.equal(header.name, 'x-enum', 'Name is set');
            assert.equal(header.value, 'a', 'value is set');
            assert.isTrue(header.enabled, 'Is enabled');
            assert.typeOf(header.schema, 'object', 'Schema is set');
            const {schema} = header;
            assert.equal(schema.extendedDescription, '', 'extendedDescription is not set');
            assert.isUndefined(schema.description, 'Description is undefined');
            assert.isTrue(schema.required, 'Required is set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.typeOf(schema.enum, 'array', 'enum is set');
            assert.lengthOf(schema.enum, 3, 'enum has 3 items');
            assert.deepEqual(schema.enum, ['a', 'b', 'c'], 'enum has model values');
            assert.isUndefined(schema.examples, 'Examples are set');
            assert.equal(schema.inputLabel, 'x-enum*', 'inputLabel is set and required');
            assert.equal(schema.inputType, 'text', 'inputType is set');
            assert.isFalse(schema.isArray, 'is not isArray');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.isUndefined(schema.items, 'items is undefined');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.isUndefined(schema.pattern, 'pattern is set');
            assert.equal(schema.apiType, 'string', 'type is set');
          });

          it('computes model with noAutoEncode set to true', async () => {
            const apiModel = await AmfLoader.load(/** @type boolean */ (item[1]), 'no-auto-encoding');
            element = new ApiViewModel();
            element.amf = apiModel;
            const server = AmfLoader.lookupServer(apiModel, 'http://{baseUri}');
            const variable = AmfLoader.getVariable(apiModel, server);
            const result = element.computeViewModel(variable);
            assert.lengthOf(result, 1);
            assert.isTrue(result[0].schema.noAutoEncode);
          });
        });

        describe('Nil values', () => {
          let model;
          let element = /** @type ApiViewModel */ (null);
          beforeEach(async () => {
            element = new ApiViewModel();
            element.clearCache();
            element.amf = amf;
            model = AmfLoader.lookupOperationHeaders(amf, '/people', 'get');
          });

          it('Nil value is set', () => {
            const result = element.computeViewModel(model.slice(1, 2));
            assert.equal(result[0].value, 'nil');
          });

          it('Item is read only', () => {
            const result = element.computeViewModel(model.slice(1, 2));
            assert.isTrue(result[0].schema.readOnly);
          });
        });
      });

      describe('Query parameters model', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        describe('computeViewModel()', () => {
          let model;
          let element = /** @type ApiViewModel */ (null);
          beforeEach(async () => {
            element = new ApiViewModel();
            element.clearCache();
            element.amf = amf;
            model = AmfLoader.lookupOperationParameters(amf, '/test-parameters/{feature}', 'get');
          });

          it('Resolves to an array', () => {
            const result = element.computeViewModel(model);
            assert.typeOf(result, 'array');
          });

          it('Has 3 items', () => {
            const result = element.computeViewModel(model);
            assert.lengthOf(result, 3);
          });

          it('Has computed data for #1', () => {
            const result = element.computeViewModel(model.slice(0, 1));
            const [modelItem] = result;

            assert.equal(modelItem.name, 'testRepeatable', 'Name is set');
            assert.typeOf(modelItem.value, 'array', 'Value is an array');
            assert.isTrue(modelItem.enabled, 'Is enabled');
            
            assert.typeOf(modelItem.schema, 'object', 'Schema is set');
            const { schema } = modelItem;
            assert.isUndefined(schema.description, 'Description is not set');
            assert.isTrue(schema.required, 'Required is set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.isUndefined(schema.enum, 'enum is undefined');
            assert.typeOf(schema.examples, 'array', 'Examples are set');
            assert.lengthOf(schema.examples, 1, 'Examples has 1 item');
            const [example] = schema.examples;
            assert.isUndefined(example.title, 'example.title is undefined');
            assert.equal(example.value, '[\n  "value1",\n  "value2"\n]', 'example.value is set');
            assert.equal(schema.inputPlaceholder, 'Example: [\n  "value1",\n  "value2"\n]', 'inputPlaceholder is set');
            assert.equal(schema.inputLabel, 'testRepeatable*', 'inputLabel is set and required');
            assert.equal(schema.inputType, 'text', 'inputType is set');
            assert.isTrue(schema.isArray, 'isArray is true');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.equal(schema.items, 'string', 'items is set');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.isUndefined(schema.pattern, 'pattern is undefined');
            assert.equal(schema.apiType, 'array', 'type is set');
          });

          it('Has computed data for #2', () => {
            const result = element.computeViewModel(model.slice(1, 2));
            const modelItem = result[0];
            assert.equal(modelItem.name, 'numericRepeatable', 'Name is set');
            assert.typeOf(modelItem.value, 'array', 'Value is an array');
            assert.deepEqual(modelItem.value, [123, 456], 'Value is set');
            assert.isTrue(modelItem.enabled, 'Is enabled');
            assert.typeOf(modelItem.schema, 'object', 'Schema is set');
            
            const { schema } = modelItem;
            assert.isUndefined(schema.description, 'Description is not set');
            assert.isTrue(schema.required, 'Required is set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.isUndefined(schema.enum, 'enum is undefined');
            assert.typeOf(schema.examples, 'array', 'Examples are set');
            assert.lengthOf(schema.examples, 2, 'Examples has 2 items');

            const example1 = schema.examples[0];
            assert.equal(example1.title, 'Some-test-example', 'example.title is undefined');
            assert.equal(example1.value, '[\n  123,\n  456\n]', 'example.value is set'); // <----- THIS IS WRONG!

            const example2 = schema.examples[1];
            assert.equal(example2.title, 'Other-example', 'example2.title is undefined');
            assert.equal(example2.value, '[\n  1011,\n  1213\n]', 'example2.value is set'); // <----- THIS IS WRONG!

            assert.equal(schema.inputPlaceholder,
              'Example: [\n  123,\n  456\n]', 'inputPlaceholder is set'); // <----- THIS IS WRONG! is it?
            assert.equal(schema.inputLabel, 'numericRepeatable*', 'inputLabel is set and required');
            assert.equal(schema.inputType, 'number', 'inputType is set');
            assert.isTrue(schema.isArray, 'isArray is true');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.equal(schema.items, 'integer', 'items is set');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.isUndefined(schema.pattern, 'pattern is undefined');
            assert.equal(schema.apiType, 'array', 'type is set');
          });

          it('Has computed data for #3', () => {
            const result = element.computeViewModel(model.slice(2));
            const [modelItem] = result;
            assert.equal(modelItem.name, 'notRequiredRepeatable', 'Name is set');
            assert.typeOf(modelItem.value, 'array', 'Value is an array');
            assert.deepEqual(modelItem.value, [''], 'Value is set');
            assert.isTrue(modelItem.enabled, 'Is enabled');
            assert.typeOf(modelItem.schema, 'object', 'Schema is set');
            
            const { schema } = modelItem;
            assert.isFalse(schema.required, 'Required is set');
            assert.isUndefined(schema.description, 'Description is not set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.isUndefined(schema.enum, 'enum is undefined');
            assert.typeOf(schema.examples, 'array', 'Examples are undefined');

            assert.equal(schema.inputPlaceholder, 'Example: [""]', 'inputPlaceholder is not set');
            assert.equal(schema.inputLabel, 'notRequiredRepeatable', 'inputLabel is set and not required');
            assert.equal(schema.inputType, 'date', 'inputType is set');
            assert.isTrue(schema.isArray, 'isArray is true');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.equal(schema.items, 'date', 'items is set');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.isUndefined(schema.pattern, 'pattern is undefined');
            assert.equal(schema.apiType, 'array', 'type is set');
          });
        });

        describe('Nil values', () => {
          let model;
          let element = /** @type ApiViewModel */ (null);
          beforeEach(async () => {
            element = new ApiViewModel();
            element.clearCache();
            element.amf = amf;
            model = AmfLoader.lookupOperationParameters(amf, '/people', 'get');
          });

          it('Nil value is set', () => {
            const result = element.computeViewModel(model.slice(0, 1));
            assert.equal(result[0].value, 'nil');
          });

          it('Item is read only', () => {
            const result = element.computeViewModel(model.slice(0, 1));
            assert.isTrue(result[0].schema.readOnly);
          });
        });

        describe('Default values', () => {
          let model;
          let element = /** @type ApiViewModel */ (null);
          beforeEach(async () => {
            element = new ApiViewModel();
            element.clearCache();
            element.amf = amf;
            model = AmfLoader.lookupOperationHeaders(amf, '/defaultValues', 'get');
          });

          it('Computes string default value', () => {
            const result = element.computeViewModel(model.slice(0, 1));
            assert.strictEqual(result[0].schema.defaultValue, 'TestDefault');
            assert.strictEqual(result[0].value, result[0].schema.defaultValue);
          });

          it('Computes number default value', () => {
            const result = element.computeViewModel(model.slice(1, 2));
            assert.strictEqual(result[0].schema.defaultValue, 1234);
            assert.strictEqual(result[0].value, result[0].schema.defaultValue);
          });

          it('Computes boolean default value', () => {
            const result = element.computeViewModel(model.slice(2, 3));
            assert.strictEqual(result[0].schema.defaultValue, false);
            assert.strictEqual(result[0].value, 'false');
          });

          it('Computes array default value', () => {
            const result = element.computeViewModel(model.slice(3, 4));
            assert.deepEqual(result[0].schema.defaultValue, ['ArrayTest', 'OtherTest']);
            assert.deepEqual(result[0].value, result[0].schema.defaultValue);
          });
        });
      });

      describe('Path parameters model', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        describe('computeViewModel()', () => {
          let model;
          let element = /** @type ApiViewModel */ (null);
          beforeEach(async () => {
            element = new ApiViewModel();
            element.clearCache();
            element.amf = amf;
            model = AmfLoader.lookupEndpointParameters(amf, '/test-parameters/{feature}');
          });

          it('Resolves to an array', () => {
            const result = element.computeViewModel(model);
            assert.typeOf(result, 'array');
          });

          it('Has 1 item', () => {
            const result = element.computeViewModel(model);
            assert.lengthOf(result, 1);
          });

          it('Has computed data', () => {
            const result = element.computeViewModel(model);
            const [modelItem] = result;
            assert.equal(modelItem.name, 'feature', 'Name is set');
            assert.equal(modelItem.value, 'A', 'Value is set');
            assert.isTrue(modelItem.enabled, 'Is enabled');
            assert.typeOf(modelItem.schema, 'object', 'Schema is set');
            
            const {schema} = modelItem;
            assert.isUndefined(schema.description, 'Description is not set');
            assert.isTrue(schema.required, 'Required is set');
            assert.isUndefined(schema.defaultValue, 'defaultValue is undefined');
            assert.typeOf(schema.enum, 'array', 'enum is set');
            assert.deepEqual(schema.enum, ['A', 'B', 'C'], 'enum values are set');
            assert.isUndefined(schema.examples, 'Examples is undefined');
            assert.isUndefined(schema.inputPlaceholder, 'inputPlaceholder is not set');
            assert.equal(schema.inputLabel, 'feature*', 'inputLabel is set and required');
            assert.equal(schema.inputType, 'text', 'inputType is set');
            assert.isFalse(schema.isArray, 'isArray is true');
            assert.isFalse(schema.isBool, 'is not isBool');
            assert.isFalse(schema.isObject, 'is not isObject');
            assert.isUndefined(schema.items, 'items is set');
            assert.isUndefined(schema.maxLength, 'maxLength is undefined');
            assert.isUndefined(schema.maximum, 'maximum is undefined');
            assert.isUndefined(schema.minLength, 'minLength is undefined');
            assert.isUndefined(schema.minimum, 'minimum is undefined');
            assert.isUndefined(schema.multipleOf, 'multipleOf is undefined');
            assert.isUndefined(schema.pattern, 'pattern is undefined');
            assert.equal(schema.apiType, 'string', 'type is set');
          });
        });
      });

      describe('Date formats', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        let model;
        let element = /** @type ApiViewModel */ (null);
        beforeEach(async () => {
          element = new ApiViewModel();
          element.clearCache();
          element.amf = amf;
          model = AmfLoader.lookupOperationHeaders(amf, '/dateformats', 'get');
        });

        it('Has pattern for "time" type', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[1].schema.pattern, '^[0-9]{2}:[0-9]{2}:[0-9]{2}\\.?[0-9]{0,3}$');
        });

        it('Format for "time" type is undefined', () => {
          const result = element.computeViewModel(model);
          assert.isUndefined(result[1].schema.format);
        });

        it('Placeholder for "time" type is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[1].schema.inputPlaceholder, '00:00:00.000');
        });

        it('Has pattern for "date" type', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[0].schema.pattern, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
        });

        it('Format for "date" type is undefined', () => {
          const result = element.computeViewModel(model);
          assert.isUndefined(result[0].schema.format);
        });

        it('Placeholder for "date" type is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[0].schema.inputPlaceholder, '0000-00-00');
        });

        it('Has pattern for "datetime-only" type', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[2].schema.pattern, '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.?[0-9]{0,3}$');
        });

        it('Format for "datetime-only" type is undefined', () => {
          const result = element.computeViewModel(model);
          assert.isUndefined(result[2].schema.format);
        });

        it('Placeholder for "datetime-only" type is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[2].schema.inputPlaceholder, '0000-00-00T00:00:00.000');
        });

        it('Has pattern for "datetime" type, default format', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[3].schema.pattern, '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*$');
        });

        it('Format for "datetime" type, default format is undefined', () => {
          const result = element.computeViewModel(model);
          assert.isUndefined(result[3].schema.format);
        });

        it('Placeholder for "datetime" type, default format is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[3].schema.inputPlaceholder, '0000-00-00T00:00:00Z+01:00');
        });

        it('Has pattern for "datetime" type, rfc3339 format', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[4].schema.pattern, '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*$');
        });

        it('Format for "datetime" type, rfc3339 format is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[4].schema.format, 'rfc3339');
        });

        it('Placeholder for "datetime" type, rfc3339 format is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[4].schema.inputPlaceholder, '0000-00-00T00:00:00Z+01:00');
        });

        it('Has no pattern for "datetime" type, rfc2616 format', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[5].schema.pattern, '');
        });

        it('Format for "datetime" type, rfc2616 format is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[5].schema.format, 'rfc2616');
        });

        it('Placeholder for "datetime" type, rfc2616 format is set', () => {
          const result = element.computeViewModel(model);
          assert.equal(result[5].schema.inputPlaceholder, 'Sun, 01 Jan 2000 00:00:00 GMT');
        });
      });

      describe('computeViewModel()', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        let model;
        let element = /** @type ApiViewModel */ (null);
        beforeEach(async () => {
          element = new ApiViewModel();
          element.amf = amf;
          model = AmfLoader.lookupOperationHeaders(amf, '/dateformats', 'get');
        });

        it('Returns undefined when no shape', () => {
          const result = element.computeViewModel();
          assert.isUndefined(result);
        });

        it('Makes a copy of the array', () => {
          const result = element.computeViewModel(model);
          model.push('test');
          assert.notEqual(result.length, model.length);
        });
      });

      describe('uiModelForAmfItem()', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        let element = /** @type ApiViewModel */ (null);
        beforeEach(async () => {
          element = new ApiViewModel();
          element.amf = amf;
        });

        it('Returns undefined when type is not supported', () => {
          const result = element.uiModelForAmfItem({});
          assert.isUndefined(result);
        });

        it('Returns model for http#Parameter', () => {
          const model = AmfLoader.lookupOperationHeaders(amf, '/people/{personId}', 'get')[0];
          const result = element.uiModelForAmfItem(model);
          assert.typeOf(result, 'object');
        });

        it('Returns model for shacl#PropertyShape', () => {
          const model = AmfLoader.lookupShapeProperties(amf, 3);
          const result = element.uiModelForAmfItem(model[0]);
          assert.typeOf(result, 'object');
        });
      });

      describe('Nillable union', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(/** @type boolean */ (item[1]));
        });

        let element;
        let model;
        beforeEach(async () => {
          element = new ApiViewModel();
          element.clearCache();
          element.amf = amf;
          model = AmfLoader.lookupOperationHeaders(amf, '/nillableUnion', 'get');
        });

        it('Sets "isNillable" property', () => {
          const result = element.computeViewModel(model);
          assert.isTrue(result[0].schema.isNillable);
        });

        it('"isNillable" is false when no union', () => {
          const result = element.computeViewModel(model);
          assert.isFalse(result[1].schema.isNillable);
        });

        it('"isNillable" is false when other scalar', () => {
          const result = element.computeViewModel(model);
          assert.isFalse(result[2].schema.isNillable);
        });

        it('"isNillable" is false when union without nil', () => {
          const result = element.computeViewModel(model);
          assert.isFalse(result[3].schema.isNillable);
        });
      });
    });
  });
});
