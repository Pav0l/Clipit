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


// TODO unify these with nft.model types and validate fields
interface Metadata {
  description: string;
  external_url: string;
  image: string;
  name: string;
  clipCid: string;
  clipUri: string;
  attributes: MetadataAttrs[];
}

interface MetadataAttrs {
  trait_type: "Game" | "Streamer";
  value: string;
}
