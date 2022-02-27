import { OAuthModel } from "./oauth.model";
import { ILocalStorage } from "../../lib/local-storage/local-storage.client";
import { twitchApiAccessTokenKey, twitchOAuthStateSecretKey, twitchOAuthUri, twitchScopes } from "../../lib/constants";
import { OAuthErrors, OauthQueryParams } from "./oauth.types";
import { IOauthApiClient } from "../../lib/twitch-oauth/twitch-oauth-api.client";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { AppError } from "../../lib/errors/errors";

export class OAuthController {
  constructor(
    private model: OAuthModel,
    private oauthApi: IOauthApiClient,
    private storage: ILocalStorage,
    private sentry: SentryClient,
    private twitchClientId: string
  ) {}

  logout = async () => {
    const token = this.getAccessToken();
    if (!token) {
      location.reload();
      return;
    }

    await this.oauthApi.revokeAccessToken(token);

    this.storage.removeItem(twitchApiAccessTokenKey);
    location.reload();
  };

  handleOAuth2Redirect = (url: URL) => {
    const { access_token, state } = this.parseDataFromUrl(url);

    if (access_token) {
      const { referrer, secret } = this.parseDataFromState(state);

      if (this.verifyStateSecret(secret)) {
        this.model.setReferrer(referrer);
        this.storeTokenAndRemoveSecret(access_token);
      } else {
        this.model.meta.setError(new AppError({ msg: OAuthErrors.INVALID_SECRET, type: "oauth" }));

        this.sentry.captureEvent({
          message: "invalid oauth2 redirect state secret",
          contexts: {
            data: {
              invalidS: secret,
              referrer,
              state,
            },
          },
        });
      }
    }
  };

  checkTokenInStorage() {
    const token = this.getAccessToken();
    if (token) {
      this.model.setLoggedIn(true);
    }
  }

  getAccessToken = () => {
    return this.storage.getItem(twitchApiAccessTokenKey);
  };

  getTwitchOAuth2AuthorizeUrl = () => {
    const url = new URL(`${twitchOAuthUri}/oauth2/authorize`);
    url.searchParams.append(OauthQueryParams.CLIENT_ID, this.twitchClientId);
    url.searchParams.append(OauthQueryParams.REDIRECT_URI, `${location.origin}/oauth2/redirect`);
    url.searchParams.append(OauthQueryParams.RESPONSE_TYPE, "token");
    url.searchParams.append(OauthQueryParams.SCOPE, twitchScopes);
    url.searchParams.append(
      OauthQueryParams.STATE,
      JSON.stringify({
        referrer: location.pathname,
        secret: this.generateSecretAndStore(),
      })
    );
    return url.href;
  };

  private storeTokenAndRemoveSecret = (token: string) => {
    this.storage.setItem(twitchApiAccessTokenKey, token);
    this.model.setLoggedIn(true);
    this.storage.removeItem(twitchOAuthStateSecretKey);
  };

  private verifyStateSecret = (fromUrl: string) => {
    if (!fromUrl) {
      return false;
    }
    const original = this.storage.getItem(twitchOAuthStateSecretKey);
    return original === fromUrl;
  };

  private parseDataFromUrl = (url: URL): { access_token: string; state: string } => {
    if (url.hash.match(/#/g)?.length === 1) {
      // there is only one # in the string -> #access_token=<...>&scope=<...>&state=<...>&token_type=<...>"
      const queryParams = new URLSearchParams(url.hash.replace("#", "?"));
      return {
        access_token: queryParams.get(OauthQueryParams.ACCESS_TOKEN) ?? "",
        state: queryParams.get(OauthQueryParams.STATE) ?? "",
      };
    }

    return {
      access_token: "",
      state: "",
    };
  };

  private parseDataFromState = (state: string) => {
    let parsed = { referrer: "", secret: "" };
    try {
      parsed = JSON.parse(state);
    } catch (error) {
      console.error(error);
    }

    return parsed;
  };

  private generateRandomString = () => {
    const uintArr = new Uint16Array(10);
    window.crypto.getRandomValues(uintArr);
    return JSON.stringify(Array.from(uintArr));
  };

  private generateSecretAndStore = (): string => {
    const secret = this.generateRandomString();
    this.storage.setItem(twitchOAuthStateSecretKey, secret);
    return secret;
  };
}
