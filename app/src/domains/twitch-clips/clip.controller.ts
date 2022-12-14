import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client";
import { ClipModel } from "./clip.model";
import { TwitchClipsErrors } from "./clip.errors";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { AppError } from "../../lib/errors/errors";

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
    private sentry: SentryClient
  ) {}

  getBroadcasterClips = async (broadcasterId: string) => {
    this.model.meta.setLoading(true);
    const data = await this.twitchApi.getClips({
      broadcaster_id: broadcasterId,
    });

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      this.model.appendMultipleClips(data.body.data);
    } else {
      this.model.meta.setError(new AppError({ msg: TwitchClipsErrors.UNABLE_TO_GET_CLIPS, type: "twitch-api-clip" }));

      this.sentry.captureEvent({
        message: "failed to get broadcaster clips from twitch",
        contexts: {
          response: {
            code: data.statusCode,
            body: JSON.stringify(data.body),
          },
          request: {
            bId: broadcasterId,
          },
        },
      });
    }
    this.model.meta.setLoading(false);
  };

  getClip = async (clipId: string) => {
    this.model.meta.setLoading(true);

    const data = await this.twitchApi.getClips({ id: clipId });

    if (data.statusOk && !this.twitchApi.isTwitchError(data.body)) {
      const clip = data.body.data[0];
      if (clip) {
        this.model.appendClip(clip);
      }
    } else {
      this.model.meta.setError(new AppError({ msg: TwitchClipsErrors.UNABLE_TO_GET_CLIPS, type: "twitch-api-clip" }));

      this.sentry.captureEvent({
        message: "failed to get clip from twitch",
        contexts: {
          response: {
            code: data.statusCode,
            body: JSON.stringify(data.body),
          },
          request: {
            clipId: clipId,
          },
        },
      });
    }
    this.model.meta.setLoading(false);
  };

  validateClipUrl = (url: string) => {
    const clipId = this.getSlugFromUrl(url);

    if (!clipId) {
      this.snackbar.sendError(TwitchClipsErrors.INVALID_CLIP_URL);
      return "";
    }
    return clipId;
  };

  validateCreatorShare = (value: string): boolean => {
    if (value.includes(".")) return false;

    const num = Number(value);

    if (!Number.isInteger(num)) return false;

    if (num < 0 || num > 99) return false;

    return true;
  };

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
  };

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
  };
}
