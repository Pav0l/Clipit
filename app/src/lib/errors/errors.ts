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
  | "oauth";

export class AppError extends Error {
  type: ErrorType = "unknown";

  constructor({ msg, type }: { msg: string; type: ErrorType }) {
    super(msg);
    this.type = type;
  }
}
