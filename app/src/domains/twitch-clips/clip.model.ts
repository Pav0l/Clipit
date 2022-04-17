import { makeAutoObservable } from "mobx";
import { MetaModel } from "../meta/meta.model";

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
    return this.clips.filter((clip) => clip.id === clipId)[0];
  }

  get gameIds(): string[] {
    const gameIds = new Set<string>();

    for (const clip of this.clips) {
      gameIds.add(clip.gameId);
    }
    return Array.from(gameIds);
  }

  getUsersClips = (userId: string): TwitchClip[] => {
    return this.clips.filter((clip) => clip.broadcasterId === userId);
  };

  createDefaultClipDescription = (streamerName: string, gameName?: string): string => {
    return `${streamerName} playing ${gameName ?? "game"}`;
  };
}

export class TwitchClip {
  id: string;
  broadcasterId: string;
  broadcasterName: string;
  gameId: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  createdAt: string;

  constructor(clip: ITwitchClip) {
    makeAutoObservable(this);

    this.id = clip.id ?? "";
    this.broadcasterId = clip.broadcaster_id ?? "";
    this.broadcasterName = clip.broadcaster_name ?? "";
    this.gameId = clip.game_id ?? "";
    this.title = clip.title ?? "";
    this.thumbnailUrl = clip.thumbnail_url ?? "";
    this.embedUrl = this.handleEmbedUrl(clip.embed_url);
    this.createdAt = clip.created_at ?? "";
  }

  private handleEmbedUrl(embedUrl: string | undefined): string {
    if (!embedUrl) {
      return "";
    }

    const url = new URL(embedUrl);
    url.searchParams.append("parent", window.location.hostname);

    return url.href;
  }
}

interface ITwitchClip {
  id?: string;
  embed_url?: string;
  broadcaster_id?: string;
  broadcaster_name?: string;
  game_id?: string;
  title?: string;
  thumbnail_url?: string;
  created_at?: string;
}
