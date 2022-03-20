import { metadata } from "../../../tests/__fixtures__/metadata";

import { IIpfsClient, IpfsMetadata } from "./ipfs.client";

export class IpfsTestClient implements IIpfsClient {
  isIpfsMetadata(body: IpfsMetadata | unknown): body is IpfsMetadata {
    return true;
  }

  getMetadata = async <V>(_cid: string) => {
    return {
      statusOk: true,
      statusCode: 200,
      body: metadata as unknown as V,
    };
  };
}
