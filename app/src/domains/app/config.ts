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
}

export interface TwitchConfig {
  clientId: string;
}
