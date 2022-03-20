import { BytesLike } from "ethers";
import { ebsTokenKey, twitchApiAccessTokenKey } from "../constants";
import { HttpClient, RawResponse } from "../http-client/http-client";
import { IpfsMetadata } from "../ipfs/ipfs.client";
import { ILocalStorage } from "../local-storage/local-storage.client";

export interface IClipItApiClient {
  storeClip: (clipId: string, payload: ClipPayload) => Promise<RawResponse<StoreClipResp | ClipItApiError>>;
  isClipItApiError: (body: ClipItApiError | unknown) => body is ClipItApiError;
}

export class ClipItApiClient implements IClipItApiClient {
  constructor(
    private httpClient: HttpClient,
    private storage: ILocalStorage,
    private authScheme: "Ebs" | "Bearer" = "Bearer"
  ) {}

  storeClip = async (clipId: string, payload: ClipPayload) => {
    return this.makeAuthorizedRequest<StoreClipResp | ClipItApiError>({
      method: "post",
      url: `/clips/${clipId}`,
      body: payload,
    });
  };

  isClipItApiError(body: ClipItApiError | unknown): body is ClipItApiError {
    return (body as ClipItApiError).error !== undefined;
  }

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

export interface ClipItApiError {
  error: string;
}

interface StoreClipResp {
  metadataCid: string;
  id: string; // clip id
  address: string; //compare with current user address to double check if it didn't change in the meantime
  signature: Signature;
  metadata: IpfsMetadata;
  mediadata: MediaData;
}

interface MediaData {
  tokenURI: string;
  metadataURI: string;
  contentHash: BytesLike;
  metadataHash: BytesLike;
}

interface Signature {
  r: string;
  s: string;
  v: number;
}
