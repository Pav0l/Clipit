import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client";
import { UserModel } from "./user.model";
import { TwitchUserError } from "./twitch-user.errors";
import { SentryClient } from "../../lib/sentry/sentry.client";

export class UserController {
  constructor(private model: UserModel, private twitchApi: TwitchApiClient, private sentry: SentryClient) {}

  getUser = async () => {
    this.model.meta.setLoading(true);
    const data = await this.twitchApi.getUsers();

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.setUser(data.body.data[0]);
    } else {
      this.model.meta.setError(TwitchUserError.GENERIC);

      this.sentry.captureEvent({
        message: "failed to get user from twitch",
        contexts: {
          response: {
            code: data.statusCode,
            body: JSON.stringify(data.body),
          },
        },
      });
    }

    this.model.meta.setLoading(false);
  };
}
