import { BytesLike } from "ethers";
import { ClipPayload, IClipItApiClient } from "../clipit-api/clipit-api.client";
import { IIpfsClient } from "../ipfs/ipfs.client";

export class OffChainStorage {
  constructor(private writer: IClipItApiClient, private reader: IIpfsClient) {}

  async saveClipAndCreateMetadata(clipId: string, payload: ClipPayload) {
    return this.writer.storeClip<StoreClipResp | StoreClipError>(clipId, payload);
  }

  async getMetadata(cid: string) {
    return await this.reader.getMetadata<IpfsMetadata | null>(cid);
  }

  isStoreClipError(body: StoreClipError | unknown): body is StoreClipError {
    return (body as StoreClipError).error !== undefined;
  }
}

interface StoreClipError {
  error: string;
}

interface IpfsMetadata {
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
