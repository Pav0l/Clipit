import { getSlugFromUrl } from "./twitch-clips.utils";
import { twitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { ClipsStore } from "../../store/clips.store";
import { TwitchClipsErrors } from "./twitch-clips.errors";
import { snackbarClient } from "../../modules/snackbar/snackbar.client";


export class TwitchClipsService {

  constructor(private clipsStore: ClipsStore) { }

  getClips = async (broadcasterId: string) => {
    this.clipsStore.meta.setLoading(true);
    const data = await twitchApiClient.getClips({ broadcaster_id: broadcasterId });

    if (data.statusOk) {
      this.clipsStore.appendMultipleClips(data.body.data);
    } else {
      this.clipsStore.meta.setError(TwitchClipsErrors.UNABLE_TO_GET_CLIPS)
    }
    this.clipsStore.meta.setLoading(false);
  }

  getClip = async (clipId: string) => {
    this.clipsStore.meta.setLoading(true);

    const data = await twitchApiClient.getClips({ id: clipId });

    if (data.statusOk) {
      this.clipsStore.appendClip(data.body.data[0]);
    } else {
      this.clipsStore.meta.setError(TwitchClipsErrors.UNABLE_TO_GET_CLIPS)
    }
    this.clipsStore.meta.setLoading(false);
  }

  validateClipUrl = (url: string) => {
    const clipId = getSlugFromUrl(url);

    if (!clipId) {
      // TODO import via constructor together with twitchApiClient?
      snackbarClient.sendError(TwitchClipsErrors.INVALID_CLIP_URL);
      return "";
    }
    return clipId;
  }

}

