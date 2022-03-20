import { HttpClient, RawResponse } from "../http-client/http-client";

export interface IIpfsClient {
  getMetadata: (cid: string) => Promise<RawResponse<IpfsMetadata | Record<string, unknown>>>;
  isIpfsMetadata: (body: IpfsMetadata | unknown) => body is IpfsMetadata;
}

export interface IpfsMetadata {
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

export class IpfsClient implements IIpfsClient {
  constructor(private httpClient: HttpClient) {}

  getMetadata = async (cid: string) => {
    return this.httpClient.requestRaw<IpfsMetadata | Record<string, unknown>>({
      method: "get",
      url: `/${cid}/metadata.json`,
    });
  };

  isIpfsMetadata(body: IpfsMetadata | unknown): body is IpfsMetadata {
    return (
      (body as IpfsMetadata).description !== undefined &&
      (body as IpfsMetadata).external_url !== undefined &&
      (body as IpfsMetadata).name !== undefined &&
      (body as IpfsMetadata).clipCid !== undefined &&
      (body as IpfsMetadata).clipUri !== undefined &&
      (body as IpfsMetadata).clipId !== undefined &&
      (body as IpfsMetadata).thumbnailUri !== undefined &&
      (body as IpfsMetadata).attributes !== undefined
    );
  }
}
