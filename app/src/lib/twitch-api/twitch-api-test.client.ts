import { twitchGame, twitchUser, twitchClip } from "../../../tests/__fixtures__/twitch-api-data";

import { RawResponse } from "../http-client/http-client";
import { TwitchApiClient, TwitchClipQuery, TwitchClipResp, TwitchError, TwitchGameResp, TwitchPaginationResp, TwitchUserResp } from "./twitch-api.client";


export class TwitchTestApi implements TwitchApiClient {
  getUsers = async (): Promise<RawResponse<{ data: TwitchUserResp[] } | TwitchError>> => {
    return {
      statusOk: true,
      statusCode: 200,
      body: {
        data: [twitchUser]
      }
    };
  }

  getClips = async (_queryParams: TwitchClipQuery, _cursor?: string): Promise<RawResponse<{ data: TwitchClipResp[]; pagination?: TwitchPaginationResp } | TwitchError>> => {
    return {
      statusCode: 200,
      statusOk: true,
      body: {
        data: [twitchClip]
      }
    };
  }

  getGames = async (_gameId: string, _cursor?: string): Promise<RawResponse<{ data: TwitchGameResp[]; pagination?: TwitchPaginationResp } | TwitchError>> => {
    return {
      statusOk: true,
      statusCode: 200,
      body: {
        data: [twitchGame]
      }
    }
  }

  isTwitchError = <T>(body: T | TwitchError): body is TwitchError => {
    return (body as TwitchError).error !== undefined;
  }
}
