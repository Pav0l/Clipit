import { signerAddress } from "../../../tests/__fixtures__/ethereum";
import { clipCid, metadata, metadataCid } from "../../../tests/__fixtures__/metadata";
import { RawResponse } from "../http-client/http-client";

import { IClipItApiClient, ClipPayload, ClipItApiError, StoreClipResp } from "./clipit-api.client";

export class ClipItApiTestClient implements IClipItApiClient {
  private isResponseSuccessful = true;
  private respGenerator?: (...args: any) => any;

  isClipItApiError(body: ClipItApiError | unknown): body is ClipItApiError {
    return this.isResponseSuccessful ? false : true;
  }

  storeClip = async (clipId: string, _payload: ClipPayload): Promise<RawResponse<StoreClipResp | ClipItApiError>> => {
    return this.isResponseSuccessful
      ? this.createDefaultSuccessResp(clipId)
      : this.respGenerator
      ? this.respGenerator(clipId, _payload)
      : this.createDefaultFailResp();
  };

  mockResponse(isRespSuccess: boolean, respGenerator?: (args?: any) => any) {
    this.isResponseSuccessful = isRespSuccess;
    if (respGenerator) {
      this.respGenerator = respGenerator;
    }
  }

  private createDefaultSuccessResp(clipId: string) {
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
      },
    };
  }

  private createDefaultFailResp() {
    return {
      statusCode: 400,
      statusOk: false,
      body: {
        error: "Something went wrong",
      },
    };
  }
}
