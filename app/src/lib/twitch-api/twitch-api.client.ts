import { HttpClient, RawResponse } from "../http-client/http-client";

export interface TwitchApiClient {
  getUsers: () => Promise<RawResponse<{ data: TwitchUserResp[] } | TwitchError>>;
  getClips: (queryParams: TwitchClipQuery, cursor?: string) => Promise<RawResponse<{ data: TwitchClipResp[]; pagination?: TwitchPaginationResp } | TwitchError>>;
  getGames: (gameId: string, cursor?: string) => Promise<RawResponse<{ data: TwitchGameResp[]; pagination?: TwitchPaginationResp } | TwitchError>>;
  isTwitchError: <T>(body: T | TwitchError) => body is TwitchError;
}


export class TwitchApi implements TwitchApiClient {

  constructor(private httpClient: HttpClient, clientId: string) {
    this.httpClient.setCustomHeader('Client-Id', clientId);
  }

  getUsers = async () => {
    return this.httpClient.authorizedRequest<{ data: TwitchUserResp[] } | TwitchError>({
      method: 'get',
      url: '/users',
    });
  }

  getClips = async (queryParams: TwitchClipQuery, cursor?: string) => {
    if (cursor) {
      queryParams.after = cursor
    }

    return this.httpClient.authorizedRequest<{ data: TwitchClipResp[]; pagination?: TwitchPaginationResp } | TwitchError>({
      method: 'get',
      url: '/clips',
      qs: queryParams
    });
  }

  getGames = async (gameId: string, cursor?: string) => {
    const queryParams: TwitchGameQuery = { id: gameId };

    if (cursor) {
      queryParams.after = cursor
    }

    return this.httpClient.authorizedRequest<{ data: TwitchGameResp[]; pagination?: TwitchPaginationResp } | TwitchError>({
      method: 'get',
      url: '/games',
      qs: queryParams
    })
  }

  isTwitchError = <T>(body: T | TwitchError): body is TwitchError => {
    return (body as TwitchError).error !== undefined;
  }
}


interface TwitchError {
  error: string;
  status: number;
  message: string;
}


// https://dev.twitch.tv/docs/api/reference#get-clips
interface TwitchClipResp {
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

interface TwitchPaginationResp {
  cursor: string;
}

interface TwitchPaginationQuery {
  // forward pagination query
  after?: string;
}

interface TwitchClipQuery extends TwitchPaginationQuery {
  broadcaster_id?: string;
  id?: string;
}

// https://dev.twitch.tv/docs/api/reference#get-users
interface TwitchUserResp {
  // TODO these should be optional
  broadcaster_type: string;
  description: string;
  display_name: string;
  id: string;
  login: string;
  offline_image_url: string;
  profile_image_url: string;
  type: string;
  view_count: number;
  email: string;
  created_at: string;
}

interface TwitchGameResp {
  box_art_url?: string;
  id?: string;
  name?: string;
}

interface TwitchGameQuery extends TwitchPaginationQuery {
  id: string;
}



const clip = {
  id: "VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW",
  url: "https://clips.twitch.tv/VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW",
  embed_url: `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW`,
  broadcaster_id: "30094526",
  broadcaster_name: "h0pp",
  game_id: "493057",
  title: "I SAP ROGUE",
  thumbnail_url: "https://clips-media-assets2.twitch.tv/AT-cm%7C1300029032-preview-260x147.jpg",
  view_count: 20000
};
const clip1 = {
  id: "VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW",
  url: "https://clips.twitch.tv/VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW",
  embed_url: `https://clips.twitch.tv/embed?clip=VivaciousCautiousPineappleVoteYea-Uazb8iTEtX1F9RAW`,
  broadcaster_id: "30094526",
  broadcaster_name: "h0pp",
  game_id: "493057",
  title: "Hi there! Hi there! Hi there! Hi there! Hi there! Hi there! Hi there! Hi there! Hi there! Hi there! ",
  thumbnail_url: "https://clips-media-assets2.twitch.tv/AT-cm%7C1300029032-preview-260x147.jpg",
  view_count: 20000
};

const clipResp = {
  data: [clip1, clip, clip1, clip, clip1, clip1, clip, clip, clip, clip, clip, clip, clip, clip, clip]
};

const res = {
  statusCode: 200,
  statusOk: true,
  body: clipResp
};
