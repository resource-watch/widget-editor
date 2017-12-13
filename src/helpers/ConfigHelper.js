import pick from 'lodash/pick';

let config = null;

/**
 * Configuration of the widget editor
 * @typedef {object} WidgetEditorConfig
 * @property {string} url - Base URL of the API
 * @property {string} env - Environment of the API (comma-separated string)
 * @property {string} applications - Applications of the API (comma-separated string)
 * @property {string} authUrl - URL to authenticate the user
 * @property {string} [userToken] - Token of the logged user
 * @property {string} [userEmail] - Email of the logged user
 * @property {string} [locale] - Locale used to fetch the data
 */

/**
 * Get the configuration of the widget editor
 * @return {WidgetEditorConfig}
 */
export function getConfig() {
  if (!config || !config.url || !config.env || !config.applications || !config.authUrl) {
    console.error('You must provide a complete configuration for widget-editor.', config);
  }

  return config;
}

/**
 * Set the configuration of the widget editor
 * @param {WidgetEditorConfig} params Configuration of the widget editor
 */
export function setConfig(params) {
  const acceptedParams = pick(
    params,
    ['url', 'env', 'applications', 'authUrl', 'userToken', 'userEmail', 'locale']
  );

  config = { ...config, ...acceptedParams };
}
