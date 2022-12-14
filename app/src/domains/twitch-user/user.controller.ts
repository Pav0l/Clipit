import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client";
import { UserModel } from "./user.model";
import { TwitchUserError } from "./twitch-user.errors";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { AppError } from "../../lib/errors/errors";

export class UserController {
  constructor(private model: UserModel, private twitchApi: TwitchApiClient, private sentry: SentryClient) {}

  getUser = async (userId?: string) => {
    this.model.meta.setLoading(true);

    let query;
    if (userId) {
      query = { id: userId };
    }

    const data = await this.twitchApi.getUsers(query);

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.setUser(data.body.data[0]);
    } else {
      this.model.meta.setError(new AppError({ msg: TwitchUserError.GENERIC, type: "twitch-api-user" }));

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
