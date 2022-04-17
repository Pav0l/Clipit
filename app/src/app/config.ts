import { TwitchConfig } from "../lib/twitch-api/twitch.config";
import { FirebaseConfig } from "../lib/firebase/firebase.config";

// TODO split Configs per app mode (app / ext / demo)
export interface IConfig {
  tokenAddress: string;
  auctionAddress: string;
  clipItApiUrl: string;
  clipItClientUrl: string;
  clipItExtensionUrl: string;
  subgraphUrl: string;
  twitch: TwitchConfig;
  isDevelopment: boolean;
  sentryDsn: string;
  firebase: FirebaseConfig;
}
