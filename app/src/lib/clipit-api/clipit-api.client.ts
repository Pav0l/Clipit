import { HttpClient, RawResponse } from "../http-client";
import { clipItUri } from "../constants";
import { getAccessToken, getTwitchOAuth2AuthorizeUrl } from "../twitch-oauth/twitch-oauth.utils";

class ClipItApiClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(clipItUri);
  }

  storeClip = async (clipId: string, streamerAddress: string) => {
    const token = getAccessToken();
    if (!token) {
      location.href = getTwitchOAuth2AuthorizeUrl();
    }

    return responsePromise();

    // TODO!
    const resp = await this.httpClient.requestRaw<StoreClipResp>({
      method: 'post',
      url: '/clip/store',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        clipId, address: streamerAddress
      }
    });

    console.log(resp);

    return resp;
  }



}


export const clipItApiClient = new ClipItApiClient();


export interface StoreClipResp {
  metadataCid?: string;
  address?: string; //compare with current user address to double check if it didn't change in the meantime
  transactionHash?: string; // -> so that we can track num of generated blocks after our tx was included?
  metadata?: MetadataResp;
}

interface MetadataResp {
  description?: string;
  external_url?: string;
  image?: string;
  name?: string;
  cid?: string;
  attributes?: MetadataResponseAttrs[];
}

export interface MetadataResponseAttrs {
  trait_type?: "Game" | "Streamer";
  value?: string;
}

// mock data
const gameAttr: MetadataResponseAttrs = {
  trait_type: "Game",
  value: "World of Warcraft"
}
const streamerAttr: MetadataResponseAttrs = {
  trait_type: "Streamer",
  value: "HappySumber"
}
const attrs = [gameAttr, streamerAttr];

const mtdt: MetadataResp = {
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
