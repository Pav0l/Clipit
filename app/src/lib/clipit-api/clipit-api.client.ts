import { HttpClient } from "../http-client/http-client";

export class ClipItApiClient {

  constructor(private httpClient: HttpClient) { }

  storeClip = async <V>(clipId: string, payload: ClipPayload) => {
    return this.httpClient.authorizedRequest<V>({
      method: 'post',
      url: `/clips/${clipId}`,
      body: payload
    });
  }
}

export interface ClipPayload {
  address: string;
  clipTitle: string;
  clipDescription?: string;
}
