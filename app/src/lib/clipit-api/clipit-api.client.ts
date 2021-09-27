import { HttpClient, RawResponse } from "../http-client";
import { clipItUri } from "../constants";
import { getAccessToken, getTwitchOAuth2AuthorizeUrl } from "../twitch-oauth/twitch-oauth.utils";

class ClipItApiClient {

  constructor(private httpClient: HttpClient) { }

  storeClip = async (clipId: string, streamerAddress: string) => {
    const token = getAccessToken();
    if (!token) {
      location.href = getTwitchOAuth2AuthorizeUrl();
    }

    const resp = await this.httpClient.requestRaw<StoreClipResp | StoreClipError>({
      method: 'post',
      url: `/clips/${clipId}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        address: streamerAddress
      }
    });

    console.log("[LOG]:store-clip:", resp);

    return resp;
  }
}


export const clipItApiClient = new ClipItApiClient(new HttpClient(clipItUri));

interface StoreClipError {
  error: string;
}

export function isStoreClipError(body: StoreClipError | unknown): body is StoreClipError {
  return (body as StoreClipError).error !== undefined;
}


export interface StoreClipResp {
  metadataCid?: string;
  id?: string; // clip id
  address?: string; //compare with current user address to double check if it didn't change in the meantime
  transactionHash?: string; // -> so that we can track num of generated blocks after our tx was included?
  metadata?: Metadata;
}

interface Metadata {
  description?: string;
  external_url?: string;
  image?: string;
  name?: string;
  cid?: string;
  attributes?: MetadataAttrs[];
}

export interface MetadataAttrs {
  trait_type?: "Game" | "Streamer";
  value?: string;
}

// mock data
const gameAttr: MetadataAttrs = {
  trait_type: "Game",
  value: "World of Warcraft"
}
const streamerAttr: MetadataAttrs = {
  trait_type: "Streamer",
  value: "HappySumber"
}
const attrs = [gameAttr, streamerAttr];

const mtdt: Metadata = {
  attributes: attrs,
  cid: `fang-bank-clip-cid-${Math.random()}`,
  description: 'Not sure what to put into this description',
  external_url: 'http://localhost:3000/clipId',
  image: 'ipfs://bafkreifeae3yq4kquja275oo64djh5lp7whi7myjeccz4tn4n62xdg2zgu',
  name: 'clip title'
}
const localResponse: StoreClipResp = {
  address: '0x8fF5d1D8A2983a476baAA36C3edcf7Ee13ACB481',
  metadata: mtdt,
  metadataCid: `waka-baka-metadata-cid-${Math.random()}`,
  transactionHash: '0x76aef399139997b8540df5b5b4488657c74e727ec4bc36e25d84cb71b368520b'
}

function responsePromise(): Promise<RawResponse<StoreClipResp>> {
  return new Promise(res => {
    setTimeout(() => {
      res({
        statusCode: 200,
        statusOk: true,
        body: localResponse
      })
    }, 3000)
  })
}
