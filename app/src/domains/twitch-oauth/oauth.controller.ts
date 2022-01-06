import { OAuthModel } from "./oauth.model";
import { ILocalStorage } from "../../lib/local-storage";
import { twitchAccessToken, twitchSecretKey, twitchAppClientId, twitchOAuthUri, twitchScopes } from "../../lib/constants";
import { OauthQueryParams } from "./oauth.types";
import { TwitchOAuthApiClient } from "../../lib/twitch-oauth/twitch-oauth-api.client";


export class OAuthController {

  constructor(private model: OAuthModel, private oauthApi: TwitchOAuthApiClient, private storage: ILocalStorage) { }

  logout = async () => {
    const token = this.getAccessToken();
    if (!token) {
      location.reload();
      return;
    }

    await this.oauthApi.revokeAccessToken(token);

    this.storage.removeItem(twitchAccessToken);
    location.reload();
  }

  handleOAuth2Redirect = (url: URL) => {
    const { access_token, state } = this.parseDataFromUrl(url);

    if (access_token) {
      const { referrer, secret } = this.parseDataFromState(state);

      this.model.setReferrer(referrer);

      if (this.verifyStateSecret(secret)) {
        this.storeTokenAndRemoveSecret(access_token);
      } else {
        throw new Error("invalid oauth redirect secret");
      }
    }
  }

  checkTokenInStorage() {
    const token = this.getAccessToken();
    if (token) {
      this.model.setLoggedIn(true);
    }
  }

  getAccessToken = () => {
    return this.storage.getItem(twitchAccessToken);
  }

  getTwitchOAuth2AuthorizeUrl = () => {
    const url = new URL(`${twitchOAuthUri}/oauth2/authorize`);
    url.searchParams.append(OauthQueryParams.CLIENT_ID, twitchAppClientId);
    url.searchParams.append(OauthQueryParams.REDIRECT_URI, `${location.origin}/oauth2/redirect`);
    url.searchParams.append(OauthQueryParams.RESPONSE_TYPE, "token");
    url.searchParams.append(OauthQueryParams.SCOPE, twitchScopes);
    url.searchParams.append(OauthQueryParams.STATE, JSON.stringify({
      referrer: location.pathname,
      secret: this.generateSecretAndStore()
    }));
    return url.href;
  }

  private storeTokenAndRemoveSecret = (token: string) => {
    this.storage.setItem(twitchAccessToken, token);
    this.model.setLoggedIn(true);
    this.storage.removeItem(twitchSecretKey);
  }

  private verifyStateSecret = (fromUrl: string) => {
    if (!fromUrl) {
      return false;
    }
    const original = this.storage.getItem(twitchSecretKey);
    return original === fromUrl;
  }

  private parseDataFromUrl = (url: URL): { access_token: string; state: string; } => {
    if (url.hash.match(/#/g)?.length === 1) {
      // there is only one # in the string -> #access_token=<...>&scope=<...>&state=<...>&token_type=<...>"
      const queryParams = new URLSearchParams(url.hash.replace('#', '?'));
      return {
        access_token: queryParams.get(OauthQueryParams.ACCESS_TOKEN) ?? "",
        state: queryParams.get(OauthQueryParams.STATE) ?? "",
      }
    }

    return {
      access_token: "",
      state: "",
    }
  };

  private parseDataFromState = (state: string) => {
    let parsed = { referrer: '', secret: '' };
    try {
      parsed = JSON.parse(state);
    } catch (error) {
      console.error(error);
    } finally {
      return parsed;
    }
  }


  private generateRandomString = () => {
    const uintArr = new Uint16Array(10);
    window.crypto.getRandomValues(uintArr);
    return JSON.stringify(Array.from(uintArr));
  }

  private generateSecretAndStore = (): string => {
    const secret = this.generateRandomString();
    this.storage.setItem(twitchSecretKey, secret);
    return secret;
  }
}

