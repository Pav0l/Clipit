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
  return (error as ProviderRpcError).code !== undefined &&
    typeof (error as ProviderRpcError).code === 'number' &&
    (error as ProviderRpcError).message !== undefined &&
    typeof (error as ProviderRpcError).message === 'string';
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
