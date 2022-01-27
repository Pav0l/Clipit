import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { UserModel } from "./user.model"
import { TwitchUserError } from "./twitch-user.errors";


export class UserController {

  constructor(private model: UserModel, private twitchApi: TwitchApiClient) { }

  getUser = async () => {
    this.model.meta.setLoading(true);
    const data = await this.twitchApi.getUsers();

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.setUser(data.body.data[0]);
    } else {
      // SENTRY MONITOR
      this.model.meta.setError(TwitchUserError.GENERIC);
    }

    this.model.meta.setLoading(false);
  }
}

