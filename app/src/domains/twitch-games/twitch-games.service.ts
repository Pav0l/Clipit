import { isTwitchError, twitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { GamesStore } from "../../store/games.store";


export class TwitchGameService {

  constructor(private gamesStore: GamesStore) { }

  getGames = async (gameId: string) => {
    this.gamesStore.meta.setLoading(true);
    const data = await twitchApiClient.getGames(gameId);

    if (data.statusOk && !isTwitchError(data.body)) {
      this.gamesStore.addGame(data.body.data[0]);
    } else {
      // Don't think it's necessary to display these errors
      // this.gamesStore.meta.setError('games error')
      console.log("Failed to get game name for id:", gameId);
    }
    this.gamesStore.meta.setLoading(false);
  }

  getGamesForClips = async (gameIds: string[]) => {
    for (const gameId of gameIds) {
      // do not fetch gameIds for games we already know
      if (!this.gamesStore.games[gameId]) {
        await this.getGames(gameId);
      }
    }
  }

}

