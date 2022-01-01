import { HttpClient } from "../http-client/http-client";

export class IpfsClient {

  constructor(private httpClient: HttpClient) { }

  getMetadata = async <V>(cid: string) => {
    return this.httpClient.requestRaw<V>({
      method: 'get',
      url: `/${cid}/metadata.json`
    });
  }
}
