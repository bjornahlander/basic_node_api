/*
 * Configuration via environment variables
 */

const environments = {};

environments.development = {
  ENV_NAME: 'development',
  HTTP_PORT: 3000,
};

environments.production = {
  ENV_NAME: 'production',
  HTTP_PORT: 8080,
};

const nodeEnv = process.env.NODE_ENV
const currentEnvironment = typeof(nodeEnv) == 'string' ? nodeEnv.toLowerCase() : '';

const envObject = environments[currentEnvironment]
module.exports = typeof(envObject) == 'object' ? envObject : environments.development

