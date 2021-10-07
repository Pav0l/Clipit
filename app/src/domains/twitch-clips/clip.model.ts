import { makeAutoObservable } from "mobx"
import { MetaModel } from "../app/meta.model";


export class ClipModel {
  clips: TwitchClip[] = [];
  meta: MetaModel;

  constructor(metaModel: MetaModel) {
    makeAutoObservable(this);
    this.meta = metaModel;
  }

  appendMultipleClips(clips: ITwitchClip[]) {
    for (const clip of clips) {
      this.appendClip(clip);
    }
  }

  appendClip(clip: ITwitchClip) {
    this.clips.push(new TwitchClip(clip));
  }

  get lastClip(): TwitchClip | undefined {
    return this.clips[this.clips.length - 1];
  }

  getClip(clipId: string): TwitchClip | undefined {
    return this.clips.filter(clip => clip.id === clipId)[0];
  }

  get gameIds(): string[] {
    const gameIds = new Set<string>();

    for (const clip of this.clips) {
      gameIds.add(clip.gameId);
    }
    return Array.from(gameIds);
  }

  getUsersClips = (userId: string): TwitchClip[] => {
    return this.clips.filter(clip => clip.broadcasterId === userId);
  }
}

export class TwitchClip {
  id: string;
  url: string;
  broadcasterId: string;
  broadcasterName: string;
  gameId: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  viewCount: number;

  constructor(clip: ITwitchClip) {
    makeAutoObservable(this);

    this.id = clip.id ?? "";
    this.url = clip.url ?? "";
    this.broadcasterId = clip.broadcaster_id ?? "";
    this.broadcasterName = clip.broadcaster_name ?? "";
    this.gameId = clip.game_id ?? "";
    this.title = clip.title ?? "";
    this.thumbnailUrl = clip.thumbnail_url ?? "";
    this.embedUrl = `${clip.embed_url}&parent=${location.hostname}` ?? "";
    this.viewCount = clip.view_count ?? 0;
  }
}

interface ITwitchClip {
  id?: string;
  url?: string;
  embed_url?: string;
  broadcaster_id?: string;
  broadcaster_name?: string;
  game_id?: string;
  title?: string;
  thumbnail_url?: string;
  view_count?: number;
}
