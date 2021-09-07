/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/**
 * @license
 * Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { ExampleGenerator } from '@api-components/api-example-generator';

/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.AmfFormItem} AmfFormItem */
/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.AmfFormItemSchema} AmfFormItemSchema */
/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.Example} Example */
/** @typedef {import('./types').ConstructorOptions} ConstructorOptions */
/** @typedef {import('./types').ProcessOptions} ProcessOptions */

const GLOBAL_PATH_PARAMS = [];
const GLOBAL_QUERY_PARAMS = [];
const GLOBAL_OTHER_PARAMS = [];

/**
 * Generates a common key from data model item.
 *
 * @param {AmfFormItem} data AMF type object model.
 * @return {String} Generated key to search for the item.
 */
function getKey(data) {
  let key = `${data.name}-${data.schema.apiType}`;
  if (data.schema.enum) {
    key += '-enum';
  }
  if (data.schema.required) {
    key += '-required';
  }
  return key;
}

/**
 * Searches for a model value in cache store.
 *
 * @param {string} binding
 * @param {AmfFormItem} data AMF model item.
 * @return {AmfFormItem|undefined} Model item or undefined if not found.
 */
function getGlobalValue(binding, data) {
  let store;
  switch (binding) {
    case 'query': store = GLOBAL_QUERY_PARAMS; break;
    case 'path': store = GLOBAL_PATH_PARAMS; break;
    default: store = GLOBAL_OTHER_PARAMS; break;
  }
  if (!store.length) {
    return undefined;
  }
  const key = getKey(data);
  const item = store.find((storeItem) => storeItem.key === key);
  if (item) {
    return item.value;
  }
  return undefined;
}

/**
 * Appends a value item to the global params.
 *
 * @param {string} binding
 * @param {AmfFormItem} data Model item to be added to the list.
 */
function appendGlobalValue(binding, data) {
  const item = getGlobalValue(binding, data);
  if (item) {
    return;
  }
  const key = getKey(data);
  const model = {
    key,
    value: data
  };
  switch (binding) {
    case 'query': GLOBAL_QUERY_PARAMS.push(model); break;
    case 'path': GLOBAL_PATH_PARAMS.push(model); break;
    default: GLOBAL_OTHER_PARAMS.push(model); break;
  }
}

const NUMBER_INPUT_TYPES = ['number', 'integer', 'float', 'double'];

/**
 * An element to transform AMF LD model into a form view model.
 *
 * Note, this element does not include polyfills for `Promise` and `Array.from`.
 *
 * The model should be used to build a form view for request parameters
 * like header, query parameters, uri parameters or the body.
 *
 * ## Example
 *
 * ```html
 * <api-view-model-transformer on-view-model-changed="_updateView"></api-view-model-transformer>
 * <script>
 * const amfModel = getAmfFromRamlOrOas();
 * const processor = document.querySelector('api-view-model-transformer');
 * processor.amf = amfModel;
 * processor.shape = extractHeadersForMethod(amfModel);
 * processor.addEventListener('view-model-changed', (e) => {
 *  console.log(e.detail.value);
 * });
 * </script>
 * ```
 *
 * This example uses `getAmfFromRamlOrOas()` function where you implement
 * the logic of getting AMF json/ld data. It can be stored in file or parsed
 * using AMF parsers. The `extractHeadersForMethod()` represents a logic to
 * extract properties that you want to transform. It can be headers, query
 * parameters or body type.
 */
export class ApiViewModel extends AmfHelperMixin(Object) {
  /**
   * @param {ConstructorOptions=} [opts={}]
   */
  constructor(opts={}) {
    super();
    /**
     * An array of properties for which view model is to be generated.
     * It accepts model for headers, query parameters, uri parameters and
     * body.
     * If `manualModel` is not set, assigning a value to this property will
     * trigger model computation. Otherwise call `computeViewModel()`
     * function manually to generate the model.
     */
    this.amf = opts.amf;
    /**
     * Does not compute documentation for the processed property
     */
    this.noDocs = opts.noDocs;
  }

  /**
   * Clears cache for computed models.
   * All computed models are kept in in-memory cache to another call for computation
   * of the same model will result with reference to already computed value.
   * This function clears all cached objects.
   *
   * Note, the memory won't be freed for objects that are in use.
   */
  clearCache() {
    GLOBAL_PATH_PARAMS.splice(0, GLOBAL_PATH_PARAMS.length);
    GLOBAL_QUERY_PARAMS.splice(0, GLOBAL_QUERY_PARAMS.length);
    GLOBAL_OTHER_PARAMS.splice(0, GLOBAL_OTHER_PARAMS.length);
  }

  /**
   * Computes view model from AMF data model. This should not be called if
   * `manualModel` is not set. Use `shape` property instead.
   *
   * @param {any} shape AMF type model. If not set it uses `shape` property of the element.
   * @return {AmfFormItem[]|undefined} A promise resolved to generated model.
   */
  computeViewModel(shape) {
    this.viewModel = undefined;
    if (!shape) {
      return undefined;
    }
    if (Array.isArray(shape)) {
      // creates a shallow copy so it's not altered later.
      shape = Array.from(shape);
    }
    const result = this._computeViewModel(shape);
    this.viewModel = result;
    return result;
  }

  /**
   * Computes model for each item recursively. It allows browser to return
   * the event loop and prohibit ANR to show.
   *
   * @param {any} items List of remanding AMF model items.
   * This should be copy of the model since this function removes items from
   * the list.
   * @return {AmfFormItem[]} The view model.
   */
  _computeViewModel(items) {
    let result = [];
    if (!items) {
      return result;
    }
    const isArray = Array.isArray(items);
    if (isArray && !items.length) {
      return result;
    }

    if (isArray) {
      for (let i = 0, len = items.length; i < len; i++) {
        const item = items[i];
        const model = this.uiModelForAmfItem(item);
        if (model) {
          result.push(model);
        }
      }
    } else if (this._hasType(items, this.ns.raml.vocabularies.data.Object)) {
      const data = this.modelForRawObject(items);
      if (data) {
        result = data;
      }
    } else if (this._hasType(items, this.ns.w3.shacl.NodeShape)) {
      result = this._processNodeShape(items);
    } else if (this._hasType(items, this.ns.aml.vocabularies.shapes.ScalarShape)) {
      const data = this._uiModelForPropertyShape(items);
      if (data) {
        result[result.length] = data;
      }
    } else if (this._hasType(items, this.ns.aml.vocabularies.shapes.UnionShape)) {
      result = this. _modelForUnion(items);
    }
    return result;
  }

  /**
   * Creates a UI model item from AMF json/ld model.
   * @param {any} amfItem AMF model with schema for
   * `http://raml.org/vocabularies/http#Parameter`
   * @return {AmfFormItem|undefined} UI data model.
   */
  uiModelForAmfItem(amfItem) {
    if (this._hasType(amfItem, this.ns.aml.vocabularies.apiContract.Parameter)) {
      return this._uiModelForParameter(amfItem);
    }
    if (this._hasType(amfItem, this.ns.w3.shacl.PropertyShape)) {
      return this._uiModelForPropertyShape(amfItem);
    }
    return undefined;
  }

  /**
   * Creates a model for a shacl's PropertyShape. It can be found, for example,
   * in `queryString` of security scheme settings.
   *
   * @param {any} shape The shape to process
   * @return {AmfFormItem[]} Generated view model for an item.
   */
  _processNodeShape(shape) {
    this._resolve(shape);
    const key = this._getAmfKey(this.ns.w3.shacl.property);
    const items = this._ensureArray(shape[key]);
    const result = [];
    if (!items) {
      return result;
    }
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const model = this.uiModelForAmfItem(item);
      if (model) {
        result[result.length] = model;
      }
    }
    return result;
  }

  /**
   * Creates a UI model item from AMF json/ld model for a parameter.
   * @param {any} amfItem AMF model with schema for
   * `http://raml.org/vocabularies/http#Parameter`
   * @return {AmfFormItem} UI data model.
   */
  _uiModelForParameter(amfItem) {
    amfItem = this._resolve(amfItem);
    const binding = /** @type string */ (this._getValue(amfItem, this.ns.aml.vocabularies.apiContract.binding))
    const name = this._computeFormName(amfItem);
    const required = /** @type boolean */ (this._getValue(amfItem, this.ns.aml.vocabularies.apiContract.required))
    const schemaItem = /** @type AmfFormItemSchema */ ({
      required,
    });
    const result = /** @type AmfFormItem */ ({
      name,
      value: undefined,
      schema: schemaItem,
      enabled: true,
    });

    schemaItem.isFile = false; // I am not sure why is this not computed here
    schemaItem.isUnion = false; // or this.
    schemaItem.readOnly = false;

    const sKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    let schema = amfItem[sKey];
    if (schema) {
      if (Array.isArray(schema)) {
        [schema] = schema;
      }
      const def = this._resolve(schema);
      schemaItem.apiType = this._computeModelType(def);
      // Now check if there's cached model for this property
      // So far now it took only required steps to compute cache key of the
      // property.
      const cachedModel = getGlobalValue(binding, result);
      if (cachedModel) {
        // Safe to return it.
        return cachedModel;
      }
      const isEnum = this._hasProperty(def, this.ns.w3.shacl.in);
      schemaItem.inputLabel = this._computeInputLabel(def, schemaItem.required, result.name);
      schemaItem.pattern = this._computeShaclProperty(def, 'pattern');
      schemaItem.minLength = this._computeShaclProperty(def, 'minLength');
      schemaItem.maxLength = this._computeShaclProperty(def, 'maxLength');
      schemaItem.defaultValue = this._computeDefaultValue(def);
      schemaItem.multipleOf = this._computeVocabularyShapeProperty(def, 'multipleOf');
      schemaItem.minimum = this._computeShaclProperty(def, 'minInclusive');
      schemaItem.maximum = this._computeShaclProperty(def, 'maxInclusive');
      schemaItem.enum = isEnum ? this._computeModelEnum(def) : undefined;
      schemaItem.isArray = schemaItem.apiType === 'array';
      schemaItem.isBool = schemaItem.apiType === 'boolean';
      schemaItem.isObject = schemaItem.apiType === 'object';
      schemaItem.examples = this._computeModelExamples(def);
      schemaItem.items = schemaItem.isArray ? this._computeModelItems(def) : undefined;
      schemaItem.inputType = this._computeModelInputType(schemaItem.apiType, schemaItem.items);
      schemaItem.format = this._computeVocabularyShapeProperty(schema, 'format');
      schemaItem.pattern = this._computeModelPattern(schemaItem.apiType, schemaItem.pattern, schemaItem.format);
      schemaItem.isNillable = schemaItem.apiType === 'union' ? this._computeIsNillable(def) : false;
      schemaItem.noAutoEncode = this._hasNoAutoEncodeProperty(schema);
      if (this._computeBooleanAnnotationField(schema, 'credentialsId')) {
        schemaItem.isCredentialsIdField = true;
      }
      if (this._computeBooleanAnnotationField(schema, 'credentialsSecret')) {
        schemaItem.isCredentialsSecretField = true;
      }
    }
    if (!this.noDocs) {
      schemaItem.description = this._computeDescription(amfItem);
    }
    const valueDelimiter = this._computeValueDelimiter(binding);
    const decodeValues = this._computeDecodeValues(binding);
    const processOptions = {
      name: result.name,
      required: schemaItem.required,
      valueDelimiter,
      decodeValues,
    };
    this._processAfterItemCreated(result, binding, processOptions);
    // store cache
    appendGlobalValue(binding, result);
    return result;
  }

  /**
   * 
   * @param {Object} model AMF model
   * @param {string} annotationName Name of the annotation to check for
   * @return {boolean|undefined} Boolean annotation value if present, or `undefined` if not present
   */
  _computeBooleanAnnotationField(model, annotationName) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.customDomainProperties);
    if (typeof model[key] === 'undefined') {
      return undefined;
    }
    const values = this._ensureArray(model[key]);
    for (let i = 0, len = values.length; i < len; i++) {
      let id = /** @type string */ (this._getValue(values[i], '@id'));
      if (!id.startsWith('amf://id')) {
        id = `amf://id${id}`;
      }
      const node = model[id];
      const extensionNameKey = this._getAmfKey(this.ns.aml.vocabularies.core.extensionName);
      if (this._getValue(node, extensionNameKey) === annotationName) {
        return this._getValue(node, this.ns.aml.vocabularies.data.value) === true;
      }
    }
    return undefined
  }

  /**
   * Creates a UI model item from AMF json/ld model for a parameter.
   * @param {Object} amfItem AMF model with schema for
   * `http://raml.org/vocabularies/http#Parameter`
   * @return {AmfFormItem} UI data model.
   */
  _uiModelForPropertyShape(amfItem) {
    amfItem = this._resolve(amfItem);
    const binding = 'type';
    const name = this._computeShaclProperty(amfItem, 'name');
    const schemaItem = /** @type AmfFormItemSchema */ ({
      required: false,
    });
    const result = /** @type AmfFormItem */ ({
      name,
      value: undefined,
      schema: schemaItem,
      enabled: true,
    });

    let def;
    if (this._hasType(amfItem, this.ns.aml.vocabularies.shapes.ScalarShape)) {
      def = amfItem;
    } else {
      const rangeKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.range);
      def = amfItem[rangeKey];
      if (!def) {
        return result;
      }
      if (Array.isArray(def)) {
        [def] = def;
      }
      def = this._resolve(def);
    }
    schemaItem.required = this._computeRequiredPropertyShape(amfItem);
    result.enabled = true;
    schemaItem.apiType = this._computeModelType(def);
    // Now check if there's cached model for this property
    // So far now it took only required steps to compute cache key of the
    // property.
    const cachedModel = getGlobalValue(binding, result);
    if (cachedModel) {
      // Safe to return it.
      return cachedModel;
    }
    schemaItem.inputLabel = this._computeInputLabel(def, schemaItem.required, result.name);
    schemaItem.pattern = this._computeShaclProperty(def, 'pattern');
    schemaItem.minLength = this._computeShaclProperty(def, 'minLength');
    schemaItem.maxLength = this._computeShaclProperty(def, 'maxLength');
    schemaItem.defaultValue = this._computeDefaultValue(def);
    schemaItem.multipleOf = this._computeVocabularyShapeProperty(def, 'multipleOf');
    schemaItem.minimum = this._computeShaclProperty(def, 'minInclusive');
    schemaItem.maximum = this._computeShaclProperty(def, 'maxInclusive');
    schemaItem.enum = this._computeModelEnum(def);
    schemaItem.isArray = schemaItem.apiType === 'array';
    schemaItem.isObject = schemaItem.apiType === 'object';
    schemaItem.isBool = schemaItem.apiType === 'boolean';
    schemaItem.examples = this._computeModelExamples(def);
    schemaItem.inputType = this._computeModelInputType(schemaItem.apiType, schemaItem.items);
    schemaItem.format = this._computeVocabularyShapeProperty(def, 'format');
    schemaItem.pattern = this._computeModelPattern(
      schemaItem.apiType, schemaItem.pattern, schemaItem.format);
    schemaItem.isNillable = schemaItem.apiType === 'union' ? this._computeIsNillable(result) : false;

    if (!this.noDocs) {
      schemaItem.description = this._computeDescription(def);
    }
    if (schemaItem.apiType === 'file') {
      schemaItem.isFile = true;
      schemaItem.fileTypes = /** @type string[] */ (this._getValueArray(def, this.ns.aml.vocabularies.shapes.fileType));
    } else {
      schemaItem.isFile = false;
    }
    if (schemaItem.isObject) {
      const props = [];
      const pKey = this._getAmfKey(this.ns.w3.shacl.property);
      const items = this._ensureArray(def[pKey]);
      if (items) {
        items.forEach((item) => {
          if (Array.isArray(item)) {
            [item] = item;
          }
          props.push(this.uiModelForAmfItem(item));
        });
      }
      result.properties = props;
    }
    this._processAfterItemCreated(result, binding, {});
    // Store cache
    appendGlobalValue(binding, result);
    return result;
  }

  /**
   * Creates a view model for an object definition. Object definition can be
   * part of trait or annotation properties description.
   *
   * @param {Object} model Model to extract data from.
   * @param {ProcessOptions=} processOptions
   * @return {AmfFormItem[]} View model for items.
   */
  modelForRawObject(model, processOptions={}) {
    const result = [];
    const keys = Object.keys(model);
    const dataKey = this._getAmfKey(this.ns.raml.vocabularies.data.toString());
    keys.forEach((key) => {
      if (key.indexOf(dataKey) === -1) {
        return;
      }
      let item = model[key];
      if (Array.isArray(item)) {
        [item] = item;
      }
      item = this._uiModelForRawObject(key, item);
      if (item) {
        item = this._processAfterItemCreated(item, 'type', processOptions);
        result.push(item);
      }
    });
    return result;
  }

  /**
   * Creates a view model for union definition.
   *
   * @param {any} model Model to extract data from.
   * @return {AmfFormItem[]} View model for items.
   */
  _modelForUnion(model) {
    let result;
    const resolvedModel = this._resolve(model);
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
    const values = this._ensureArray(resolvedModel[key]);
    if (values) {
      result = [];
      values.forEach(v => {
        const pKey = this._getAmfKey(this.ns.w3.shacl.property);
        const items = this._ensureArray(v[pKey]);
        if (items) {
          items.forEach((item) => {
            if (Array.isArray(item)) {
              [item] = item;
            }
            result.push(this.uiModelForAmfItem(item));
          });
        }
      })
    }

    return result;
  }

  /**
   * Creates a view model from "raw" item (model before resolving).
   *
   * @param {string} key Key of the item in the model.
   * @param {string} model Item model
   * @return {AmfFormItem} View model
   */
  _uiModelForRawObject(key, model) {
    let index = key.indexOf('#');
    if (index === -1) {
      index = key.indexOf(':');
    }
    let name;
    if (index === -1) {
      name = key;
    } else {
      name = key.substr(index + 1);
    }

    // const binding = 'type';
    const schemaItem = /** @type AmfFormItemSchema */ ({
      required: false,
    });
    const result = /** @type AmfFormItem */ ({
      name,
      value: undefined,
      schema: schemaItem,
      enabled: true,
    });

    const typeKey = this._getAmfKey(this.ns.raml.vocabularies.data.type);
    let type = /** @type String */ (this._computeRawModelValue(model[typeKey]));
    if (!type) {
      type = 'string';
    }
    const bracesIndex = type.indexOf('[]');
    let items;
    if (bracesIndex !== -1) {
      items = type.substr(0, bracesIndex);
      type = 'array';
    }

    if (!this.noDocs) {
      const descKey = this._getAmfKey(this.ns.raml.vocabularies.data.description);
      schemaItem.description = /** @type String */ (this._computeRawModelValue(model[descKey]));
    }

    const requiredValue = model[this._getAmfKey(this.ns.raml.vocabularies.data.required)];
    schemaItem.required = /** @type boolean */ (this._computeRawModelValue(requiredValue));
    result.enabled = true;
    schemaItem.apiType = type || 'string';
    const displayNameValue = model[this._getAmfKey(this.ns.raml.vocabularies.data.displayName)];
    const displayName = /** @type string */ (this._computeRawModelValue(displayNameValue));
    schemaItem.inputLabel = this._completeInputLabel(displayName, name, schemaItem.required);
    const mlKey = this._getAmfKey(this.ns.raml.vocabularies.data.minLength);
    schemaItem.minLength = /** @type number */ (this._computeRawModelValue(model[mlKey]));
    const mxKey = this._getAmfKey(this.ns.raml.vocabularies.data.maxLength);
    schemaItem.maxLength = /** @type number */ (this._computeRawModelValue(model[mxKey]));
    const dfKey = this._getAmfKey(this.ns.raml.vocabularies.data.default);
    schemaItem.defaultValue = this._computeRawModelValue(model[dfKey]);
    const mpKey = this._getAmfKey(this.ns.raml.vocabularies.data.multipleOf);
    schemaItem.multipleOf = /** @type number */ (this._computeRawModelValue(model[mpKey]));
    schemaItem.minimum = /** @type number */ (this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.minimum)]));
    schemaItem.maximum = /** @type number */ (this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.maximum)]));
    schemaItem.enum = /** @type any[] */ (this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.enum)]));
    let pattern = this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.pattern)]);
    if (Array.isArray(pattern)) {
      pattern = `[${pattern[0]}]`;
    }
    schemaItem.pattern = /** @type string */ (pattern);
    schemaItem.isArray = schemaItem.apiType === 'array';
    schemaItem.isBool = schemaItem.apiType === 'boolean';
    // schemaItem.examples = this._computeModelExamples(def);
    if (schemaItem.isArray) {
      schemaItem.items = items || /** @type string[] */ (this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.items)]));
    }
    schemaItem.inputType = this._computeModelInputType(schemaItem.apiType, schemaItem.items);
    schemaItem.format = /** @type string */ (this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.format)]));
    schemaItem.pattern = this._computeModelPattern(schemaItem.apiType, schemaItem.pattern, schemaItem.format);
    const example = /** @type any */ (this._computeRawModelValue(model[this._getAmfKey(this.ns.raml.vocabularies.data.example)]));
    if (example) {
      schemaItem.examples = [example];
    }
    const examples = this._computeRawExamples(model[this._getAmfKey(this.ns.raml.vocabularies.data.examples)]);
    if (examples) {
      const existing = schemaItem.examples || [];
      schemaItem.examples = existing.concat(examples);
    }
    return result;
  }

  /**
   * Sets up additional properties like `value` or placeholder from
   * values read from the AMF model.
   *
   * @param {AmfFormItem} item Computed UI model.
   * @param {string} binding
   * @param {ProcessOptions} processOptions Model creation options
   * @return {AmfFormItem}
   */
  _processAfterItemCreated(item, binding, processOptions) {
    if (item.schema.apiType === 'null') {
      switch (binding) {
        case 'header':
        case 'query':
        case 'path':
          item.value = 'nil';
          break;
        default:
          item.value = 'null';
      }
      item.schema.readOnly = true;
    }
    if (item.schema.examples && item.schema.examples.length && item.schema.examples[0].value) {
      item.schema.inputPlaceholder = `Example: ${this._exampleAsValue(item.schema.examples[0].value, processOptions)}`;
    }
    if (!item.schema.inputPlaceholder) {
      item.schema.inputPlaceholder = this._computeTypePlaceholder(item.schema.apiType, item.schema.format);
    }
    if (item.schema.required && typeof item.schema.defaultValue !== 'undefined') {
      item.value = item.schema.isArray ?
        this._parseArrayExample(/** @type {string} */ (item.schema.defaultValue), processOptions) :
        this._exampleAsValue(/** @type {string} */ (item.schema.defaultValue), processOptions);
    }
    if (typeof item.value === 'undefined' && item.schema.required) {
      const { examples } = item.schema;
      if (examples && examples.length) {
        item.value = this._exampleAsValue(examples[0].value, processOptions);
      }
      if ((typeof item.value === 'undefined' || item.value === '') && Array.isArray(item.schema.enum)) {
        item.value = this._exampleAsValue(item.schema.enum[0], processOptions);
      }
    }

    if (Array.isArray(item.schema.enum) && item.schema.examples && item.schema.examples.length === 1 &&
      !item.schema.examples[0].value) {
      delete item.schema.examples;
    }

    if (item.value && item.schema.isArray && typeof item.value === 'string') {
      const _v = this._parseArrayExample(item.value, processOptions);
      item.value = _v instanceof Array ? _v : [_v];
    }

    if (item.schema.isArray && !item.value) {
      item.value = [''];
    }

    if (item.schema.isBool && typeof item.value === 'boolean') {
      item.value = String(item.value);
    }

    item.schema.extendedDescription = this._computeExtendedDocumentation(item);
    return item;
  }

  /**
   * Completes computation of input label.
   *
   * @param {string} displayName Value of the `displayName` property
   * @param {string} name Property name
   * @param {boolean} required Is item required
   * @return {string} Common input label construction.
   */
  _completeInputLabel(displayName, name, required) {
    if (!displayName) {
      displayName = name || 'Input value';
    }
    if (required) {
      displayName += '*';
    }
    return displayName;
  }

  /**
   * Computes list of examples from the Raw data model.
   * @param {any} model
   * @return {Example[]|undefined}
   */
  _computeRawExamples(model) {
    if (!model || !model[0]) {
      return undefined;
    }
    const result = [];
    [model] = model;
    const keys = Object.keys(model);
    keys.forEach((key) => {
      const dKey = this._getAmfKey(this.ns.raml.vocabularies.data.toString());
      if (key.indexOf(dKey) === -1) {
        return;
      }
      const symbol = key.indexOf('#') !== -1 ? '#' : ':';
      const name = key.split(symbol)[1];
      const value = this._computeRawModelValue(model[key]);
      if (value) {
        result.push({
          name,
          value,
          hasTitle: !!name
        });
      }
    });
    return result;
  }

  /**
   * Computes form (parameter) name from AMF model.
   * @param {any} model AMF item model
   * @return {string|undefined} Name property or undefined if not found.
   */
  _computeFormName(model) {
    const pNameKey = this.ns.aml.vocabularies.apiContract.paramName;
    let name = this._getValue(model, pNameKey);
    if (!name) {
      const key = this.ns.aml.vocabularies.core.name;
      name = this._getValue(model, key);
    }
    return /** @type string */ (name);
  }

  /**
   * Computes `minCount` property from AMF model for PropertyShape object.
   *
   * @param {any} model AMF item model
   * @return {boolean} True if `minCount` equals `1`
   */
  _computeRequiredPropertyShape(model) {
    const key = this.ns.w3.shacl.minCount;
    const result = this._getValue(model, key);
    return result === 1;
  }

  /**
   * Computes type of the model. It's RAML data type property.
   * @param {any} shape Property schema.
   * @return {String} Type of the property.
   */
  _computeModelType(shape) {
    if (!shape) {
      return undefined;
    }
    const vsh = this.ns.aml.vocabularies.shapes;
    const sa = this.ns.w3.shacl;
    if (this._hasType(shape, vsh.UnionShape)) {
      return 'union';
    }
    if (this._hasType(shape, vsh.ArrayShape)) {
      return 'array';
    }
    if (this._hasType(shape, sa.NodeShape)) {
      return 'object';
    }
    if (this._hasType(shape, sa.PropertyShape)) {
      return 'object';
    }
    if (this._hasType(shape, vsh.FileShape)) {
      return 'file';
    }
    if (this._hasType(shape, vsh.NilShape)) {
      return 'null';
    }
    // Apparently version 2 of the model has AnyShape type with ScalarShape.
    // if (this._hasType(shape, vsh.AnyShape)) {
    //   return 'string';
    // }
    if (this._hasType(shape, vsh.MatrixShape)) {
      return 'array';
    }
    if (this._hasType(shape, vsh.TupleShape)) {
      return 'object';
    }
    if (this._hasType(shape, vsh.ScalarShape)) {
      let dt = shape[this._getAmfKey(sa.datatype)];
      if (Array.isArray(dt)) {
        [dt] = dt;
      }
      let id = dt;
      if (typeof id !== 'string') {
        id = id['@id'];
      }
      const x = this.ns.w3.xmlSchema;
      switch (id) {
        case x.string:
        case this._getAmfKey(x.string):
          return 'string';
        case x.integer:
        case this._getAmfKey(x.integer):
          return 'integer';
        case x.long:
        case this._getAmfKey(x.long):
          return 'long';
        case x.float:
        case this._getAmfKey(x.float):
          return 'float';
        case x.double:
        case this._getAmfKey(x.double):
          return 'double';
        case vsh.number:
        case this._getAmfKey(vsh.number):
          return 'number';
        case x.boolean:
        case this._getAmfKey(x.boolean):
          return 'boolean';
        case x.dateTime:
        case this._getAmfKey(x.dateTime):
          return 'datetime';
        case vsh.dateTimeOnly:
        case this._getAmfKey(vsh.dateTimeOnly):
          return 'datetime-only';
        case x.time:
        case this._getAmfKey(x.time):
          return 'time';
        case x.date:
        case this._getAmfKey(x.date):
          return 'date';
        case x.base64Binary:
        case this._getAmfKey(x.base64Binary):
          return 'string';
        case vsh.password:
        case this._getAmfKey(vsh.password):
          return 'password';
        default:
      }
    }
    return 'string';
  }

  /**
   * Computes type of the raw model.
   *
   * @param {any} model Property schema.
   * @return {string|number|boolean|object[]|null|undefined} Type of the property.
   */
  _computeRawModelValue(model) {
    if (!model) {
      return undefined;
    }
    if (Array.isArray(model)) {
      [model] = model;
    }
    let dataType = model['@type'];
    if (Array.isArray(dataType)) {
      [dataType] = dataType;
    }
    switch (dataType) {
      case this._getAmfKey(this.ns.raml.vocabularies.data.Scalar):
        return this._computeRawScalarValue(model);
      case this._getAmfKey(this.ns.raml.vocabularies.data.Array):
        return this._computeRawArrayValue(model);
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.FileShape):
        return this._getValueArray(model, this.ns.aml.vocabularies.shapes.fileType);
      default: return undefined;
    }
  }

  /**
   * Computes scalar value that has proper type.
   * @param {any} item Shape to test for a value.
   * @return {string|number|boolean}
   */
  _computeRawScalarValue(item) {
    const value = this._getValue(item, this.ns.raml.vocabularies.data.value);
    const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
    let type = item[dtKey];
    if (Array.isArray(type)) {
      [type] = type;
    }
    type = type['@id'];
    const s = this.ns.w3.xmlSchema;
    switch (type) {
      case this._getAmfKey(s.number):
      case this._getAmfKey(s.long):
      case this._getAmfKey(s.integer):
      case this._getAmfKey(s.float):
      case this._getAmfKey(s.double):
        return Number(value);
      case this._getAmfKey(s.boolean):
        return value !== 'false';
      default:
        return value;
    }
  }

  /**
   * @param {any} item Array property schema
   * @return {any[]|undefined} Array values.
   */
  _computeRawArrayValue(item) {
    const key = this._getAmfKey(this.ns.w3.rdfSchema.member);
    const values = this._ensureArray(item[key]);
    if (!values) {
      return undefined;
    }
    const result = [];
    values.forEach((value) => {
      const res = this._computeRawScalarValue(value);
      if (res) {
        result.push(res);
      }
    });
    return result;
  }

  /**
   * Computes form input label value.
   *
   * @param {any} def Property definition
   * @param {boolean=} required True if the property is required
   * @param {string=} name Property name
   * @return {string} Input display name.
   */
  _computeInputLabel(def, required, name) {
    const result = /** @type string */ (this._getValue(def, this.ns.aml.vocabularies.core.name));
    return this._completeInputLabel(result, name, required);
  }

  /**
   * Computes the value of a property that namespace starts with
   * `http://www.w3.org/ns/shacl`.
   *
   * @param {any} shape Property AMF definition
   * @param {string} property Name of the schema.
   * @return {any|undefined} Value of the property or undefined if not set.
   */
  _computeShaclProperty(shape, property) {
    const key = this.ns.w3.shacl.key + String(property);
    return this._getValue(shape, key);
  }

  /**
   * Computes the value of a property that namespace starts with
   * `http://raml.org/vocabularies/shapes`.
   *
   * @param {any} shape Property AMF definition
   * @param {string} property Name of the schema.
   * @return {any|undefined} Value of the property or undefined if not set.
   */
  _computeVocabularyShapeProperty(shape, property) {
    const key = this.ns.aml.vocabularies.shapes + String(property);
    return this._getValue(shape, key);
  }

  /**
   * Computes default value for a shape.
   * @param {any} shape Amf shape
   * @return {any|undefined} Default value for the model or undefined.
   */
  _computeDefaultValue(shape) {
    const valueKey = this._getAmfKey(this.ns.w3.shacl.defaultValueStr);
    let value = shape[valueKey];
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value)) {
      [value] = value;
    }
    if (value['@value']) {
      value = value['@value'];
    }
    if (this._hasType(shape, this.ns.aml.vocabularies.shapes.ScalarShape)) {
      const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
      let type = shape[dtKey];
      if (Array.isArray(type)) {
        [type] = type;
      }
      type = type['@id'];
      const s = this.ns.w3.xmlSchema;
      switch (type) {
        case s.number:
        case s.long:
        case s.integer:
        case s.float:
        case s.double:
        case this._getAmfKey(s.number):
        case this._getAmfKey(s.long):
        case this._getAmfKey(s.integer):
        case this._getAmfKey(s.float):
        case this._getAmfKey(s.double):
          return Number(value);
        case s.boolean:
        case this._getAmfKey(s.boolean):
          return value !== 'false';
        default:
          return value;
      }
    } else if (this._hasType(shape, this.ns.aml.vocabularies.shapes.ArrayShape)) {
      const vKey = this._getAmfKey(this.ns.w3.shacl.defaultValue);
      let value2 = shape[vKey];
      if (!value2) {
        return value;
      }
      if (Array.isArray(value2)) {
        [value2] = value2;
      }
      return this._computeRawArrayValue(value2);
    }
    return value;
  }

  /**
   * Computes enum values for the view model.
   * @param {any} def Model definition.
   * @return {any[]} List of values.
   */
  _computeModelEnum(def) {
    def = this._resolve(def);
    const inKey = this._getAmfKey(this.ns.w3.shacl.in);
    let model = def[inKey];
    if (!model) {
      return undefined;
    }
    if (Array.isArray(model)) {
      [model] = model;
    }
    const result = [];
    const rdfKey = this._getAmfKey(this.ns.w3.rdfSchema.key);
    Object.keys(model).forEach((key) => {
      if (key.indexOf(rdfKey) === -1) {
        return;
      }
      let shape = model[key];
      if (Array.isArray(shape)) {
        [shape] = shape;
      }
      const vKey = this._getAmfKey(this.ns.raml.vocabularies.data.value);
      const value = this._getValue(shape, vKey);
      if (value) {
        result.push(value);
      }
    });
    return result;
  }

  /**
   * Computes list of examples for the Property model.
   *
   * @param {any} model AMF property model
   * @return {Example[]|undefined} List of examples or `undefined` if not defined.
   */
  _computeModelExamples(model) {
    const gen = new ExampleGenerator(this.amf);
    return gen.computeExamples(model, 'application/json', {});
  }

  /**
   * Computes `items` property for AMF array property
   *
   * @param {any} model AMF property model
   * @return {string} Type of an item
   */
  _computeModelItems(model) {
    if (!this._hasType(model, this.ns.aml.vocabularies.shapes.ArrayShape)) {
      return undefined;
    }
    model = this._resolve(model);
    const itKeys = this._getAmfKey(this.ns.aml.vocabularies.shapes.items);
    let item = model[itKeys];
    if (!item) {
      return undefined;
    }
    if (Array.isArray(item)) {
      [item] = item;
    }
    const type = this._computeModelType(item);
    // _computeModelType() always returns a value
    // TODO: add support for objects and unions.
    return type;
  }

  /**
   * Computes value delimiter for processing options.
   * @param {string} binding Property's binding
   * @return {string} A `:` for headers, `=` for query param, and empty for other.
   */
  _computeValueDelimiter(binding) {
    switch (binding) {
      case 'header': return ':';
      case 'query': return '=';
      default: return '';
    }
  }

  /**
   * Computes value for decodeValues of ProcessingOptions.
   * @param {string} binding Property's binding
   * @return {boolean} True whe values should be encoded.
   */
  _computeDecodeValues(binding) {
    switch (binding) {
      case 'query': return true;
      default: return false;
    }
  }

  /**
   * Parses a string from example or enum value to be used as a default value.
   * @param {string | number | boolean | object | any[]} example Example value to process as a value
   * @param {ProcessOptions} opts
   *
   * @return {string}
   */
  _exampleAsValue(example, opts) {
    if (!example || typeof example !== 'string') {
      return example;
    }
    example = example.trim();
    if (opts.valueDelimiter && example.indexOf(opts.name + opts.valueDelimiter) === 0) {
      example = example.substr(opts.name.length + 1).trim();
    }
    if (opts.decodeValues) {
      try {
        example = decodeURIComponent(example.replace(/\+/g, ' '));
      } catch (e) {
        // ...
      }
    }
    return example;
  }

  /**
   * Parses example in an array type.
   *
   * @param {string} example An array example
   * @param {ProcessOptions} processOptions
   * @return {string[]|string} Array of examples or string if cannot parse
   */
  _parseArrayExample(example, processOptions) {
    try {
      const arr = JSON.parse(example);
      if (arr instanceof Array) {
        const result = [];
        arr.forEach((item) => {
          const ex = this._exampleAsValue(item, processOptions);
          if (ex) {
            result[result.length] = ex;
          }
        });
        return result.length ? result : undefined;
      }
    } catch (e) {
      // ...
    }
    return this._exampleAsValue(example, processOptions);
  }

  /**
   * Computes rendered item input field type based on RAML definition.
   *
   * It will be either numeric or text. Type will be determined from
   * item's type or, in case of array, item's items property.
   *
   * @param {string} type Property data type.
   * @param {AmfFormItem|Object|string} items Array items if any
   * @return {"number" | "boolean" | "date" | "text"} Input field type.
   */
  _computeModelInputType(type, items) {
    if (type === 'array') {
      if (typeof items === 'string') {
        return this._computeInputType(items);
      }
      if (!items) {
        return 'text';
      }
      return this._computeInputType(items.schema ? items.schema.apiType : items.apiType);
    }
    return this._computeInputType(type);
  }

  /**
   * Computes the type attribute value for a text input for given type.
   *
   * @param {string} type One of the schema types
   * @return {"number" | "boolean" | "date" | "text"} Value for the text input type.
   */
  _computeInputType(type) {
    if (type && NUMBER_INPUT_TYPES.indexOf(type) !== -1) {
      return 'number';
    } 
    if (type === 'boolean') {
      return 'boolean';
    } 
    if (type === 'date-only' || type === 'date') {
      return 'date';
    } /* else if (type === 'time-only' || type === 'time') {
      Time input does not work well in the console.
      It's better to use regular input. Unless someone create custom time
      input.
      return 'time';
    } */
    return 'text';
  }

  /**
   * Computes pattern for the input.
   *
   * @param {string} modelType Type of the property item.
   * @param {string=} pattern Pattern declared on the property
   * @param {string=} format For `datetime` type additional format value.
   * `rfc3339` is assumed by default
   * @return {string|undefined} Pattern or undefined if does not exists.
   */
  _computeModelPattern(modelType, pattern, format) {
    if (!pattern) {
      switch (modelType) {
        case 'time':
          pattern = '^[0-9]{2}:[0-9]{2}:[0-9]{2}\\.?[0-9]{0,3}$';
          break;
        case 'date':
          pattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
          break;
        case 'datetime-only':
          pattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.?[0-9]{0,3}$';
          break;
        case 'datetime':
          if (format === 'rfc2616') {
            pattern = '';
          } else {
            pattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*$';
          }
          break;
        default:
      }
    }
    return pattern;
  }

  /**
   * Computes a placeholder value for data and time inputs.
   *
   * @param {string} type Model type.
   * @param {string=} format For `datetime` type additional format value.`rfc3339` is assumed by default
   * @return {string|undefined} Placeholder value.
   */
  _computeTypePlaceholder(type, format) {
    let value;
    switch (type) {
      case 'time':
        value = '00:00:00.000';
        break;
      case 'date':
        value = '0000-00-00';
        break;
      case 'datetime-only':
        value = '0000-00-00T00:00:00.000';
        break;
      case 'datetime':
        if (format === 'rfc2616') {
          value = 'Sun, 01 Jan 2000 00:00:00 GMT';
        } else {
          value = '0000-00-00T00:00:00Z+01:00';
        }
        break;
      default:
    }
    return value;
  }

  /**
   * Builds an empty view model without traversing AMF model.
   *
   * @param {AmfFormItem=} defaults View model with default values. This values won't be set.
   * @param {string=} binding
   * @return {AmfFormItem} Generated basic view model.
   */
  buildProperty(defaults={
    name: undefined,
    value: undefined,
    enabled: true,
  }, binding) {
    defaults.schema = defaults.schema || {};
    defaults.schema.apiType = defaults.schema.apiType || 'string';
    defaults.schema.isArray = defaults.schema.isArray || false;
    defaults.schema.isBool = defaults.schema.isBool || false;
    defaults.schema.isFile = defaults.schema.apiType === 'file';
    defaults.schema.inputType = defaults.schema.inputType || 'text';
    defaults.schema.inputType = this._computeModelInputType(defaults.schema.apiType, defaults.schema.items);
    defaults.schema.pattern = this._computeModelPattern(defaults.schema.apiType, defaults.schema.pattern);
    if (!defaults.schema.inputLabel) {
      defaults.schema.inputLabel = defaults.name || 'Parameter value';
    }
    this._processAfterItemCreated(defaults, binding, {});
    return defaults;
  }

  /**
   * Computes documentation as a markdown to be placed in the `marked-element`
   * @param {AmfFormItem} item View model
   * @returns {string} Generated documentation
   */
  _computeExtendedDocumentation(item) {
    let docs = '';
    if (item.schema.description) {
      docs += item.schema.description;
    }
    const { schema } = item;
    const items = [];
    if (schema.pattern) {
      items[items.length] = `- Pattern: \`${schema.pattern}\``;
    }
    if (schema.examples && schema.examples.length) {
      schema.examples.forEach((example) => {
        if (example.value === undefined || example.value === '') {
          return;
        }
        let result = '- Example';
        if (example.title) {
          result += ` ${example.title}`;
        }
        let value;
        if (Array.isArray(example.value)) {
          value = example.value.join(', ');
        } else {
          value = example.value;
        }
        result += `: \`${value}\``;
        items[items.length] = result;
      });
    }
    if (docs && items.length) {
      docs += '\n\n\n';
    }
    return docs + items.join('\n');
  }

  /**
   * Returns `true` only when passed shape has `shapes#anyOf` array and
   * one of the union properties is of a type od NilShape.
   * @param {Object} shape Shape test for a nillable union.
   * @return {boolean}
   */
  _computeIsNillable(shape) {
    if (!shape) {
      return false;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
    const values = this._ensureArray(shape[key]);
    if (!values) {
      return false;
    }
    for (let i = 0, len = values.length; i < len; i++) {
      if (this._hasType(values[i], this.ns.aml.vocabularies.shapes.NilShape)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if given property has `no-auto-encoding` annotation.
   *
   * @param {object} shape An object to test for the annotation.
   * @return {boolean} True if the annotation is set.
   */
  _hasNoAutoEncodeProperty(shape) {
    if (!shape) {
      return false;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.customDomainProperties);
    const values = this._ensureArray(shape[key]);
    if (!values) {
      return false;
    }
    for (let i = 0, len = values.length; i < len; i++) {
      const id = this._ensureAmfPrefix(/** @type string */ (this._getValue(values[i], '@id')));
      const node = shape[id];
      const extensionNameKey = this._getAmfKey(this.ns.aml.vocabularies.core.extensionName);
      if (this._getValue(node, extensionNameKey) === 'no-auto-encoding') {
        return true;
      }
    }
    return false;
  }

  /**
   * 
   * @param {string} id 
   * @return {string}
   */
  _ensureAmfPrefix(id) {
    if (!id.startsWith('amf://id')) {
      return `amf://id${id}`;
    }
    return id;
  }
}
