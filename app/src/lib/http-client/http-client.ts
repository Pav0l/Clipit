import axios, { AxiosInstance } from "axios";

export interface RawResponse<T> {
  statusCode: number;
  statusOk: boolean;
  body: T;
}

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
    });
  }

  setCustomHeader(key: string, value: string) {
    if (!this.client.defaults.headers) {
      this.client.defaults.headers = {};
    }
    this.client.defaults.headers[key] = value;
  }

  async requestRaw<T>(params: {
    method: "get" | "post" | "put" | "delete";
    url: string;
    qs?: unknown;
    body?: unknown;
    headers?: Record<string, unknown>;
    timeout?: number;
  }): Promise<RawResponse<T>> {
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
        },
      });

      return {
        statusCode: response.status,
        statusOk: response.status >= 200 && response.status < 300,
        body: response.data,
      };
    } catch (error) {
      console.log("raw request error", error);

      return {
        statusCode: 0,
        statusOk: false,
        body: null as any,
      };
    }
  }

  async authorizedRequest<T>(params: {
    method: "get" | "post" | "put" | "delete";
    url: string;
    qs?: unknown;
    body?: unknown;
    headers?: Record<string, unknown>;
    timeout?: number;
  }): Promise<RawResponse<T>> {
    if (!params.headers || !params.headers["Authorization"]) {
      return {
        statusCode: 401,
        statusOk: false,
        body: null as unknown as T,
      };
    }

    return this.requestRaw<T>(params);
  }
}
