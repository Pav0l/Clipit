export interface TwitchClient {
  log: (msg: string) => void;
  onContext: (
    contextCallback: <T extends Partial<Twitch.ext.Context>>(context: T, changed: ReadonlyArray<keyof T>) => void
  ) => void;
  onAuthorized: (authCallback: (auth: Twitch.ext.Authorized) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (errorCallback: (errorValue: any) => void) => void;
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

export class TwitchExtensionClient implements TwitchClient {
  constructor(private twitch: typeof Twitch.ext) {}

  log = (msg: string) => {
    this.twitch.rig.log(msg);
  };

  onContext(
    contextCallback: <T extends Partial<Twitch.ext.Context>>(context: T, changed: ReadonlyArray<keyof T>) => void
  ): void {
    this.twitch.onContext(contextCallback);
  }

  onAuthorized(authCallback: (auth: Twitch.ext.Authorized) => void): void {
    this.twitch.onAuthorized(authCallback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError(errorCallback: (errorValue: any) => void): void {
    this.twitch.onError(errorCallback);
  }
}
