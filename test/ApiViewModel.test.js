import { assert } from '@open-wc/testing';
import { ApiViewModel } from '../index.js';

describe('ApiViewModel', () => {
  describe('_computeFormName()', () => {
    let element = /** @type ApiViewModel */ (null);
    const model = {
      'http://a.ml/vocabularies/core#name': [{
        '@value': 'test-value'
      }]
    };
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns undefined when no name', () => {
      const result = element._computeFormName({});
      assert.isUndefined(result);
    });

    it('Returns name value', () => {
      const result = element._computeFormName(model);
      assert.equal(result, 'test-value');
    });
  });

  describe('_computeDescription()', () => {
    let element = /** @type ApiViewModel */ (null);
    const model = {
      'http://a.ml/vocabularies/core#description': [{
        '@value': 'test-value'
      }]
    };

    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns undefined when no name', () => {
      const result = element._computeDescription({});
      assert.isUndefined(result);
    });

    it('Returns description value', () => {
      const result = element._computeDescription(model);
      assert.equal(result, 'test-value');
    });
  });

  describe('_computeModelType()', () => {
    let element = /** @type ApiViewModel */ (null);

    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns default value', () => {
      const result = element._computeModelType({});
      assert.equal(result, 'string');
    });

    it('Computes UnionShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#UnionShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'union');
    });

    it('Computes ArrayShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#ArrayShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'array');
    });

    it('Computes NodeShape', () => {
      const type = 'http://www.w3.org/ns/shacl#NodeShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'object');
    });

    it('Computes FileShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#FileShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'file');
    });

    it('Computes NilShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#NilShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'null');
    });

    it('Computes AnyShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#AnyShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'string');
    });

    it('Computes MatrixShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#MatrixShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'array');
    });

    it('Computes TupleShape', () => {
      const type = 'http://a.ml/vocabularies/shapes#TupleShape';
      const result = element._computeModelType({
        '@type': [type]
      });
      assert.equal(result, 'object');
    });
  });

  describe('_computeModelType() - ScalarShape', () => {
    let element = /** @type ApiViewModel */ (null);
    const shape = {
      '@type': ['http://a.ml/vocabularies/shapes#ScalarShape'],
      'http://www.w3.org/ns/shacl#datatype': [{
        '@id': ''
      }]
    };

    before(async () => {
      element = new ApiViewModel();
    });

    function setType(type) {
      shape['http://www.w3.org/ns/shacl#datatype'][0]['@id'] = type;
    }
    [
      ['http://a.ml/vocabularies/shapes#number', 'number'],
      ['http://www.w3.org/2001/XMLSchema#integer', 'integer'],
      ['http://www.w3.org/2001/XMLSchema#string', 'string'],
      ['http://www.w3.org/2001/XMLSchema#boolean', 'boolean'],
      ['http://www.w3.org/2001/XMLSchema#date', 'date'],
      ['http://www.w3.org/2001/XMLSchema#time', 'time'],
      ['http://www.w3.org/2001/XMLSchema#dateTime', 'datetime'],
      ['http://a.ml/vocabularies/shapes#dateTimeOnly', 'datetime-only'],
      ['http://www.w3.org/2001/XMLSchema#float', 'float'],
      ['http://www.w3.org/2001/XMLSchema#long', 'long'],
      ['http://www.w3.org/2001/XMLSchema#double', 'double'],
      ['http://www.w3.org/2001/XMLSchema#base64Binary', 'string'],
      ['http://a.ml/vocabularies/shapes#password', 'password'],
      ['UNKNOWN', 'string']
    ].forEach((item) => {
      it(`Computes ${  item[0]}`, () => {
        setType(item[0]);
        const result = element._computeModelType(shape);
        assert.equal(result, item[1]);
      });
    });
  });

  describe('_computeInputLabel()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Finds name in the model', () => {
      const result = element._computeInputLabel({
        'http://a.ml/vocabularies/core#name': [{
          '@value': 'test-name'
        }, false]
      });
      assert.equal(result, 'test-name');
    });

    it('Adds asterix when required', () => {
      const result = element._computeInputLabel({
        'http://a.ml/vocabularies/core#name': [{
          '@value': 'test-name'
        }]
      }, true);
      assert.equal(result, 'test-name*');
    });

    it('Uses property name when display name not found', () => {
      const result = element._computeInputLabel({
        'blank': 'test-name'
      }, false, 'other-name');
      assert.equal(result, 'other-name');
    });

    it('Uses default value', () => {
      const result = element._computeInputLabel({}, false, undefined);
      assert.equal(result, 'Input value');
    });
  });

  describe('_computeShaclProperty()', () => {
    const key = 'http://www.w3.org/ns/shacl#';

    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('returns undefined for missing model', () => {
      const result = element._computeShaclProperty(undefined, undefined);
      assert.isUndefined(result);
    });

    it('returns undefined for missing property', () => {
      const result = element._computeShaclProperty({}, 'test');
      assert.isUndefined(result);
    });

    it('returns value of the property', () => {
      const shape = {};
      shape[`${key  }test-key`] = [{ '@value': 'test-value' }];
      const result = element._computeShaclProperty(shape, 'test-key');
      assert.equal(result, 'test-value');
    });
  });

  describe('_computeVocabularyShapeProperty()', () => {
    const key = 'http://a.ml/vocabularies/shapes#';

    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('returns undefined for missing model', () => {
      const result = element._computeVocabularyShapeProperty(undefined, undefined);
      assert.isUndefined(result);
    });

    it('returns undefined for missing property', () => {
      const result = element._computeVocabularyShapeProperty({}, 'test');
      assert.isUndefined(result);
    });

    it('returns value of the property', () => {
      const shape = {};
      shape[`${key  }test-key`] = [{ '@value': 'test-value' }];
      const result = element._computeVocabularyShapeProperty(shape, 'test-key');
      assert.equal(result, 'test-value');
    });
  });

  describe('_computeModelEnum()', () => {
    let element = /** @type ApiViewModel */ (null);
    let model;
    before(async () => {
      element = new ApiViewModel();
      const longId = 'file://models/demo-api/demo-api.raml#/web-api/end-points/' +
      '%2Fpeople%2F%7BpersonId%7D/get/request/parameter/x-enum/scalar/schema/list';
      model = {
        'http://www.w3.org/ns/shacl#in': [{
          '@id': longId,
          '@type': 'http://www.w3.org/2000/01/rdf-schema#Seq',
          'http://www.w3.org/2000/01/rdf-schema#_1': [{
            '@id': 'amf://id#635',
            '@type': [
              'http://a.ml/vocabularies/data#Scalar'
            ],
            'http://a.ml/vocabularies/data#value': [
              {
                '@value': 'a',
                '@type': 'http://www.w3.org/2001/XMLSchema#string'
              }
            ]
          }],
          'http://www.w3.org/2000/01/rdf-schema#_2': [{
            '@id': 'amf://id#636',
            '@type': [
              'http://a.ml/vocabularies/data#Scalar'
            ],
            'http://a.ml/vocabularies/data#value': [
              {
                '@value': 'b',
                '@type': 'http://www.w3.org/2001/XMLSchema#string'
              }
            ]
          }],
          'http://www.w3.org/2000/01/rdf-schema#_3': [{
            '@id': 'amf://id#637',
            '@type': [
              'http://a.ml/vocabularies/data#Scalar'
            ],
            'http://a.ml/vocabularies/data#value': [
              {
                '@value': 'c',
                '@type': 'http://www.w3.org/2001/XMLSchema#string'
              }
            ]
          }]
        }]
      };
    });

    it('Returns array', () => {
      const result = element._computeModelEnum(model);
      assert.typeOf(result, 'array');
    });

    it('Array has all items from model', () => {
      const result = element._computeModelEnum(model);
      assert.lengthOf(result, 3);
    });

    it('Items are in order', () => {
      const result = element._computeModelEnum(model);
      assert.deepEqual(result, ['a', 'b', 'c']);
    });
  });

  describe('_computeModelPattern()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('always returns pattern if provided', () => {
      const result = element._computeModelPattern('time', 'test-pattern');
      assert.equal(result, 'test-pattern');
    });

    it('returns pattern for time type', () => {
      const result = element._computeModelPattern('time', undefined);
      assert.equal(result, '^[0-9]{2}:[0-9]{2}:[0-9]{2}\\.?[0-9]{0,3}$');
    });

    it('time pattern matches "partial-time" notation of RFC3339', () => {
      const result = element._computeModelPattern('time', undefined);
      const reg = new RegExp(result);
      assert.isTrue(reg.test('00:00:00'), 'Matches HH:mm:ss');
      assert.isTrue(reg.test('00:00:00.0'), 'Matches HH:mm:ss.f');
      assert.isTrue(reg.test('00:00:00.00'), 'Matches HH:mm:ss.ff');
      assert.isTrue(reg.test('00:00:00.000'), 'Matches HH:mm:ss.fff');
      assert.isFalse(reg.test('00:00:00.00Z'), 'Does not matches time zone');
      assert.isFalse(reg.test('00:00'), 'Full time is required');
    });

    it('Returns pattern for date type', () => {
      const result = element._computeModelPattern('date');
      assert.equal(result, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
    });

    it('date pattern matches "full-date" notation of RFC3339', () => {
      const result = element._computeModelPattern('date');
      const reg = new RegExp(result);
      assert.isTrue(reg.test('0000-00-00'), 'Matches YYYY-MM-DD');
      assert.isFalse(reg.test('00:00:00.00T00:00:00'), 'Does not matches time');
      assert.isFalse(reg.test('0000-00'), 'Full date is required');
    });

    it('Returns pattern for datetime-only type', () => {
      const result = element._computeModelPattern('datetime-only');
      assert.equal(result, '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.?[0-9]{0,3}$');
    });

    it('datetime-only pattern matches "full-date" and "partial-time" notation of RFC3339', () => {
      const result = element._computeModelPattern('datetime-only');
      const reg = new RegExp(result);
      assert.isTrue(reg.test('0000-00-00T00:00:00'), 'Matches YYYY-MM-DDTHH:mm:ss');
      assert.isTrue(reg.test('0000-00-00T00:00:00.0'), 'Matches YYYY-MM-DDTHH:mm:ss.f');
      assert.isTrue(reg.test('0000-00-00T00:00:00.00'), 'Matches YYYY-MM-DDTHH:mm:ss.ff');
      assert.isTrue(reg.test('0000-00-00T00:00:00.000'), 'Matches YYYY-MM-DDTHH:mm:ss.fff');
      assert.isFalse(reg.test('0000-00-00T00:00:00.00Z'), 'Does not matches time zone');
      assert.isFalse(reg.test('0000-00-00T00'), 'Full date + time is required');
    });

    it('Returns pattern for datetime type, default format', () => {
      const result = element._computeModelPattern('datetime');
      assert.equal(result, '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*$');
    });

    it('Pattern for datetime type and rfc2616 format is empty', () => {
      const result = element._computeModelPattern('datetime', undefined, 'rfc2616');
      assert.equal(result, '');
    });
  });

  describe('_computeTypePlaceholder()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns placeholder value for time', () => {
      const result = element._computeTypePlaceholder('time');
      assert.equal(result, '00:00:00.000');
    });

    it('Returns placeholder value for date', () => {
      const result = element._computeTypePlaceholder('date');
      assert.equal(result, '0000-00-00');
    });

    it('Returns placeholder value for datetime-only', () => {
      const result = element._computeTypePlaceholder('datetime-only');
      assert.equal(result, '0000-00-00T00:00:00.000');
    });

    it('Returns placeholder value for datetime, default format', () => {
      const result = element._computeTypePlaceholder('datetime');
      assert.equal(result, '0000-00-00T00:00:00Z+01:00');
    });

    it('Returns placeholder value for datetime, rfc2616 format', () => {
      const result = element._computeTypePlaceholder('datetime', 'rfc2616');
      assert.equal(result, 'Sun, 01 Jan 2000 00:00:00 GMT');
    });
  });

  describe('buildProperty()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns an object', () => {
      const result = element.buildProperty();
      assert.typeOf(result, 'object');
    });

    it('object has schema', () => {
      const result = element.buildProperty();
      assert.typeOf(result.schema, 'object');
    });

    it('Default schema.apiType is string', () => {
      const result = element.buildProperty();
      assert.equal(result.schema.apiType, 'string');
    });

    it('Default schema.isArray is false', () => {
      const result = element.buildProperty();
      assert.isFalse(result.schema.isArray);
    });

    it('Default schema.isBool is false', () => {
      const result = element.buildProperty();
      assert.isFalse(result.schema.isBool);
    });

    it('Default schema.isFile is false', () => {
      const result = element.buildProperty();
      assert.isFalse(result.schema.isFile);
    });

    it('Default schema.inputType is text', () => {
      const result = element.buildProperty();
      assert.equal(result.schema.inputType, 'text');
    });
  });

  describe('_computeExtendedDocumentation()', () => {
    let element = /** @type ApiViewModel */ (null);
    beforeEach(async () => {
      element = new ApiViewModel();
    });

    it('returns empty string when no properties', () => {
      const result = element._computeExtendedDocumentation({ name: '', value: '', schema: {} });
      assert.equal(result, '');
    });

    it('returns description part', () => {
      const result = element._computeExtendedDocumentation({
        schema: {
          description: 'test'
        },
        name: '', value: '',
      });
      assert.equal(result, 'test');
    });

    it('returns pattern part', () => {
      const result = element._computeExtendedDocumentation({
        schema: {
          pattern: 'test'
        },
        name: '', value: '',
      });
      assert.equal(result, '- Pattern: `test`');
    });

    it('adds new lines after description', () => {
      const result = element._computeExtendedDocumentation({
        schema: {
          description: 'test',
          pattern: 'test'
        },
        name: '', value: '',
      });
      assert.equal(result, 'test\n\n\n- Pattern: `test`');
    });

    it('adds examples', () => {
      const result = element._computeExtendedDocumentation({
        schema: {
          examples: [{
            value: 'test',
            hasRaw: false,
            hasTitle: false,
            hasUnion: false,
            isScalar: false,
          }]
        },
        name: '', value: '',
      });
      assert.equal(result, '- Example: `test`');
    });

    it('adds title for example', () => {
      const result = element._computeExtendedDocumentation({
        schema: {
          examples: [{
            value: 'test',
            title: 'title',
            hasRaw: false,
            hasTitle: true,
            hasUnion: false,
            isScalar: false,
          }]
        },
        name: '', value: '',
      });
      assert.equal(result, '- Example title: `test`');
    });

    it('ignores examples without a value', () => {
      const result = element._computeExtendedDocumentation({
        schema: {
          examples: [{
            hasTitle: true,
            title: 'test',
            hasRaw: false,
            hasUnion: false,
            isScalar: false,
          }]
        },
        name: '', value: '',
      });
      assert.equal(result, '');
    });
  });

  describe('_computeModelItems()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns undefined if object is not #ArrayShape', () => {
      const result = element._computeModelItems({});
      assert.isUndefined(result);
    });

    it('Returns undefined when no items declaration', () => {
      const obj = {};
      obj['@type'] = [element.ns.aml.vocabularies.shapes.ArrayShape];
      const result = element._computeModelItems(obj);
      assert.isUndefined(result);
    });

    it('Returns "string"', () => {
      const obj = {};
      obj['@type'] = [element.ns.raml.vocabularies.shapes.ArrayShape];
      obj[element.ns.aml.vocabularies.shapes.items] = [{}];
      const result = element._computeModelItems(obj);
      assert.equal(result, 'string');
    });
  });

  describe('_computeModelInputType()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns "text" when no items and array', () => {
      const result = element._computeModelInputType('array', undefined);
      assert.equal(result, 'text');
    });

    it('Returns "items.apiType" when array', () => {
      const result = element._computeModelInputType('array', {
        apiType: 'number'
      });
      assert.equal(result, 'number');
    });

    it('returns "items.schema.apiType" when array', () => {
      const result = element._computeModelInputType('array', {
        schema: {
          apiType: 'boolean'
        }
      });
      assert.equal(result, 'boolean');
    });
  });

  describe('_computeIsNillable()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns false when no argument', () => {
      const result = element._computeIsNillable();
      assert.isFalse(result);
    });

    it('Returns false when no anyOf key', () => {
      const result = element._computeIsNillable({});
      assert.isFalse(result);
    });
  });

  describe('_exampleAsValue()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns undefined when no argument', () => {
      const result = element._exampleAsValue(undefined);
      assert.isUndefined(result);
    });

    it('Returns the same value when argument is not a string', () => {
      // @ts-ignore
      const result = element._exampleAsValue(123, {});
      // @ts-ignore
      assert.equal(result, 123);
    });

    it('Trims string argument', () => {
      const result = element._exampleAsValue(' abc ', {});
      assert.equal(result, 'abc');
    });

    it('Removes parameter name from example', () => {
      const param = 'test: value';
      const result = element._exampleAsValue(param, {
        valueDelimiter: ':',
        name: 'test'
      });
      assert.equal(result, 'value');
    });

    it('Decodes encoded values', () => {
      const param = 'test%20and+value';
      const result = element._exampleAsValue(param, {
        decodeValues: true
      });
      assert.equal(result, 'test and value');
    });
  });

  describe('_parseArrayExample()', () => {
    let element = /** @type ApiViewModel */ (null);
    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns undefined for empty array string', () => {
      const result = element._parseArrayExample('[]', {});
      assert.isUndefined(result);
    });

    it('Returns array of examples', () => {
      const result = element._parseArrayExample('["test-example"]', {});
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 1);
      assert.equal(result[0], 'test-example');
    });

    it('Returns string when argument is not an array', () => {
      const result = element._parseArrayExample('test-example', {});
      assert.typeOf(result, 'string');
      assert.equal(result, 'test-example');
    });
  });

  describe('_computeNoAutoEncode()', () => {
    let element = /** @type ApiViewModel */ (null);
    const model = {
      'amf://id': {
        'http://a.ml/vocabularies/core#extensionName': {
          '@value': 'no-auto-encoding'
        }
      },
      'http://a.ml/vocabularies/document#customDomainProperties': [{
        '@id': 'amf://id'
      }]
    };

    before(async () => {
      element = new ApiViewModel();
    });

    it('Returns false if no value', () => {
      assert.isFalse(element._hasNoAutoEncodeProperty());
    });

    it('Returns true if no-auto-encoding is present', () => {
      assert.isTrue(element._hasNoAutoEncodeProperty(model));
    });
  });
});
