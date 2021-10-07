// TODO consider this import - maybe it should be here in ctrl (find out when wrinting tests)
import { getSlugFromUrl } from "./twitch-clips.utils";
import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { ClipsStore } from "./clips.store";
import { TwitchClipsErrors } from "./twitch-clips.errors";
import { SnackbarClient } from "../snackbar/snackbar.client";


export class ClipController {

  constructor(
    private model: ClipsStore,
    private snackbar: SnackbarClient,
    private twitchApi: TwitchApiClient,
  ) { }

  getClips = async (broadcasterId: string) => {
    this.model.meta.setLoading(true);
    const data = await this.twitchApi.getClips({ broadcaster_id: broadcasterId });

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.appendMultipleClips(data.body.data);
    } else {
      // TODO SENTRY MONITOR
      this.model.meta.setError(TwitchClipsErrors.UNABLE_TO_GET_CLIPS);
      // TODO collect debugging data when setting user error, in case the "contact us" is used, so it 
      // autogenerates data for us
    }
    this.model.meta.setLoading(false);
  }

  getClip = async (clipId: string) => {
    this.model.meta.setLoading(true);

    const data = await this.twitchApi.getClips({ id: clipId });

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.appendClip(data.body.data[0]);
    } else {
      // TODO SENTRY MONITOR
      this.model.meta.setError(TwitchClipsErrors.UNABLE_TO_GET_CLIPS);
      // TODO collect debugging data when setting user error, in case the "contact us" is used, so it 
      // autogenerates data for us
    }
    this.model.meta.setLoading(false);
  }

  validateClipUrl = (url: string) => {
    const clipId = getSlugFromUrl(url);

    if (!clipId) {
      this.snackbar.sendError(TwitchClipsErrors.INVALID_CLIP_URL);
      return "";
    }
    return clipId;
  }

}

