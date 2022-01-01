import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { GameModel } from "./game.model";


export class GameController {

  constructor(private model: GameModel, private twitchApi: TwitchApiClient) { }

  getGames = async (gameId: string) => {
    this.model.meta.setLoading(true);
    const data = await this.twitchApi.getGames(gameId);

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.addGame(data.body.data[0]);
    } else {
      // Don't think it's necessary to display these errors
      // this.model.meta.setError('games error')
      console.log("Failed to get game name for id:", gameId);
    }
    this.model.meta.setLoading(false);
  }

  getGamesForClips = async (gameIds: string[]) => {
    // TODO throttle these, so we don't hit rate limits on users with many "variety" clips
    for (const gameId of gameIds) {
      // do not fetch gameIds for games we already know
      if (!this.model.games.has(gameId)) {
        await this.getGames(gameId);
      }
    }
  }

}

