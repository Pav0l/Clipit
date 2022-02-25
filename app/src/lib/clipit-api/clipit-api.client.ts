import { ebsTokenKey, twitchApiAccessTokenKey } from "../constants";
import { HttpClient, RawResponse } from "../http-client/http-client";
import { ILocalStorage } from "../local-storage/local-storage.client";

export interface IClipItApiClient {
  storeClip: <V>(clipId: string, payload: ClipPayload) => Promise<RawResponse<V>>;
}

export class ClipItApiClient implements IClipItApiClient {
  constructor(
    private httpClient: HttpClient,
    private storage: ILocalStorage,
    private authScheme: "Ebs" | "Bearer" = "Bearer"
  ) {}

  storeClip = async <V>(clipId: string, payload: ClipPayload) => {
    return this.makeAuthorizedRequest<V>({
      method: "post",
      url: `/clips/${clipId}`,
      body: payload,
    });
  };

  private makeAuthorizedRequest<T>(params: { method: "get" | "post" | "put" | "delete"; url: string; body?: unknown }) {
    const key = this.authScheme === "Ebs" ? ebsTokenKey : twitchApiAccessTokenKey;
    const token = this.storage.getItem(key);

    const authorizationHeaderValue = `${this.authScheme} ${token}`;
    const requestParams = { ...params, headers: { Authorization: authorizationHeaderValue } };

    return this.httpClient.authorizedRequest<T>(requestParams);
  }
}

export interface ClipPayload {
  address: string;
  clipTitle: string;
  clipDescription?: string;
}

export enum ClipItApiErrors {
  NOT_BROADCASTER = "user not clip broadcaster",
  // TODO this should be two separate enums: clipit-api-RESPONSE-errors and clipit-DISPLAY-errors
  DISPLAY_NOT_BROADCASTER = "Only broadcaster is able to mint the clip",
}
