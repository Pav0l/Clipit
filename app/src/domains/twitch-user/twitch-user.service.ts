import { twitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { TwitchUserStore } from "../../store/twitch-user.store"
import { TwitchUserError } from "./twitch-user.errors";


export class TwitchUserService {

  constructor(private userStore: TwitchUserStore) { }

  getUser = async () => {
    this.userStore.meta.setLoading(true);
    const data = await twitchApiClient.getUsers();

    if (data.statusOk) {
      this.userStore.setUser(data.body.data[0]);
    } else {
      this.userStore.meta.setError(TwitchUserError.GENERIC)
    }
    this.userStore.meta.setLoading(false);
  }

}

