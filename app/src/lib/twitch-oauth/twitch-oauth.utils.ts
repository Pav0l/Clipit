import { localStorage } from "../local-storage";
import { twitchAccessToken, twitchSecretKey, twitchAppClientId } from "../constants";

export const parseDataFromUrl = (url: URL): { access_token: string; state: string; } => {
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

export const parseDataFromState = (state: string) => {
  let parsed = { referrer: '', secret: '' };
  try {
    parsed = JSON.parse(state);
  } catch (error) {
    console.error(error);
  } finally {
    return parsed;
  }
}

const generateRandomString = () => {
  const uintArr = new Uint16Array(10);
  window.crypto.getRandomValues(uintArr);
  return JSON.stringify(Array.from(uintArr));
}

enum OauthQueryParams {
  ACCESS_TOKEN = "access_token",
  STATE = "state",
  REDIRECT_URI = "redirect_uri",
  CLIENT_ID = "client_id",
  RESPONSE_TYPE = "response_type",
  SCOPE = "scope"
}

export const storeTokenAndRemoveSecret = (token: string) => {
  localStorage.setItem(twitchAccessToken, token);
  localStorage.removeItem(twitchSecretKey);
}

export const verifyStateSecret = (fromUrl: string) => {
  if (!fromUrl) {
    return false;
  }
  const original = localStorage.getItem(twitchSecretKey);
  return original === fromUrl;
}

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

const generateSecretAndStore = (): string => {
  const secret = generateRandomString();
  localStorage.setItem(twitchSecretKey, secret);
  return secret;
}

export const getAccessToken = () => {
  return localStorage.getItem(twitchAccessToken);
}
