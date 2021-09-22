import { OpenSeaPort, Network } from "opensea-js";

// TODO configurable variables into config file
// CONTRACT -> into config
export const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


// IPFS -> into config
export const ipfsBaseUri = `http://127.0.0.1:8080/ipfs`;

// CLIPIT -> into config
export const clipItUri = "http://localhost:8000/v1"


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