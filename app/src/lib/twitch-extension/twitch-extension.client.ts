export interface TwitchClient {
  log: (msg: string) => void;
  onContext: (
    contextCallback: <T extends Partial<Twitch.ext.Context>>(context: T, changed: ReadonlyArray<keyof T>) => void
  ) => void;
  onAuthorized: (authCallback: (auth: Twitch.ext.Authorized) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (errorCallback: (errorValue: any) => void) => void;
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
