export enum NftErrors {
  INSTALL_METAMASK = "Please install MetaMask extension and connect your Ethereum Wallet",
  CONNECT_METAMASK = "Connect your MetaMask wallet to create clip NFT",
  DISCONNECTED = "It seems we were disconnected. Please check your internet connection",
  FAILED_TO_MINT = "Failed to generate the NFT, please try again",
  CONFITM_MINT = "Please confirm the mint transaction in MetaMask",
  MINT_REJECTED = "Mint transaction rejected",
  SOMETHING_WENT_WRONG = "Something went wrong",
}

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

// https://eips.ethereum.org/EIPS/eip-1193#provider-errors
export enum RpcErrors {
  USER_REJECTED_REQUEST = 4001, // The user rejected the request.
  UNAUTHORIZED = 4100, // The requested method and/or account has not been authorized by the user.
  UNSUPPORTED_METHOD = 4200, // The Provider does not support the requested method.
  DISCONNECTED = 4900, // The Provider is disconnected from all chains.
  CHAIN_DISCONNECTED = 4901, // The Provider is not connected to the requested chain.
}

export function isRpcError(error: ProviderRpcError | unknown): error is ProviderRpcError {
  return (error as ProviderRpcError).code !== undefined && (error as ProviderRpcError).message !== undefined;
}
