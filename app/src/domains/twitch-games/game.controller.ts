import { isTwitchError, TwitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { GamesStore } from "../../store/games.store";


export class GameController {

  constructor(private model: GamesStore, private twitchApi: TwitchApiClient) { }

  getGames = async (gameId: string) => {
    this.model.meta.setLoading(true);
    const data = await this.twitchApi.getGames(gameId);

    if (data.statusOk && !isTwitchError(data.body)) {
      this.model.addGame(data.body.data[0]);
    } else {
      // Don't think it's necessary to display these errors
      // this.model.meta.setError('games error')
      console.log("Failed to get game name for id:", gameId);
    }
    this.model.meta.setLoading(false);
  }

  getGamesForClips = async (gameIds: string[]) => {
    for (const gameId of gameIds) {
      // do not fetch gameIds for games we already know
      if (!this.model.games[gameId]) {
        await this.getGames(gameId);
      }
    }
  }

}

