import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { UserStore } from "../../store/user.store"
import { TwitchUserError } from "./twitch-user.errors";


export class UserController {

  constructor(private userStore: UserStore, private twitchApi: TwitchApiClient) { }

  getUser = async () => {
    this.userStore.meta.setLoading(true);
    const data = await this.twitchApi.getUsers();

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.userStore.setUser(data.body.data[0]);
    } else {
      // TODO SENTRY MONITOR
      this.userStore.meta.setError(TwitchUserError.GENERIC);

      // TODO collect debugging data when setting user error, in case the "contact us" is used, so it 
      // autogenerates data for us
    }

    this.userStore.meta.setLoading(false);
  }
}

