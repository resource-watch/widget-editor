let config = null;

/**
 * @typedef {{ url: string, env: string, applications: string, userToken?: string, userEmail?: string}} WidgetEditorConfig
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

  if (!params || !params.url || !params.env || !params.applications) {
    throw new Error('The configuration of widget-editor must provide the env, applications and url attributes.'); // TODO: library name
  }

  if (params && ((params.userToken && !params.userEmail) || !params.userToken && params.userEmail)) {
    throw new Error('If the user is logged in, specify their token *and* email in the configuration of the widget-editor.'); // TODO: library name
  }

  config = {
    url: params.url,
    env: params.env,
    applications: params.applications,
    userToken: params.userToken || null,
    userEmail: params.userEmail || null
  };
};
