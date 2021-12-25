import { HttpClient } from "../http-client/http-client";

export class IpfsClient {

  constructor(private httpClient: HttpClient) { }

  getMetadata = async (cid: string) => {
    const resp = await this.httpClient.requestRaw<Metadata>({
      method: 'get',
      url: `/${cid}/metadata.json`
    });

    // TODO error handling
    return resp.body;
  }
}

interface Metadata {
  description?: string;
  external_url?: string;
  image?: string;
  name?: string;
  cid?: string;
  attributes?: MetadataAttrs[];
}

interface MetadataAttrs {
  trait_type?: "Game" | "Streamer";
  value?: string;
}
