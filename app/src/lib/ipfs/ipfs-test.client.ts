import { metadata } from "../../../tests/__fixtures__/metadata";

import { IIpfsClient } from "./ipfs.client";

export class IpfsTestClient implements IIpfsClient {
  getMetadata = async <V>(_cid: string) => {
    return {
      statusOk: true,
      statusCode: 200,
      body: metadata as unknown as V
    };
  }
}
