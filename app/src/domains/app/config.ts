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

export interface TwitchConfig {
  clientId: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}
