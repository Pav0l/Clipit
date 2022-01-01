import { HttpClient, RawResponse } from "../http-client/http-client";

export class ClipItApiClient {

  constructor(private httpClient: HttpClient) { }

  storeClip = async <V>(clipId: string, streamerAddress: string) => {
    return this.httpClient.authorizedRequest<V>({
      method: 'post',
      url: `/clips/${clipId}`,
      body: {
        address: streamerAddress
      }
    });
  }
}
