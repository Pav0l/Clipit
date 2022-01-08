export enum TwitchClipsErrors {
  INVALID_CLIP_URL = "Invalid clip URL. Supported clip URL formats are https://www.twitch.tv/ChewieMelodies/clip/AwkwardHelplessSalamanderSwiftRage or https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage",
  UNABLE_TO_GET_CLIPS = "There was an error fetching your clips from Twitch.",
  CLIP_DOES_NOT_EXIST = "It seems a clip with this id does not exist.",
  CLIP_DOES_NOT_BELONG_TO_USER = "Can not mint a Clip, which does not belong to you.",
}
