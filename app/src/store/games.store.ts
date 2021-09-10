import { makeAutoObservable } from "mobx"
import { MetaStore } from "./meta.store";


export class GamesStore {
  games: { [id: string]: string; } = {};
  meta: MetaStore;

  constructor(metaStore: MetaStore) {
    makeAutoObservable(this);
    this.meta = metaStore;
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

interface ITwitchGame {
  id?: string;
  name?: string;
}
