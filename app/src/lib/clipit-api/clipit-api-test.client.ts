import { signerAddress } from "../../../tests/__fixtures__/ethereum";
import { clipCid, metadata, metadataCid } from "../../../tests/__fixtures__/metadata";

import { IClipItApiClient, ClipPayload, ClipItApiError } from "./clipit-api.client";

export class ClipItApiTestClient implements IClipItApiClient {
  isClipItApiError(body: ClipItApiError | unknown): body is ClipItApiError {
    return false;
  }

  storeClip = async <V>(clipId: string, _payload: ClipPayload) => {
    return {
      statusCode: 200,
      statusOk: true,
      body: {
        address: signerAddress,
        id: clipId,
        metadata: metadata,
        metadataCid: metadataCid,
        signature: {
          r: "0xbc12a9848f4013acef6cbad65ed735e651a8776d4de5ae9622b3b0d0bafe2c86",
          s: "0x69db1e666aa7632462ecae2b33ce53d745c2f708b3ec115dec68e9de4fbe48fd",
          v: 28,
        },
        mediadata: {
          tokenURI: `ipfs://${clipCid}`,
          metadataURI: `ipfs://${metadataCid}`,
          contentHash: Array.from(Array(32).keys()),
          metadataHash: Array.from(Array(32).keys()),
        },
      } as unknown as V,
    };
  };
}
