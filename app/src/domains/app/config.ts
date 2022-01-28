export interface IConfig {
  tokenAddress: string;
  auctionAddress: string;
  clipItApiUrl: string;
  subgraphUrl: string;
  twitch: TwitchConfig;
  isDevelopment: boolean;
}

export interface TwitchConfig {
  clientId: string;
  accessToken: string;
  secretKey: string;
}
