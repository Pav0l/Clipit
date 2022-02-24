import { TwitchClient } from "./twitch-extension.client";

type ctxCb = (data: any, changed: ReadonlyArray<any>) => void;
type cb = (data: any) => void;

export class TwitchExtensionTestClient implements TwitchClient {
  contextListeners: ctxCb[] = [];
  authorizedListeners: cb[] = [];
  errorListeners: cb[] = [];

  log = (_msg: string) => {
    /* do nothing */
  };

  onContext(
    contextCallback: <T extends Partial<Twitch.ext.Context>>(context: T, changed: ReadonlyArray<keyof T>) => void
  ): void {
    this.contextListeners.push(contextCallback);
  }

  sendContext(msg: Partial<Twitch.ext.Context>, changed: ReadonlyArray<Partial<Twitch.ext.Context>>) {
    this.contextListeners.forEach((listener) => listener(msg, changed));
  }

  onAuthorized(authCallback: (auth: Twitch.ext.Authorized) => void): void {
    this.authorizedListeners.push(authCallback);
  }

  sendAuthorized(msg: Partial<Twitch.ext.Authorized>) {
    this.authorizedListeners.forEach(async (listener) => await listener(msg));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError(errorCallback: (errorValue: any) => void): void {
    this.errorListeners.push(errorCallback);
  }

  sendError(err: any) {
    this.authorizedListeners.forEach((listener) => listener(err));
  }
}
