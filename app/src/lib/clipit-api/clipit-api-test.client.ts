import { clipitApiResponse } from "../../../tests/__fixtures__/clipit-api-data";

import { IClipItApiClient, ClipPayload } from "./clipit-api.client";

export class ClipItApiTestClient implements IClipItApiClient {
  storeClip = async <V>(_clipId: string, _payload: ClipPayload) => {
    return {
      statusCode: 200,
      statusOk: true,
      body: clipitApiResponse as unknown as V
    }
  }
}
