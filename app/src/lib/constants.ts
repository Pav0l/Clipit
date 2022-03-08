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

// SUBGRAPH
export const CLIPS_PAGINATION_SKIP_VALUE = 20;
export const DEFAULT_SKIP_COUNT_VALUE = 0;

// APP
export enum AppRoute {
  ABOUT = "/about",
  MARKETPLACE = "/marketplace",
  CLIPS = "/clips",
  CLIP = "/clips/:clipId",
  NFTS = "/nfts",
  NFT = "/nfts/:tokenId",
  OAUTH_REDIRECT = "/oauth2/redirect",
  HOME = "/",
  TERMS = "/terms",
}
