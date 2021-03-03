import { CSSResult, LitElement, TemplateResult } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin';
import { AmfFormItem, AmfFormItemSchema } from '@advanced-rest-client/arc-types/src/forms/FormTypes';
import { AnypointInput } from '@anypoint-web-components/anypoint-input';
import { AnypointDropdownMenu } from '@anypoint-web-components/anypoint-dropdown-menu';

export const enumTemplate: unique symbol;
export const booleanTemplate: unique symbol;
export const inputTemplate: unique symbol;
export const arrayTemplate: unique symbol;
export const modelValue: unique symbol;
export const valueValue: unique symbol;
export const isArrayValue: unique symbol;
export const isNillableValue: unique symbol;

/**
 * An element that renders a form input to edit API type value.
 * 
 * @fires change When the value of the control change from the user input
 */
export class ApiFormItemElement extends ValidatableMixin(LitElement) {
  get styles(): CSSResult;

  /**
   * View model generated for this view.
   */
  model: AmfFormItem;
  /**
   * Name of the form item
   * @attribute
   */
  name: string;
  /**
   * When set, prohibits inputs to have floating labels
   * @attribute
   */
  noLabelFloat: boolean;
  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined: boolean;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;
  /**
   * Input's value.
   * @attribute
   */
  value: string|number|boolean;
  [valueValue]: string;

  // Computed value, True if current item is a dropdown with values.
  _isEnum: boolean;
  // Computed value, True if current item is an regular input
  _isInput: boolean;
  // Computed value, True if current item is an array object
  _isArray: boolean;
  [isArrayValue]: boolean;
  // Computed value, True if current item is an union with nill value.
  _isNillable: boolean;
  [isNillableValue]: boolean;

  _nilEnabled: boolean;
  // Computed value, True if current item is a boolean value
  _isBoolean: boolean;
  // A value of an array item (only if `isArray` is set)
  _arrayValue: ({ value: string|number })[];
  /**
   * Set to indicate that the consol is required
   * @attribute
   */
  required: boolean;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /**
   * When set the editor renders form controls disabled.
   * @attribute
   */
  disabled: boolean;


  constructor();

  /**
   * Resets UI state variables
   */
  _resetStates(): void;

  // Sets the template depending on model configuration
  _modelChanged(model: AmfFormItem): void;

  /**
   * Sets `arrayValue` from model's value.
   *
   * @param model ARC amf view model.
   */
  _prepareArraySchema(model: AmfFormItem): void;

  // Sets array values if needed
  _isArrayChanged(isArray: boolean): void;

  /**
   * The `dom-repeat` requires an object to properly support changes.
   * In order to do this simple values has to be transformed into objects.
   *
   * @param value An array of values.
   */
  _itemsForArray(value: string|string[]): string[];

  // Handles array value change and sets the `value` property.
  _arrayValueChanged(): void;

  /**
   * Adds new element to the array value.
   * @return Index of the value in the values array.
   * Note that the index may change over time if the user remove any value.
   */
  addEmptyArrayValue(): number;

  /**
   * Removes an array value for given index.
   * @param index A position of the value in the array
   */
  removeArrayValue(index: number): void;

  // Removes item from array value.
  _removeArrayValue(e: Event): void;

  /**
   * Fallback validator if form validator is unavailable.
   *
   * @return True if the control is valid.
   */
  _defaultValidator(): boolean;

  /**
   * Returns input(s) depending on model type.
   * @return Returns an element for input, enum, and
   * boolean types. Returns NodeList for array type. Returns undefined when model is not set
   * or DOM is not ready.
   */
  _getInputElement(): AnypointInput|AnypointInput[]|AnypointDropdownMenu|undefined;

  /**
   * Overrides `ValidatableMixin._getValidity`.
   * If the element is set to be `NIL` value it always returns true.
   * Otherwise it calls `_getInputsValidity()` for input validation result.
   * @returns Validation result
   */
  _getValidity(): boolean;

  /**
   * Validates the inputs and returns validation state.
   */
  _getInputsValidity(): boolean;
  /**
   * Controls value and input state when "nil" checkbox value change.
   */
  _nillableChanged(e: CustomEvent): Promise<void>;

  _listSelectionHandler(e: Event): void;

  /**
   * Handler for `input` event coming from regular input.
   */
  _inputHandler(e: Event): void;

  /**
   * Handler for `change` event coming from regular input.
   * This is a special case for FF where input event won't be dispatched
   * for number type and when using arrow up/down.
   */
  _inputChangeHandler(e: Event): void;

  /**
   * Handler for input event coming from array items.
   */
  _arrayValueHandler(e: Event): void;

  /**
   * Dispatches non-bubbling `input` event.
   */
  _notifyInput(): void;

  render(): TemplateResult;
  [enumTemplate](): TemplateResult;

  [booleanTemplate](): TemplateResult | string;

  [inputTemplate](): TemplateResult | string;

  [arrayTemplate](): TemplateResult | string;

  _computeInputWarningMessage(value: AmfFormItemSchema, required: boolean): string | undefined

  _computeIsTextInput(schema: AmfFormItemSchema): boolean

  _updateValueWarningMessage(): void

  _updateArrayValueWarningMessage(index: number): void

  _addEmptyArrayWarningMessage(): void

  _removeArrayWarningMessage(index: number): void

  _setWarningMessagesForArray(values: { value: string }[]): void

}
