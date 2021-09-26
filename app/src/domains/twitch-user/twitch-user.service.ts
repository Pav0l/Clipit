import { twitchApiClient, isTwitchError } from "../../lib/twitch-api/twitch-api.client"
import { UserStore } from "../../store/user.store"
import { TwitchUserError } from "./twitch-user.errors";


export class TwitchUserService {

  constructor(private userStore: UserStore) { }

  getUser = async () => {
    this.userStore.meta.setLoading(true);
    const data = await twitchApiClient.getUsers();

    if (data.statusOk && !isTwitchError(data.body)) {
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

