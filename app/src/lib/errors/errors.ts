type ErrorType =
  | "unknown"
  | "init"
  | "missing-provider"
  | "connect-provider"
  | "web3-unknown"
  | "web3-clip"
  | "web3-auction"
  | "web3-bid"
  | "subgraph-query"
  | "subgraph-clip"
  | "subgraph-auction"
  | "nft-unknown"
  | "twitch-api-user"
  | "twitch-api-game"
  | "twitch-api-clip"
  | "twitch-ext-auth"
  | "oauth";

export class AppError extends Error {
  type: ErrorType = "unknown";
  isDevOnly = false;

  constructor({ msg, type, isDevOnly }: { msg: string; type: ErrorType; isDevOnly?: boolean }) {
    super(msg);
    this.type = type;
    if (isDevOnly !== undefined) {
      this.isDevOnly = isDevOnly;
    }
  }
}
