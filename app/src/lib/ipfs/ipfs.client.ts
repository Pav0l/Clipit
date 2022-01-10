import { HttpClient, RawResponse } from "../http-client/http-client";

export interface IIpfsClient {
  getMetadata: <V>(cid: string) => Promise<RawResponse<V>>;
}

export class IpfsClient implements IIpfsClient {
  constructor(private httpClient: HttpClient) { }

  getMetadata = async <V>(cid: string) => {
    return this.httpClient.requestRaw<V>({
      method: 'get',
      url: `/${cid}/metadata.json`
    });
  }
}
