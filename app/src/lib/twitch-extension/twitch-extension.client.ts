import { TwitchExtensionQueryParams } from "./interfaces";

export interface TwitchClient {
  log: (msg: string) => void;
  onContext: (
    contextCallback: <T extends Partial<Twitch.ext.Context>>(context: T, changed: ReadonlyArray<keyof T>) => void
  ) => void;
  onAuthorized: (authCallback: (auth: Twitch.ext.Authorized) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (errorCallback: (errorValue: any) => void) => void;
}

// https://dev.twitch.tv/docs/extensions/reference#client-query-parameters
export function parseTwitchQueryParams(): TwitchExtensionQueryParams {
  const searchParams = new URL(location.href).searchParams;

  const mode = searchParams.get("mode");

  return {
    anchor: searchParams.get("anchor"),
    language: searchParams.get("language"),
    locale: searchParams.get("locale"),
    mode: mode === "config" ? mode : mode === "dashboard" ? mode : mode === "viewer" ? mode : null,
    platform: searchParams.get("platform"),
    popout: searchParams.get("popout"),
    state: searchParams.get("state"),
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
