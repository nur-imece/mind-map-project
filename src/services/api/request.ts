import axios, {
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType,
} from "axios";
import env from '../../config/env';

declare global {
  interface Window {
    API_BASE_URL: string;
  }
}

const baseURL = env.apiBaseEnvURL;
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

const handleError = (error: any): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An error occurred';
  }
};

axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Try to get token with either name
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
  (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
  return config;
});

export const setupInterceptors = (logout: any) => {
  axios.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
};

class request {
  static async exportGet(
    url: string,
    delimiter?: string
  ): Promise<{ data?: any; response?: AxiosResponse; error?: string }> {
    const urlWithDelimiter = delimiter
      ? `${url}?delimiter=${encodeURIComponent(delimiter)}`
      : url;

    try {
      const response = await axios({
        url: urlWithDelimiter,
        method: "GET",
        responseType: "blob",
      });
      return { data: response.data, response };
    } catch (error) {
      return { error: handleError(error) };
    }
  }

  static async get(
    url = "",
    params = {},
    headers?: AxiosRequestHeaders | Record<string, string>,
    responseType: ResponseType = "json"
  ): Promise<{ data?: any; response?: AxiosResponse; error?: string }> {
    try {
      const config: AxiosRequestConfig = { params, headers, responseType };
      const response = await axios.get(url, config);
      return { data: response.data, response };
    } catch (error) {
      return { error: handleError(error) };
    }
  }

  static async post(
    url = "",
    body = {},
    params = {},
    headers?: AxiosRequestHeaders | Record<string, string>,
    responseType: ResponseType = "json"
  ): Promise<{ data?: any; response?: AxiosResponse; error?: string }> {
    try {
      const config: AxiosRequestConfig = { params, headers, responseType };
      const response = await axios.post(url, body, config);
      return { data: response.data, response };
    } catch (error) {
      return { error: handleError(error) };
    }
  }

  static async put(
    url = "",
    body = {},
    headers?: AxiosRequestHeaders | Record<string, string>,
  ): Promise<{ data?: any; response?: AxiosResponse; error?: string }> {
    try {
      const response = await axios.put(url, body, { headers });
      return { data: response.data, response };
    } catch (error) {
      return { error: handleError(error) };
    }
  }

  static async patch(
    url = "",
    body = {},
    headers?: AxiosRequestHeaders | Record<string, string>,
  ): Promise<{ data?: any; response?: AxiosResponse; error?: string }> {
    try {
      const response = await axios.patch(url, body, { headers });
      return { data: response.data, response };
    } catch (error) {
      return { error: handleError(error) };
    }
  }

  static async delete(
    url = "",
    data = {},
    headers?: AxiosRequestHeaders | Record<string, string>,
  ): Promise<{ data?: any; response?: AxiosResponse; error?: string }> {
    try {
      const response = await axios.delete(url, { data, headers });
      return { data: response.data, response };
    } catch (error) {
      return { error: handleError(error) };
    }
  }

  static setParams({ params }: { params: Record<string, any> }) {
    return Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
  }
}

export default request;
