import { AxiosRequestConfig, AxiosResponse } from "axios";

import { localStorage } from "../local-storage";
import { twitchAppClientId, twitchAccessToken } from "../constants";
import { getTwitchOAuth2AuthorizeUrl, getAccessToken } from "../twitch-oauth/twitch-oauth.utils";


export function requestFulfilledInterceptor(config: AxiosRequestConfig) {
  const token = getAccessToken();
  if (!token) {
    location.href = getTwitchOAuth2AuthorizeUrl();
  }
  config.headers['Authorization'] = `Bearer ${token}`;
  config.headers['Client-Id'] = twitchAppClientId;
  return config;
}

export function responseFulfilledInterceptor(response: AxiosResponse) {
  // TODO prevent infinite loading loop!
  if (response.status === 401) {
    // token is missing or invalid, so just remove it
    localStorage.removeItem(twitchAccessToken);
    location.href = getTwitchOAuth2AuthorizeUrl();
  }
  return response;
}
