

export interface EthereumProvider {
  isMetaMask: boolean;

  isConnected(): boolean;
  request<T>(args: RequestArguments): Promise<T>;

  on(eventName: EthereumEvents, handler: (data: any) => void): void;
  off(eventName: EthereumEvents, handler: (data: any) => void): void;
}

export enum ChainId {
  MAIN = "0x1",
  ROPSTEN = "0x3",
  RINKEBY = "0x4",
  GOERLI = "0x5",
  KOVAN = "0x2a",
  HARDHAT = "31337"
}

export interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface ProviderMessage {
  type: string;
  data: unknown;
}

type EthereumEvents = "connect" | "disconnect" | "accountsChanged" | "chainChanged" | "message";

export interface ConnectInfo {
  chainId: ChainId;
}
