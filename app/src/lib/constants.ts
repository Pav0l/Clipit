
// TODO configurable variables into config file
// CONTRACT -> into config
export const clipitContractAddress = "0xBacff2b8579F5BBd6db50f6f3390b0a3a71d7434";
// localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// rinkeby: 0xBacff2b8579F5BBd6db50f6f3390b0a3a71d7434

export const auctionContractAddress = "0xcCeB966Ea756C8316ebB69da9800Efa869d08907";


// IPFS -> into config
export const ipfsBaseUri = `http://127.0.0.1:8080/ipfs`;

// CLIPIT -> into config
export const clipItUri = "http://localhost:8000/v2"

// IPFS
export const pinataGatewayUri = "https://gateway.pinata.cloud/ipfs";
export const cloudFlareGatewayUri = "https://cloudflare-ipfs.com/ipfs";
export const ipfsIoGatewayUri = "https://ipfs.io/ipfs";

// TWITCH
export const twitchAppClientId = "0japyt7fgxgarzd4oadqk8bb2orf0f";
export const twitchApiUri = "https://api.twitch.tv/helix";
export const twitchAccessToken = "twitch_auth_access_token";
export const twitchSecretKey = "twitch_auth_state_secret";
export const twitchOAuthUri = "https://id.twitch.tv";
export const twitchScopes = "user:read:email user:read:follows user:read:subscriptions"; // clips:edit 

// SUBGRAPH
export const subgraphUrl = "https://api.thegraph.com/subgraphs/name/h0ppx/two";
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
}