import axios, { AxiosInstance } from 'axios'
import { twitchAccessToken } from '../constants';
import { ILocalStorage } from '../local-storage/local-storage.client';

export interface RawResponse<T> {
  statusCode: number;
  statusOk: boolean;
  body: T;
}

export class HttpClient {
  private client: AxiosInstance;


  constructor(private ls: ILocalStorage, baseURL?: string) {
    this.client = axios.create({
      baseURL
    });
  }

  setCustomHeader(key: string, value: string) {
    if (!this.client.defaults.headers) {
      this.client.defaults.headers = {};
    }
    this.client.defaults.headers[key] = value;
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

  async authorizedRequest<T>(params: { method: 'get' | 'post' | 'put' | 'delete', url: string, qs?: any, body?: any, headers?: any, timeout?: number }): Promise<RawResponse<T>> {
    const token = this.ls.getItem(twitchAccessToken);
    if (!token) {
      return {
        statusCode: 401,
        statusOk: false,
        body: null as unknown as T
      }
    }

    if (!params.headers) {
      params.headers = {};
    }

    params.headers['Authorization'] = `Bearer ${token}`;

    return this.requestRaw<T>(params);
  }

}
