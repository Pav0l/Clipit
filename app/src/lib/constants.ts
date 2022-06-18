import type { TwitchClip } from "../domains/twitch-clips/clip.model";
import { generateRandomString } from "./strings/random";

// CLIPIT API
export const ebsTokenKey = "ebs_token_key";

// IPFS
export const pinataGatewayUri = "https://gateway.pinata.cloud/ipfs";
export const cloudFlareGatewayUri = "https://cloudflare-ipfs.com/ipfs";
export const ipfsIoGatewayUri = "https://ipfs.io/ipfs";

// TWITCH
export const twitchApiUri = "https://api.twitch.tv/helix";
export const twitchOAuthUri = "https://id.twitch.tv";
export const twitchScopes = "user:read:email";
export const twitchApiAccessTokenKey = "twitch_oauth_access_token";
export const twitchOAuthStateSecretKey = "twitch_oauth_state_secret";
// EXTENSION
export const extensionHelixTokenKey = "ext_helix_token_key";

// IP
export const ipApiUri = "https://ipapi.co";

// SUBGRAPH
export const CLIPS_PAGINATION_SKIP_VALUE = 20;
export const DEFAULT_SKIP_COUNT_VALUE = 0;

// APP
export enum AppRoute {
  ABOUT = "/about",
  TERMS = "/terms",
  NFTS = "/nfts",
  NFT = "/nfts/:tokenId",
  MARKETPLACE = "/marketplace",
  CLIPS = "/clips",
  CLIP = "/clips/:clipId",
  DEMO = "/demo",
  DEMO_CLIP = "/demo/:clipId",
  OAUTH_REDIRECT = "/oauth2/redirect",
  HOME = "/",
}

export const SESSION_ID = generateRandomString();

// fallback clip
export const demoClip: Pick<
  TwitchClip,
  "id" | "title" | "broadcasterName" | "createdAt" | "embedUrl" | "thumbnailUrl"
> = {
  id: "HungryTemperedMeerkatDoggo-UdQIrs87iEiQolN-",
  title: "streaming stuff",
  broadcasterName: "h0ppxi",
  createdAt: "March 12, 2022",
  thumbnailUrl: "https://clips-media-assets2.twitch.tv/44944309404-offset-56-preview-480x272.jpg",
  embedUrl: `https://clips.twitch.tv/embed?clip=HungryTemperedMeerkatDoggo-UdQIrs87iEiQolN-&parent=${window.location.hostname}&autoplay=true`,
};
