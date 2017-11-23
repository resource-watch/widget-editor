let config = null;

export function getConfig() {
  if (!config) {
    throw new Error('You must provide a configuration for widget-editor.'); // TODO: library name
  } else {
    return config;
  }
};

export function setConfig(params) {
  if (config) return;

  if (!params || !params.url || !params.env || !params.applications) {
    throw new Error('The configuration of widget-editor must provide the env, applications and url attributes.'); // TODO: library name
  }

  config = {
    url: params.url,
    env: params.env,
    applications: params.applications,
    userToken: params.userToken || null
  };
};
