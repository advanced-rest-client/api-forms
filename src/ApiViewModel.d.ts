import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { ConstructorOptions, ProcessOptions } from './types';
import { AmfFormItem, AmfFormItemSchema, Example } from '@advanced-rest-client/arc-types/src/forms/FormTypes';

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
declare class ApiViewModel extends AmfHelperMixin(Object) {

  /**
   * An array of properties for which view model is to be generated.
   * It accepts model for headers, query parameters, uri parameters and
   * body.
   * If `manualModel` is not set, assigning a value to this property will
   * trigger model computation. Otherwise call `computeViewModel()`
   * function manually to generate the model.
   */
  amf: any[]|any|undefined;

  /**
   * Does not compute documentation for the processed property
   */
  noDocs: boolean;

  constructor(opts?: ConstructorOptions);

  /**
   * Clears cache for computed models.
   * All computed models are kept in in-memory cache to another call for computation
   * of the same model will result with reference to already computed value.
   * This function clears all cached objects.
   *
   * Note, the memory won't be freed for objects that are in use.
   */
  clearCache(): void;

  /**
   * Computes view model from AMF data model. This should not be called if
   * `manualModel` is not set. Use `shape` property instead.
   *
   * @param shape AMF type model. If not set it uses `shape`
   * property of the element.
   * @returns A promise resolved to generated model.
   */
  computeViewModel(shape: any): AmfFormItem[]|undefined;

  /**
   * Computes model for each item recursively. It allows browser to return
   * the event loop and prohibit ANR to show.
   *
   * @param items List of remanding AMF model items.
   * This should be copy of the model since this function removes items from
   * the list.
   * @returns The view model.
   */
  _computeViewModel(items: any): AmfFormItem[]|undefined;

  /**
   * Creates a UI model item from AMF json/ld model.
   *
   * @param amfItem AMF model with schema for
   * `http://raml.org/vocabularies/http#Parameter`
   * @returns UI data model.
   */
  uiModelForAmfItem(amfItem: any): AmfFormItem|undefined;

  /**
   * Creates a model for a shacl's PropertyShape. It can be found, for example,
   * in `queryString` of security scheme settings.
   *
   * @param shape The shape to process
   * @returns Generated view model for an item.
   */
  _processNodeShape(shape: any): AmfFormItem[];

  /**
   * Creates a UI model item from AMF json/ld model for a parameter.
   *
   * @param amfItem AMF model with schema for
   * `http://raml.org/vocabularies/http#Parameter`
   * @returns UI data model.
   */
  _uiModelForParameter(amfItem: any): AmfFormItem;

  /**
   * Creates a UI model item from AMF json/ld model for a parameter.
   *
   * @param amfItem AMF model with schema for
   * `http://raml.org/vocabularies/http#Parameter`
   * @returns UI data model.
   */
  _uiModelForPropertyShape(amfItem: any): AmfFormItem;

  /**
   * Creates a view model for an object definition. Object definition can be
   * part of trait or annotation properties description.
   *
   * @param model Model to extract data from.
   * @returns View model for items.
   */
  modelForRawObject(model: any, processOptions?: ProcessOptions): AmfFormItem[];

  /**
   * Creates a view model for union definition.
   *
   * @param model Model to extract data from.
   * @returns View model for items.
   */
  _modelForUnion(model: any): AmfFormItem[];

  /**
   * Creates a view model from "raw" item (model before resolving).
   *
   * @param key Key of the item in the model.
   * @param model Item model
   * @returns View model
   */
  _uiModelForRawObject(key: string, model: string): AmfFormItem;

  /**
   * Sets up additional properties like `value` or placeholder from
   * values read from the AMF model.
   *
   * @param item Computed UI model.
   * @param processOptions Model creation options
   */
  _processAfterItemCreated(item: AmfFormItem, binding: string, processOptions: ProcessOptions): AmfFormItem;

  /**
   * Completes computation of input label.
   *
   * @param displayName Value of the `displayName` property
   * @param name Property name
   * @param required Is item required
   * @returns Common input label construction.
   */
  _completeInputLabel(displayName: string, name: string, required: boolean): string;

  /**
   * Computes list of examples from the Raw data model.
   */
  _computeRawExamples(model: any): Example[]|undefined;

  /**
   * Computes form (parameter) name from AMF model.
   *
   * @param model AMF item model
   * @returns Name property or undefined if not found.
   */
  _computeFormName(model: any): String|undefined;

  /**
   * Computes `minCount` property from AMF model for PropertyShape object.
   *
   * @param model AMF item model
   * @returns True if `minCount` equals `1`
   */
  _computeRequiredPropertyShape(model: any): boolean;

  /**
   * Computes type of the model. It's RAML data type property.
   *
   * @param shape Property schema.
   * @returns Type of the property.
   */
  _computeModelType(shape: any): string;

  /**
   * Computes type of the raw model.
   *
   * @param model Property schema.
   * @returns Type of the property.
   */
  _computeRawModelValue(model: any): string|number|boolean|object[]|null|undefined;

  /**
   * Computes scalar value that has proper type.
   *
   * @param item Shape to test for a value.
   */
  _computeRawScalarValue(item: any): string|number|boolean;

  /**
   * @param item Array property schema
   * @return Array values.
   */
  _computeRawArrayValue(item: any): any[];

  /**
   * Computes form input label value.
   *
   * @param def Property definition
   * @param required True if the property is required
   * @param name Property name
   * @returns Input display name.
   */
  _computeInputLabel(def: any, required?: boolean, name?: string): String|undefined;

  /**
   * Computes the value of a property that namespace starts with
   * `http://www.w3.org/ns/shacl`.
   *
   * @param shape Property AMF definition
   * @param property Name of the schema.
   * @returns Value of the property or undefined if not set.
   */
  _computeShaclProperty(shape: any, property: string): any|undefined;

  /**
   * Computes the value of a property that namespace starts with
   * `http://raml.org/vocabularies/shapes`.
   *
   * @param shape Property AMF definition
   * @param property Name of the schema.
   * @returns Value of the property or undefined if not set.
   */
  _computeVocabularyShapeProperty(shape: any, property: String): any|undefined;

  /**
   * Computes default value for a shape.
   *
   * @param shape Amf shape
   * @returns Default value for the model or undefined.
   */
  _computeDefaultValue(shape: any): any|undefined;

  /**
   * Computes enum values for the view model.
   *
   * @param def Model definition.
   * @returns List of values.
   */
  _computeModelEnum(def: any): any[]|undefined;

  /**
   * Computes list of examples for the Property model.
   *
   * @param model AMF property model
   * @returns List of examples or `undefined` if not
   * defined.
   */
  _computeModelExamples(model: any): Example[]|undefined;

  /**
   * Computes `items` property for AMF array property
   *
   * @param model AMF property model
   * @returns Type of an item
   */
  _computeModelItems(model: any): string;

  /**
   * Computes value delimiter for processing options.
   * @param binding Property's binding
   * @return A `:` for headers, `=` for query param, and empty for other.
   */
  _computeValueDelimiter(binding: string): string;

  /**
   * Computes value for decodeValues of ProcessingOptions.
   * @param binding Property's binding
   * @return True whe values should be encoded.
   */
  _computeDecodeValues(binding: string): boolean;

  /**
   * Parses a string from example or enum value to be used as a default value.
   *
   * @param example Example value to process as a value
   */
  _exampleAsValue(example: string, opts?: ProcessOptions): string|undefined;

  /**
   * Parses example in an array type.
   *
   * @param example An array example
   * @param processOptions
   * @return Array of examples or string if cannot parse
   */
  _parseArrayExample(example: string, processOptions: ProcessOptions): string[] | string;

  /**
   * Computes rendered item input field type based on RAML definition.
   *
   * It will be either numeric or text. Type will be determined from
   * item's type or, in case of array, item's items property.
   *
   * @param type Property data type.
   * @param items Array items if any
   * @returns Input field type.
   */
  _computeModelInputType(type: String, items: AmfFormItem|object|string): string;

  /**
   * Computes the type attribute value for a text input for given type.
   *
   * @param type One of the schema types
   * @return Value for the text input type.
   */
  _computeInputType(type: string): string;

  /**
   * Computes pattern for the input.
   *
   * @param modelType Type of the property item.
   * @param pattern Pattern declared on the property
   * @param format For `datetime` type additional format value.
   * `rfc3339` is assumed by default
   * @returns Pattern or undefined if does not exists.
   */
  _computeModelPattern(modelType: string, pattern?: string, format?: string): string|undefined;

  /**
   * Computes a placeholder value for data and time inputs.
   *
   * @param type Model type.
   * @param format For `datetime` type additional format value.
   * `rfc3339` is assumed by default
   * @returns Placeholder value.
   */
  _computeTypePlaceholder(type: string, format?: string): string|undefined;

  /**
   * Builds empty view model without traversing AMF model.
   *
   * @param defaults View model with default values. This values won't be set.
   * @returns Generated basic view model.
   */
  buildProperty(defaults?: AmfFormItem): AmfFormItem;

  /**
   * Computes documentation as a markdown to be placed in the `marked-element`
   *
   * @param item View model
   * @returns Generated documentation
   */
  _computeExtendedDocumentation(item: AmfFormItem): String;

  /**
   * Returns `true` only when passed shape has `shapes#anyOf` array and
   * one of the union properties is of a type od NilShape.
   *
   * @param shape Shape test for nillable union.
   */
  _computeIsNillable(shape: any): boolean;

  /**
   * Checks if given property has `no-auto-encoding` annotation.
   *
   * @param shape An object to test for the annotation.
   * @return True if the annotation is set.
   */
  _hasNoAutoEncodeProperty(shape: any): boolean;

  _ensureAmfPrefix(id: string): string;
}
