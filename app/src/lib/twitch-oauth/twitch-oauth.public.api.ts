import { localStorage } from "../local-storage";
import { twitchAccessToken, twitchSecretKey, twitchAppClientId } from "../constants";
import { OauthQueryParams } from "./oauth.types";

// TODO this file should not exist. oauth.controller/UI should be the interface which external libs/user can interact
// with Twitch OAuth domain

export const getTwitchOAuth2AuthorizeUrl = () => {
  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  url.searchParams.append(OauthQueryParams.CLIENT_ID, twitchAppClientId);
  url.searchParams.append(OauthQueryParams.REDIRECT_URI, `${location.origin}/oauth2/redirect`);
  url.searchParams.append(OauthQueryParams.RESPONSE_TYPE, "token");
  url.searchParams.append(OauthQueryParams.SCOPE, "clips:edit user:read:email user:read:follows user:read:subscriptions");
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
