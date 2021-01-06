import { AmfHelperMixin } from '@api-components/amf-helper-mixin';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(Object) {}

const helper = new HelperElement();

AmfLoader.load = async (compact=false, fileName='demo-api') => {
  const suffix = compact ? '-compact' : '';
  const file = `${fileName}${suffix}.json`;
  const url = `${window.location.protocol}//${window.location.host}/demo/${file}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to download API data model');
  }
  return response.json();
};

/**
 * Searches for an endpoint
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @return {object} Endpoint model
 */
AmfLoader.lookupEndpoint = (amf, endpoint) => {
  helper.amf = amf;
  const webApi = helper._computeWebApi(amf);
  return helper._computeEndpointByPath(webApi, endpoint);
};

/**
 * Searches for endpoint's parameters
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @return {Array<object>} List of parameters
 */
AmfLoader.lookupEndpointParameters = (amf, endpoint) => {
  const endPoint = AmfLoader.lookupEndpoint(amf, endpoint);
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.parameter);
  return helper._ensureArray(endPoint[key]);
};

/**
 * Searches for operation parameters
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {object} The operation model.
 */
AmfLoader.lookupOperation = (amf, endpoint, operation) => {
  const endPoint = AmfLoader.lookupEndpoint(amf, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

/**
 * Searches for operation parameters
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {Array<object>} List of parameters
 */
AmfLoader.lookupOperationParameters = (amf, endpoint, operation) => {
  const method = AmfLoader.lookupOperation(amf, endpoint, operation);
  const expects = helper._computeExpects(method);
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.parameter);
  return helper._ensureArray(expects[key]);
};


/**
 * Searches for operation query parameters
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {Array<object>} List of parameters
 */
AmfLoader.lookupOperationQueryString = (amf, endpoint, operation) => {
  const method = AmfLoader.lookupOperation(amf, endpoint, operation);
  const expects = helper._computeExpects(method);
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.queryString);
  return helper._ensureArray(expects[key]);
};

/**
 * Searches for operation headers
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {Array<object>} List of headers
 */
AmfLoader.lookupOperationHeaders = (amf, endpoint, operation) => {
  const method = AmfLoader.lookupOperation(amf, endpoint, operation);
  const expects = helper._computeExpects(method);
  const hKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.header);
  return helper._ensureArray(expects[hKey]);
};

/**
 * Searches for operation's first security definition
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {object} First security scheme
 */
AmfLoader.lookupSecurity = (amf, endpoint, operation) => {
  const method = AmfLoader.lookupOperation(amf, endpoint, operation);
  const secKey = helper._getAmfKey(helper.ns.aml.vocabularies.security.security);
  let security = method[secKey];
  if (Array.isArray(security)) {
    [security] = security;
  }
  return security;
};

/**
 * Searches for operation security definition's scheme
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @param {string=} schemeName Name of the security scheme
 * @return {object} Security scheme
 */
AmfLoader.lookupSecurityScheme = (amf, endpoint, operation, schemeName) => {
  const security = AmfLoader.lookupSecurity(amf, endpoint, operation);
  const schemesKey = helper._getAmfKey(helper.ns.aml.vocabularies.security.schemes);
  const schemes = security[schemesKey];
  let parametrizedSecurityScheme;
  if (schemeName) {
    parametrizedSecurityScheme = schemes.find(scheme => helper._getValue(scheme, helper.ns.aml.vocabularies.core.name));
  } else {
    [parametrizedSecurityScheme] = schemes;
  }
  const schemeKey = helper._getAmfKey(helper.ns.aml.vocabularies.security.scheme);
  let scheme = parametrizedSecurityScheme[schemeKey];
  if (Array.isArray(scheme)) {
    [scheme] = scheme;
  }
  return scheme;
};

/**
 * Searches for operation security definition's first scheme
 * @param {Object} amf AMF model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {object} Security scheme
 */
AmfLoader.lookupSecuritySettings = (amf, endpoint, operation) => {
  const security = AmfLoader.lookupSecurityScheme(amf, endpoint, operation);
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.security.settings);
  let settings = security[key];
  if (settings instanceof Array) {
    [settings] = settings;
  }
  return settings;
};

/**
 * Looks for a scalar shape in the list of declarations
 * @param {Object} amf AMF model
 * @param {number} index Declaration index
 * @return {Array<object>} properties of an object
 */
AmfLoader.lookupShapeProperties = (amf, index) => {
  helper.amf = amf;
  const decs = helper._computeDeclares(amf);
  let dec = decs[index];
  if (Array.isArray(dec)) {
    [dec] = dec;
  }
  if (helper._hasType(dec, helper.ns.aml.vocabularies.shapes.ScalarShape)) {
    return [dec];
  }
  const key = helper._getAmfKey(helper.ns.w3.shacl.property);
  return helper._ensureArray(dec[key]);
};

/**
 * Creates AMF key
 * @param {Object} amf AMF model
 * @param {string} name Key name
 * @return {String} AMF key for current model.
 */
AmfLoader.keyFor = (amf, name) => {
  helper.amf = amf;
  return helper._getAmfKey(name);
};

AmfLoader.lookupServer = (amf, serverUrl) => {
  helper.amf = amf;
  let webApi = helper._computeWebApi(amf);
  if (Array.isArray(webApi)) {
    [webApi] = webApi;
  }
  const serverKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.server);
  const servers = helper._ensureArray(webApi[serverKey]);
  return servers.find(server => {
    const urlTemplateKey = helper._getAmfKey(helper.ns.aml.vocabularies.core.urlTemplate);
    return helper._getValue(server, urlTemplateKey) === serverUrl;
  });
}

AmfLoader.getVariable = (amf, model) => {
  helper.amf = amf;
  const vKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.variable);
  return model[vKey];
}

AmfLoader.ns = () => helper.ns;
