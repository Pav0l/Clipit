import { HttpClient } from "../http-client/http-client";

export interface IOauthApiClient {
  revokeAccessToken: (token: string) => Promise<void>;
}

export class TwitchOAuthApiClient implements IOauthApiClient {
  constructor(private httpClient: HttpClient, private clientId: string) {}

  async revokeAccessToken(token: string) {
    try {
      await this.httpClient.requestRaw({
        method: "post",
        url: "/oauth2/revoke",
        body: `client_id=${this.clientId}&token=${token}`,
      });
    } catch (error) {
      // do nothing for now
      console.log("failed to revoke token", error);
    }
  }
}
