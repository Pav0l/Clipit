
// TODO configurable variables into config file
// CONTRACT -> into config
export const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// rinkeby v2: 0x4620F21E45274404dF937C17880d4320E108De4b
// rinkeby v1: 0x6eA040eE61c7afC835b860923F08827bC98114D7


// IPFS -> into config
export const ipfsBaseUri = `http://127.0.0.1:8080/ipfs`;

// CLIPIT -> into config
export const clipItUri = "http://localhost:8000/v1"

// IPFS
export const pinataGatewayUri = "https://gateway.pinata.cloud/ipfs";
export const cloudFlareGatewayUri = "https://cloudflare-ipfs.com/ipfs";
export const ipfsIoGatewayUri = "https://ipfs.io/ipfs";


// OPENSEA -> networkName into config
// TODO
// export const seaport = new OpenSeaPort((window as any).ethereum, {
//   networkName: Network.Rinkeby
// });
export const openSeaCollectionUrl = "https://testnets.opensea.io/collection/clipit?embed=true"; // -> into config

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
  NFTS = "/nfts",
  NFT = "/nfts/:tokenId",
  OAUTH_REDIRECT = "/oauth2/redirect",
  HOME = "/",
}