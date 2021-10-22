

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

// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
export enum RpcErrors {
  USER_REJECTED_REQUEST = 4001, // The user rejected the request.
  UNAUTHORIZED = 4100, // The requested method and/or account has not been authorized by the user.
  UNSUPPORTED_METHOD = 4200, // The Provider does not support the requested method.
  DISCONNECTED = 4900, // The Provider is disconnected from all chains.
  CHAIN_DISCONNECTED = 4901, // The Provider is not connected to the requested chain.
  REQUEST_ALREADY_PENDING = -32002, // The request is already pending confirmation (connect wallet, confirm tx, ...)
  INTERNAL_ERROR = -32603, // Used for contract reverts and errors
}

export function isRpcError(error: ProviderRpcError | unknown): error is ProviderRpcError {
  return (error as ProviderRpcError).code !== undefined && (error as ProviderRpcError).message !== undefined;
}
