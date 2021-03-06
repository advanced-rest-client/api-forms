import {AmfFormItem} from '@advanced-rest-client/arc-types/src/forms/FormTypes';
import {Part} from 'lit-html';
import { AddCustomItemOptions } from './types';

export declare function ApiFormMixin<T extends new (...args: any[]) => {}>(base: T): T & ApiFormMixinConstructor;

export interface ApiFormMixinConstructor {
  new(...args: any[]): ApiFormMixin;
}

/**
 * A mixin to be implemented to elements that processes AMF data via form
 * data model and displays forms from the model.
 *
 * It contains common methods used in forms.
 */
interface ApiFormMixin {
  /**
   * View model to use to render the form.
   */
  apiModel: AmfFormItem[];
  /**
   * Set to true to show optional parameters (not required by the API).
   * @attribute
   */
  optionalOpened: boolean;
  /**
   * Computed value from `allowHideOptional` and view model.
   * `true` if current model has any optional property.
   * @attribute
   */
  hasOptional: boolean;
  /**
   * If set it computes `hasOptional` property and shows checkbox in the
   * form to show / hide optional properties.
   * @attribute
   */
  allowHideOptional: boolean;
  /**
   * Computed flag to determine if optional checkbox can be rendered
   * @attribute
   */
  renderOptionalCheckbox: boolean;
  /**
   * If set, enable / disable param checkbox is rendered next to each
   * form item.
   * @attribute
   */
  allowDisableParams: boolean;
  /**
   * When set, renders "add custom" item button.
   * If the element is to be used without AMF model this should always
   * be enabled. Otherwise users won't be able to add a parameter.
   * @attribute
   */
  allowCustom: boolean;
  /**
   * Renders items in "narrow" view
   * @attribute
   */
  narrow: boolean;
  /**
   * Computed value. The form renders empty message (if supported by
   * the form element). It occurs when model is not set and allowCustom
   * is not set
   * @attribute
   */
  renderEmptyMessage: boolean;

  /**
   * Computes class name for each form item depending on the item state.
   *
   * @param item Model item
   * @param allowHideOptional
   * @param optionalOpened True if optional parameters are rendered.
   * @param allowDisableParams
   */
  computeFormRowClass(item: AmfFormItem, allowHideOptional?: boolean, optionalOpened?: boolean, allowDisableParams?: boolean): (part: Part) => void;

  /**
   * Toggles visibility of optional parameters.
   */
  toggleOptionalParams(): void;

  /**
   * Serialize function.
   * @returns Serialized form values
   */
  serializeForm(): any;

  /**
   * Computes if any of the parameters are required.
   * It iterates over the model to find any first element that has `required`
   * property set to `false`.
   *
   * @param allowHideOptional State of `allowHideOptional` property.
   * If `false` this function always returns `false`.
   * @param model Current model
   * @returns `true` if model has at leas one element that is not required.
   */
  _computeHasOptionalParameters(allowHideOptional: boolean, model: AmfFormItem): boolean;

  /**
   * Computes value for `renderOptionalCheckbox` property.
   *
   * @param render Value of `allowHideOptional` property
   * @param has Value of `hasOptional` property.
   * @returns True if both values are `true`.
   */
  _computeRenderCheckbox(render: boolean, has: boolean): boolean;

  /**
   * Computes if given model item is a custom property (not generated by
   * AMF model transformation).
   * @param model Model item.
   * @returns `true` if `isCustom` property is set on model's schema
   * property.
   */
  _computeIsCustom(model: AmfFormItem): boolean;

  /**
   * Adds empty custom property to the list.
   *
   * It dispatches `api-property-model-build` custom event that is handled by
   * `api-view-model-transformer` to build model item.
   * This assumes that the transformer element is already in the DOM.
   *
   * After the transformation the element pushes or sets the data to the
   * `model`.
   *
   * @param opts Default options for the AmfFormItem. See `ApiViewModel`
   * for the details.
   */
  addCustom(opts?: AddCustomItemOptions): void;

  /**
   * Removes custom item from the UI.
   */
  _removeCustom(e: Event): void;

  /**
   * Computes if model item is optional.
   * The items is always optional if is not required and when `hasOptional`
   * is set to `true`.
   *
   * @param hasOptional
   * @param model Model item.
   * @returns `true` if the model item is optional in the form.
   */
  computeIsOptional(hasOptional: boolean, model: AmfFormItem): boolean;

  /**
   * Computes value for `renderEmptyMessage`.
   *
   * @param allowCustom True if the form allows to add custom values.
   * @param model Current model
   * @returns `true` when allowCustom is falsy set and model is empty
   */
  _computeRenderEmptyMessage(allowCustom: boolean, model?: AmfFormItem): boolean;
}
