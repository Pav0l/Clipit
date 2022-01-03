import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client"
import { ClipModel } from "./clip.model";
import { TwitchClipsErrors } from "./twitch-clips.errors";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";

const clipPatterns = [
  // /^([A-Za-z0-9]+(?:-[A-Za-z0-9_-]{16})?)$/,
  /^https:\/\/clips.twitch.tv\/([A-Za-z0-9]+(?:-[A-Za-z0-9_-]{16})?)(\?.+)?$/,
  /^https:\/\/(www.)?twitch.tv\/\w+\/clip\/([A-Za-z0-9]+(?:-[A-Za-z0-9_-]{16})?)(\?.+)?$/,
];


export class ClipController {

  constructor(
    private model: ClipModel,
    private snackbar: SnackbarClient,
    private twitchApi: TwitchApiClient,
  ) { }

  getBroadcasterClips = async (broadcasterId: string) => {
    this.model.meta.setLoading(true);
    // TODO implement pagination for clips
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
      const clip = data.body.data[0];
      if (clip) {
        this.model.appendClip(clip);
      }
    } else {
      // TODO SENTRY MONITOR
      this.model.meta.setError(TwitchClipsErrors.UNABLE_TO_GET_CLIPS);
      // TODO collect debugging data when setting user error, in case the "contact us" is used, so it 
      // autogenerates data for us
    }
    this.model.meta.setLoading(false);
  }

  validateClipUrl = (url: string) => {
    const clipId = this.getSlugFromUrl(url);

    if (!clipId) {
      this.snackbar.sendError(TwitchClipsErrors.INVALID_CLIP_URL);
      return "";
    }
    return clipId;
  }

  validateCreatorShare = (value: string): boolean => {
    if (value.includes(".")) return false;

    const num = Number(value);

    if (!Number.isInteger(num)) return false;

    if (num < 0 || num > 99) return false;

    return true;
  }

  private getSlugFromUrl = (url: string): string | undefined => {
    let match;
    for (const pattern of clipPatterns) {
      const matchArr = url.match(pattern);
      if (matchArr) {
        match = matchArr;
        break;
      }
    }

    const pathnameMatch = this.parseClipSlugFromPath(url);
    const confirmedMatch = match?.find((regexpMatch) => regexpMatch === pathnameMatch);

    return confirmedMatch;
  }

  private parseClipSlugFromPath = (url: string) => {
    let slug;
    try {
      const u = new URL(url);
      const paths = u.pathname.split("/");
      slug = paths[paths.length - 1];
    } catch (error) {
      // in case the input is not valid url
    }
    return slug;
  }

}

