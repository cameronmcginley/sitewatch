import axios, { AxiosError, AxiosRequestConfig } from "axios";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export async function handleApiRequest<T>(
  requestFn: () => Promise<ApiResponse<T>>,
  errorMessage: string
): Promise<T> {
  try {
    const response = await requestFn();
    console.log(`${errorMessage} successful:`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response?.status === 404) {
        console.log(`${errorMessage}: No data found`);
        return null as T;
      }
      console.error(
        `${errorMessage}:`,
        axiosError.response?.data?.message || axiosError.message
      );
      throw new Error(
        `${errorMessage}: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    } else {
      console.error(`${errorMessage}:`, error);
      throw new Error(`${errorMessage}: An unexpected error occurred`);
    }
  }
}

export function createApiClient(baseURL: string) {
  const client = axios.create({ baseURL });

  return {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
      handleApiRequest<T>(() => client.get(url, config), `GET ${url}`),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      handleApiRequest<T>(() => client.post(url, data, config), `POST ${url}`),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
      handleApiRequest<T>(() => client.put(url, data, config), `PUT ${url}`),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
      handleApiRequest<T>(() => client.delete(url, config), `DELETE ${url}`),
  };
}
