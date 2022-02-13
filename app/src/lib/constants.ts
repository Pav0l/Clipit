// IPFS
export const pinataGatewayUri = "https://gateway.pinata.cloud/ipfs";
export const cloudFlareGatewayUri = "https://cloudflare-ipfs.com/ipfs";
export const ipfsIoGatewayUri = "https://ipfs.io/ipfs";

// TWITCH
export const twitchApiUri = "https://api.twitch.tv/helix";
export const twitchOAuthUri = "https://id.twitch.tv";
export const twitchScopes = "user:read:email";

// SUBGRAPH
export const CLIPS_PAGINATION_SKIP_VALUE = 20;

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
  PRIVACY = "/privacy",
}
