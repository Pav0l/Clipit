import { ProviderRpcError } from "../ethereum/rpc.errors";


export function isEthersJsonRpcError(error: EthersJsonRpcError | unknown): error is EthersJsonRpcError {
  return (error as EthersJsonRpcError).code !== undefined &&
    typeof (error as EthersJsonRpcError).code === 'string' &&
    (error as EthersJsonRpcError).message !== undefined &&
    typeof (error as EthersJsonRpcError).message === 'string' &&
    (error as EthersJsonRpcError).reason !== undefined &&
    typeof (error as EthersJsonRpcError).reason === 'string'
}

interface EthersJsonRpcError {
  reason: string;
  message: string;
  code: string;
  // check `makeError` in @ethersproject Logger
  error?: ProviderRpcError;
  transaction?: unknown;
}
