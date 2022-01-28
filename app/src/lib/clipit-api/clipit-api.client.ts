import { HttpClient, RawResponse } from "../http-client/http-client";

export interface IClipItApiClient {
  storeClip: <V>(clipId: string, payload: ClipPayload) => Promise<RawResponse<V>>;
}

export class ClipItApiClient implements IClipItApiClient {
  constructor(private httpClient: HttpClient, private tokenKey: string) {}

  storeClip = async <V>(clipId: string, payload: ClipPayload) => {
    return this.httpClient.authorizedRequest<V>(
      {
        method: "post",
        url: `/clips/${clipId}`,
        body: payload,
      },
      this.tokenKey
    );
  };
}

export interface ClipPayload {
  address: string;
  clipTitle: string;
  clipDescription?: string;
}
