import { BytesLike } from "ethers";
import { ClipPayload, IClipItApiClient } from "../clipit-api/clipit-api.client";
import { RawResponse } from "../http-client/http-client";
import { IIpfsClient } from "../ipfs/ipfs.client";

export class OffChainStorage {
  constructor(private writer: IClipItApiClient, private reader: IIpfsClient) { }

  async saveClipAndCreateMetadata(clipId: string, payload: ClipPayload) {
    return this.writer.storeClip<StoreClipResp | StoreClipError>(clipId, payload);
  }

  async getMetadata(cid: string) {
    return await this.reader.getMetadata<Metadata | null>(cid);
  }

  isStoreClipError(body: StoreClipError | unknown): body is StoreClipError {
    return (body as StoreClipError).error !== undefined;
  }
}

interface StoreClipError {
  error: string;
}

interface Metadata {
  description: string;
  external_url: string;
  name: string;
  clipCid: string;
  clipUri: string;
  clipId: string;
  thumbnailUri: string;
  attributes: MetadataAttrs[];
}

interface MetadataAttrs {
  trait_type: "Game" | "Streamer";
  value: string;
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
  name: 'clip title',
  clipId: 'clip slug',
  thumbnailUri: 'https://clips-media-assets2.twitch.tv/AT-cm%7CYrU2AHCG6B2w-n4X9vhEpA-preview-480x272.jpg'
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
