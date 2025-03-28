interface EnvConfig {
  appBaseEnvURL: string;
  apiBaseEnvURL: string;
  signalrBaseEnvURL: string;
}

interface EnvConfigs {
  local: EnvConfig;
  dev: EnvConfig;
  test: EnvConfig;
  production: EnvConfig;
}

const envConfigs: EnvConfigs = {
  local: {
    appBaseEnvURL: "",
    apiBaseEnvURL: "https://localhost:7254/api",
    signalrBaseEnvURL: "https://localhost:7254",
  },
  dev: {
    appBaseEnvURL: "",
    apiBaseEnvURL: "https://foramind-api-dev.azurewebsites.net/api",
    signalrBaseEnvURL: "https://icy-glacier-0e873bf03-dev.westeurope.3.azurestaticapps.net",
  },
  test: {
    appBaseEnvURL: "",
    apiBaseEnvURL: "https://foramind-api-test.azurewebsites.net/api",
    signalrBaseEnvURL: "https://icy-glacier-0e873bf03-test.westeurope.3.azurestaticapps.net",
  },
  production: {
    appBaseEnvURL: "",
    apiBaseEnvURL: "https://foramind-api.azurewebsites.net/api",
    signalrBaseEnvURL: "https://app.foramind.com",
  },
};

const currentEnv = import.meta.env.VITE_APP_ENV || 'local';
const env = envConfigs[currentEnv as keyof EnvConfigs];

export default env; 