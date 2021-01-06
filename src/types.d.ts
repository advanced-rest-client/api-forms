export declare interface ConstructorOptions {
  /**
   * The AMF model.
   */
  amf?: any;
  /**
   * When set the docs are not computed with the model.
   */
  noDocs?: boolean;
}

export declare interface ProcessOptions {
  /**
   * Processed property name
   */
  name?: string;
  /**
   * `:` for headers and `=` for query params
   */
  valueDelimiter?: string;
  /**
   * True to url decode value.
   */
  decodeValues?: boolean;
  /**
   * Whether the property is required.
   */
  required?: boolean;
}

export declare interface AddCustomItemOptions {
  name?: string;
  value?: any;
  inputLabel?: string;
}
