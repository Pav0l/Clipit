import axios, { AxiosInstance } from 'axios'

export interface RawResponse<T> {
  statusCode: number;
  statusOk: boolean;
  body: T;
}

export class HttpClient {
  private client: AxiosInstance;


  constructor(baseURL?: string, interceptors?: { request?: { onFulfilled?: (value: any) => any | Promise<any>, onRejected?: (error: any) => any }; response?: { onFulfilled?: (value: any) => any | Promise<any>, onRejected?: (error: any) => any } }) {
    this.client = axios.create({
      baseURL
    });

    if (interceptors) {
      if (interceptors.request) {
        this.client.interceptors.request.use(interceptors.request.onFulfilled, interceptors.request.onRejected);
      }
      if (interceptors.response) {
        this.client.interceptors.response.use(interceptors.response.onFulfilled, interceptors.response.onRejected);
      }
    }
  }

  async requestRaw<T>(params: { method: 'get' | 'post' | 'put' | 'delete', url: string, qs?: any, body?: any, headers?: any, timeout?: number }): Promise<RawResponse<T>> {
    try {
      const response = await this.client.request<T>({
        method: params.method,
        url: params.url,
        params: params.qs,
        data: params.body,
        headers: { ...params.headers },
        timeout: params.timeout,
        validateStatus: function () {
          return true; // never throw error based on status code
        }
      });

      return {
        statusCode: response.status,
        statusOk: response.status >= 200 && response.status < 300,
        body: response.data
      };
    } catch (error) {
      console.log(error);

      return {
        statusCode: 0,
        statusOk: false,
        body: null as any
      }
    }
  }
}

export const httpClient = new HttpClient();
