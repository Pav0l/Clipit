import { OAuthModel } from "./oauth.model";
import { ILocalStorage } from "../local-storage";
import { twitchAccessToken, twitchSecretKey, twitchAppClientId } from "../constants";
import { OauthQueryParams } from "./oauth.types";


export class OAuthController {

  constructor(private model: OAuthModel, private storage: ILocalStorage) { }

  logout = () => {
    this.storage.removeItem(twitchAccessToken);
    // location via props?
    location.reload();
  }

  storeTokenAndRemoveSecret = (token: string) => {
    this.storage.setItem(twitchAccessToken, token);
    this.model.setLoggedIn(true);
    this.storage.removeItem(twitchSecretKey);
  }

  verifyStateSecret = (fromUrl: string) => {
    if (!fromUrl) {
      return false;
    }
    const original = localStorage.getItem(twitchSecretKey);
    return original === fromUrl;
  }

  parseDataFromUrl = (url: URL): { access_token: string; state: string; } => {
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

  parseDataFromState = (state: string) => {
    let parsed = { referrer: '', secret: '' };
    try {
      parsed = JSON.parse(state);
    } catch (error) {
      console.error(error);
    } finally {
      return parsed;
    }
  }

  checkTokenInStorage() {
    const token = this.storage.getItem(twitchAccessToken);
    if (token) {
      this.model.setLoggedIn(true);
    }
  }

  getTwitchOAuth2AuthorizeUrl = () => {
    const url = new URL("https://id.twitch.tv/oauth2/authorize");
    url.searchParams.append(OauthQueryParams.CLIENT_ID, twitchAppClientId);
    url.searchParams.append(OauthQueryParams.REDIRECT_URI, `${location.origin}/oauth2/redirect`);
    url.searchParams.append(OauthQueryParams.RESPONSE_TYPE, "token");
    url.searchParams.append(OauthQueryParams.SCOPE, "clips:edit user:read:email user:read:follows user:read:subscriptions");
    url.searchParams.append(OauthQueryParams.STATE, JSON.stringify({
      referrer: location.pathname,
      secret: this.generateSecretAndStore()
    }));
    return url.href;
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

