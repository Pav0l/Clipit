import { localStorage } from "../local-storage";
import { twitchAccessToken, twitchSecretKey, twitchAppClientId, twitchOAuthUri, twitchScopes } from "../constants";
import { OauthQueryParams } from "./oauth.types";

// TODO this file should not exist. oauth.controller/UI should be the interface which external libs/user can interact
// with Twitch OAuth domain

export const getTwitchOAuth2AuthorizeUrl = () => {
  const url = new URL(`${twitchOAuthUri}/oauth2/authorize`);
  url.searchParams.append(OauthQueryParams.CLIENT_ID, twitchAppClientId);
  // TODO replace `location.origin` with app URL from config to prevent malicious redirects
  url.searchParams.append(OauthQueryParams.REDIRECT_URI, `${location.origin}/oauth2/redirect`);
  url.searchParams.append(OauthQueryParams.RESPONSE_TYPE, "token");
  url.searchParams.append(OauthQueryParams.SCOPE, twitchScopes);
  url.searchParams.append(OauthQueryParams.STATE, JSON.stringify({
    referrer: location.pathname,
    secret: generateSecretAndStore()
  }));
  return url.href;
}

const generateRandomString = () => {
  const uintArr = new Uint16Array(10);
  window.crypto.getRandomValues(uintArr);
  return JSON.stringify(Array.from(uintArr));
}

const generateSecretAndStore = (): string => {
  const secret = generateRandomString();
  localStorage.setItem(twitchSecretKey, secret);
  return secret;
}

export const getAccessToken = () => {
  return localStorage.getItem(twitchAccessToken);
}
