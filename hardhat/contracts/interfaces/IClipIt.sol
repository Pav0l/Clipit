// SPDX-License-Identifier: GPL-3.0

/**
 * NOTE: This file is a clone of the Zora IMedia.sol interface.
 * It was forked from https://github.com/ourzora/core at commit 09cac29fcd7a6604e3072d26a8d8fdf932b16d7b.
 *
 * The file and the interface itself was renamed, since sadly, the Media in this contract
 * is not independent of platforms. The interface itself should still be compatible with Zora's Market contract.
 *
 * The following functions needed to be modified:
 *  - `mint` now takes ECDSA signature to verify ownership of the Clip and caller of the `mint`.
 *     The ownership is verified by third-party API, where the creator generates the Clip.
 *  - `mintWithSig` was removed, since `mint` itself already required a signature
 */

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { IMarket } from "./IMarket.sol";

/**
 * @title Interface for ClipIt "media"
 */
interface IClipIt {
  struct MediaData {
    // A valid URI of the content represented by this token
    string tokenURI;
    // A valid URI of the metadata associated with this token
    string metadataURI;
    // A SHA256 hash of the content pointed to by tokenURI
    bytes32 contentHash;
    // A SHA256 hash of the content pointed to by metadataURI
    bytes32 metadataHash;
  }

  event TokenURIUpdated(uint256 indexed _tokenId, address owner, string _uri);
  event TokenMetadataURIUpdated(uint256 indexed _tokenId, address owner, string _uri);

  /**
   * @notice Return the metadata URI for a piece of media given the token URI
   */
  function tokenMetadataURI(uint256 tokenId) external view returns (string memory);

  /**
   * @notice Mint new Clip for msg.sender.
   */
  function mint(
    MediaData calldata data,
    IMarket.BidShares calldata bidShares,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;

  /**
   * @notice Mint new Clip to creator.
   * @notice Can only be called by contract owner who can verify ownership of the Clip for creator offchain
   */
  function verifiedMint(
    address creator,
    MediaData calldata data,
    IMarket.BidShares calldata bidShares
  ) external;

  /**
   * @notice Transfer the token with the given ID to a given address.
   * Save the previous owner before the transfer, in case there is a sell-on fee.
   * @dev This can only be called by the auction contract specified at deployment
   */
  function auctionTransfer(uint256 tokenId, address recipient) external;

  /**
   * @notice Set the ask on a piece of media
   */
  function setAsk(uint256 tokenId, IMarket.Ask calldata ask) external;

  /**
   * @notice Remove the ask on a piece of media
   */
  function removeAsk(uint256 tokenId) external;

  /**
   * @notice Set the bid on a piece of media
   */
  function setBid(uint256 tokenId, IMarket.Bid calldata bid) external;

  /**
   * @notice Remove the bid on a piece of media
   */
  function removeBid(uint256 tokenId) external;

  function acceptBid(uint256 tokenId, IMarket.Bid calldata bid) external;

  /**
   * @notice Revoke approval for a piece of media
   */
  function revokeApproval(uint256 tokenId) external;

  /**
   * @notice Update the token URI
   */
  function updateTokenURI(uint256 tokenId, string calldata tokenURI) external;

  /**
   * @notice Update the token metadata uri
   */
  function updateTokenMetadataURI(uint256 tokenId, string calldata metadataURI) external;
}
