import { TwitchConfig } from "./twitch.config";
import { extensionHelixTokenKey, twitchApiAccessTokenKey } from "../constants";
import { HttpClient, RawResponse } from "../http-client/http-client";
import { ILocalStorage } from "../local-storage/local-storage.client";

export interface TwitchApiClient {
  getUsers: (qs?: { id: string }) => Promise<RawResponse<{ data: TwitchUserResp[] } | TwitchError>>;
  getClips: (
    queryParams: TwitchClipQuery,
    cursor?: string
  ) => Promise<RawResponse<{ data: TwitchClipResp[]; pagination?: TwitchPaginationResp } | TwitchError>>;
  getGames: (
    gameId: string,
    cursor?: string
  ) => Promise<RawResponse<{ data: TwitchGameResp[]; pagination?: TwitchPaginationResp } | TwitchError>>;
  isTwitchError: <T>(body: T | TwitchError) => body is TwitchError;
}

interface TwitchApiConfig extends TwitchConfig {
  authScheme: "Extension" | "Bearer";
  withDefaultToken?: boolean;
}

export class TwitchApi implements TwitchApiClient {
  constructor(private httpClient: HttpClient, private storage: ILocalStorage, private config: TwitchApiConfig) {
    this.httpClient.setCustomHeader("Client-Id", this.config.clientId);
  }

  getUsers = async (qs?: { id: string }) => {
    return this.makeAuthorizedRequest<{ data: TwitchUserResp[] } | TwitchError>({
      method: "get",
      url: "/users",
      qs,
    });
  };

  getClips = async (queryParams: TwitchClipQuery, cursor?: string) => {
    if (cursor) {
      queryParams.after = cursor;
    }
    if (!queryParams.first || queryParams.first > "100") {
      // default number of clips to fetch
      queryParams.first = "50";
    }

    return this.makeAuthorizedRequest<{ data: TwitchClipResp[]; pagination?: TwitchPaginationResp } | TwitchError>({
      method: "get",
      url: "/clips",
      qs: queryParams,
    });
  };

  getGames = async (gameId: string, cursor?: string) => {
    const queryParams: TwitchGameQuery = { id: gameId };

    if (cursor) {
      queryParams.after = cursor;
    }

    return this.makeAuthorizedRequest<{ data: TwitchGameResp[]; pagination?: TwitchPaginationResp } | TwitchError>({
      method: "get",
      url: "/games",
      qs: queryParams,
    });
  };

  isTwitchError = <T>(body: T | TwitchError): body is TwitchError => {
    return (body as TwitchError).error !== undefined;
  };

  private makeAuthorizedRequest<T>(params: { method: "get" | "post" | "put" | "delete"; url: string; qs?: unknown }) {
    const authorizationHeaderValue = `${this.config.authScheme} ${this.getToken()}`;
    const requestParams = { ...params, headers: { Authorization: authorizationHeaderValue } };

    return this.httpClient.authorizedRequest<T>(requestParams);
  }

  private getToken(): string | null {
    const key = this.config.authScheme === "Extension" ? extensionHelixTokenKey : twitchApiAccessTokenKey;
    // use twitch app access token if scheme is Bearer and there is no twitch oauth token in LS
    let token = this.storage.getItem(key);
    if (token) {
      return token;
    }

    if (this.config.authScheme === "Bearer") {
      token = this.config.withDefaultToken ? this.config.appAccessToken : null;
    }

    return token;
  }
}

export interface TwitchError {
  error: string;
  status: number;
  message: string;
}

// https://dev.twitch.tv/docs/api/reference#get-clips
export interface TwitchClipResp {
  id?: string;
  url?: string;
  embed_url?: string;
  broadcaster_id?: string;
  broadcaster_name?: string;
  creator_id?: string;
  creator_name?: string;
  video_id?: string;
  game_id?: string;
  language?: string;
  title?: string;
  view_count?: number;
  created_at?: string;
  thumbnail_url?: string;
  duration?: number;
}

export interface TwitchPaginationResp {
  cursor: string;
}

export interface TwitchPaginationQuery {
  // forward pagination query
  after?: string;
}

export interface TwitchClipQuery extends TwitchPaginationQuery {
  broadcaster_id?: string;
  id?: string;
  /**
   * Maximum number of objects to return. Maximum: 100. Default: 20.
   */
  first?: string;
}

// https://dev.twitch.tv/docs/api/reference#get-users
export interface TwitchUserResp {
  broadcaster_type?: string;
  description?: string;
  display_name?: string;
  id?: string;
  login?: string;
  offline_image_url?: string;
  profile_image_url?: string;
  type?: string;
  view_count?: number;
  email?: string;
  created_at?: string;
}

export interface TwitchGameResp {
  box_art_url?: string;
  id?: string;
  name?: string;
}

export interface TwitchGameQuery extends TwitchPaginationQuery {
  id: string;
}
