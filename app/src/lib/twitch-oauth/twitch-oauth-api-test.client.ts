import { IOauthApiClient } from "./twitch-oauth-api.client";


export class TwitchOAuthApiTestClient implements IOauthApiClient {
  async revokeAccessToken(_token: string) {
    // just be cool
  }
}
