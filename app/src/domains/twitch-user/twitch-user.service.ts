import { twitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { UserStore } from "../../store/user.store"
import { TwitchUserError } from "./twitch-user.errors";


export class TwitchUserService {

  constructor(private userStore: UserStore) { }

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

