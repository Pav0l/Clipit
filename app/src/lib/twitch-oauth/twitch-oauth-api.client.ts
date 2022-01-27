import { HttpClient } from "../http-client/http-client";
import { twitchAppClientId } from "../constants";

export interface IOauthApiClient {
  revokeAccessToken: (token: string) => Promise<void>;
}

export class TwitchOAuthApiClient implements IOauthApiClient {
  constructor(private httpClient: HttpClient) {}

  async revokeAccessToken(token: string) {
    try {
      await this.httpClient.requestRaw({
        method: "post",
        url: "/oauth2/revoke",
        body: `client_id=${twitchAppClientId}&token=${token}`,
      });
    } catch (error) {
      // do nothing for now
      console.log("failed to revoke token", error);
    }
  }
}
