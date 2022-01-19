
export enum ClipItContractErrors {
  TOKEN_ALREADY_MINTED = "This clip is already minted into an NFT",
  ADDRESS_NOT_ALLOWED = "Address not allowed to mint this token",

  // revert messages from contracts
  CLIPIT_TOKEN_EXIST = "ClipIt: a token has already been created with this content hash",
  CLIPIT_INVALID_ADDRESS = "ClipIt: address not allowed to mint",
  ERC721_TOKEN_MINTED = "ERC721: token already minted",
}
