import { ProviderRpcError } from "../../ethereum/rpc.errors";

export enum ClipItContractErrors {
  TOKEN_ALREADY_MINTED = "This clip is already minted into an NFT",
  ADDRESS_NOT_ALLOWED = "Address not allowed to mint this token",

  // revert messages from contracts
  CLIPIT_TOKEN_EXIST = "ClipIt: a token has already been created with this content hash",
  CLIPIT_INVALID_ADDRESS = "ClipIt: address not allowed to mint",
  ERC721_TOKEN_MINTED = "ERC721: token already minted",
}

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
