export enum TwitchClipsErrors {
  INVALID_CLIP_URL = "Invalid clip URL. Supported clip URL formats are 'https://www.twitch.tv/ChewieMelodies/clip/AwkwardHelplessSalamanderSwiftRage' or 'https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage'",
  UNABLE_TO_GET_CLIPS = "We failed to fetch your clips from Twitch. Please try again or contact us.",
  CLIP_DOES_NOT_EXIST = "It seems clip with this id does not exist.",
}
