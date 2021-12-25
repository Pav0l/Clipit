import { BytesLike } from "ethers";
import { HttpClient, RawResponse } from "../http-client/http-client";
// TODO this should not be here
import { getAccessToken, getTwitchOAuth2AuthorizeUrl } from "../twitch-oauth/twitch-oauth.public.api";

export class ClipItApiClient {

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


interface StoreClipError {
  error: string;
}

export function isStoreClipError(body: StoreClipError | unknown): body is StoreClipError {
  return (body as StoreClipError).error !== undefined;
}

interface StoreClipResp {
  metadataCid: string;
  id: string; // clip id
  address: string; //compare with current user address to double check if it didn't change in the meantime
  signature: Signature;
  metadata: Metadata;
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

interface Metadata {
  name?: string;
  description?: string;
  external_url?: string;
  clipUri?: string;
  clipCid?: string;
  attributes?: MetadataAttrs[];
}

interface MetadataAttrs {
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
  clipCid: `fang-bank-clip-cid-${Math.random()}`,
  description: 'Not sure what to put into this description',
  external_url: 'http://localhost:3000/clipId',
  clipUri: 'ipfs://bafkreifeae3yq4kquja275oo64djh5lp7whi7myjeccz4tn4n62xdg2zgu',
  name: 'clip title'
}
const localResponse: StoreClipResp = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  id: 'clip slug',
  metadata: mtdt,
  metadataCid: "bafybeiealga7wox5q4hzyhusi5izfbkpyvgydphyjwb76r75y5idkvlawa", // `waka-baka-metadata-cid-${Math.random()}`,
  signature: {
    r: "0xbc12a9848f4013acef6cbad65ed735e651a8776d4de5ae9622b3b0d0bafe2c86",
    s: "0x69db1e666aa7632462ecae2b33ce53d745c2f708b3ec115dec68e9de4fbe48fd",
    v: 28
  },
  mediadata: {
    tokenURI: 'ipfs://bafkreifeae3yq4kquja275oo64djh5lp7whi7myjeccz4tn4n62xdg2zgu',
    metadataURI: 'ipfs://bafybeiealga7wox5q4hzyhusi5izfbkpyvgydphyjwb76r75y5idkvlawa',
    contentHash: Array.from(Array(32).keys()),
    metadataHash: Array.from(Array(32).keys()),
  }
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
