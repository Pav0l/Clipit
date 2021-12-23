import { makeAutoObservable } from "mobx"
import { MetaModel } from "../app/meta.model";


export class GameModel {
  games: { [id: string]: string; } = {};
  meta: MetaModel;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  addGame(game: ITwitchGame) {
    const g = new TwitchGame(game);
    this.games[g.id] = g.name;
  }

  getGame(id: string): string | undefined {
    return this.games[id];
  }
}

export class TwitchGame {
  id: string;
  name: string;

  constructor(game: ITwitchGame) {
    makeAutoObservable(this);

    this.id = game.id ?? "";
    this.name = game.name ?? "";
  }
}

// https://dev.twitch.tv/docs/api/reference#get-games
interface ITwitchGame {
  id?: string;
  name?: string;
  box_art_url?: string;
}
