import { OpenSeaPort, Network } from "opensea-js";


// CONTRACT -> into config
export const contractAddress = "0x6eA040eE61c7afC835b860923F08827bC98114D7";


// IPFS -> into config
export const ipfsBaseUri = `http://127.0.0.1:8080/ipfs`;

// CLIPIT -> into config
export const clipItUri = "http://127.0.0.1:8000"


// OPENSEA -> networkName into config
// TODO
// export const seaport = new OpenSeaPort((window as any).ethereum, {
//   networkName: Network.Rinkeby
// });
export const openSeaCollectionUrl = "https://testnets.opensea.io/collection"; // -> into config

// TWITCH
export const twitchAppClientId = "0japyt7fgxgarzd4oadqk8bb2orf0f";
export const twitchAccessToken = "twitch_auth_access_token";
export const twitchSecretKey = "twitch_auth_state_secret";

// APP
export enum AppRoute {
  ABOUT = "/about",
  MARKETPLACE = "/marketplace",
  CLIPS = "/clips",
  CLIP = "/clips/:clipId",
  OAUTH_REDIRECT = "/oauth2/redirect",
  HOME = "/",
}