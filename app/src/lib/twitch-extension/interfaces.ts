// https://dev.twitch.tv/docs/extensions/reference#client-query-parameters
export interface TwitchExtensionQueryParams {
  anchor: string | null;
  language: string | null;
  locale: string | null;
  mode: "config" | "dashboard" | "viewer" | null;
  platform: string | null;
  popout: string | null;
  state: string | null;
}

// https://dev.twitch.tv/docs/extensions/reference#jwt-schema
export interface TwitchJWT {
  exp: number;
  opaque_user_id: string;
  user_id?: string;
  channel_id: string;
  role: "broadcaster" | "moderator" | "viewer" | "external";
  is_unlinked: boolean;
  pubsub_perms: {
    listen: string[];
    send: string[];
  };
}
