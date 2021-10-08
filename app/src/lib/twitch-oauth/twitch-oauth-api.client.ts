import { HttpClient } from "../http-client";
import { twitchAppClientId } from "../constants";


class TwitchOAuthApiClient {

  constructor(private httpClient: HttpClient) { }

  async validateAccessToken(token: string) {
    if (!token) {
      return false;
    }
    const resp = await this.httpClient.requestRaw({
      method: 'get',
      url: '/oauth2/validate',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(resp);
  }

  async revokeAccessToken(token: string) {
    const resp = await this.httpClient.requestRaw({
      method: 'post',
      url: '/oauth2/revoke',
      body: `client_id=${twitchAppClientId}&token=${token}`
    });

    console.log(resp);
  }
}

/**
 * unused
 */
export const twitchOauthClient = new TwitchOAuthApiClient(new HttpClient("https://id.twitch.tv"));
