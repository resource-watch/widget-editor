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
 */

/**
 * Get the configuration of the widget editor
 * @return {WidgetEditorConfig}
 */
export function getConfig() {
  if (!config) {
    throw new Error('You must provide a configuration for widget-editor.'); // TODO: library name
  } else {
    return config;
  }
};

/**
 * Set the configuration of the widget editor
 * @param {WidgetEditorConfig} params Configuration of the widget editor
 */
export function setConfig(params) {
  if (config) return;

  if (!params || !params.url || !params.env || !params.applications || !params.authUrl) {
    throw new Error('The configuration of widget-editor must provide the env, applications and url and authUrl attributes.'); // TODO: library name
  }

  if (params && ((params.userToken && !params.userEmail) || !params.userToken && params.userEmail)) {
    throw new Error('If the user is logged in, specify their token *and* email in the configuration of the widget-editor.'); // TODO: library name
  }

  config = {
    url: params.url,
    env: params.env,
    applications: params.applications,
    authUrl: params.authUrl,
    userToken: params.userToken || null,
    userEmail: params.userEmail || null
  };
};
