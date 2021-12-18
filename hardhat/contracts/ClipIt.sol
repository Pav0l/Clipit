// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

/**
 * NOTE: This file is a clone of the Zora Media.sol contract.
 * It was forked from https://github.com/ourzora/core at commit 09cac29fcd7a6604e3072d26a8d8fdf932b16d7b.
 *
 * The file and the contract itself was renamed, since sadly, the Media (clip) in this contract
 * is not independent of platforms. The contract itself should still be compatible with Zora's Market contract.
 * For the purpose of these contracts (ClipIt & Market) the "media" and "clip" are interchangable names,
 * even tho "clip" is not compatible with Zoras definition of Media.
 *
 * The following functions needed to be modified:
 *  - `mint` now takes ECDSA signature to verify ownership of the Clip and caller of the `mint`.
 *     The ownership is verified by third-party API, where the creator generates the Clip.
 *  - `mintWithSig` was removed, since `mint` itself already required a signature
 *  - `onlyTokenWithContentHash` modifier was removed. creating token without content hash is prevented in `mint`
 *  - `onlyTokenWithMetadataHash` modifier was removed. creating token without metadata hash is prevented in `mint`
 *  - `permit` function and `_calculateDomainSeparator` function as removed
 *  - `_creatorTokens` mapping was removed
 */

import { ERC721Burnable } from "./ERC721Burnable.sol";
import { ERC721 } from "./ERC721.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { Math } from "@openzeppelin/contracts/math/Math.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Decimal } from "./Decimal.sol";
import { IMarket } from "./interfaces/IMarket.sol";
import "./interfaces/IClipIt.sol";


contract ClipIt is IClipIt, ERC721Burnable, ReentrancyGuard, Ownable {
  using Counters for Counters.Counter;
  using SafeMath for uint256;

  /* *******
   * Globals
   * *******
   */

  // Address for the market
  address public marketContract;

  // Mapping from token to previous owner of the token
  mapping(uint256 => address) public previousTokenOwners;

  // Mapping from token id to creator address
  mapping(uint256 => address) public tokenCreators;

  // Mapping from token id to sha256 hash of content
  mapping(uint256 => bytes32) public tokenContentHashes;

  // Mapping from token id to sha256 hash of metadata
  mapping(uint256 => bytes32) public tokenMetadataHashes;

  // Mapping from token id to metadataURI
  mapping(uint256 => string) private _tokenMetadataURIs;

  // Mapping from contentHash to bool
  mapping(bytes32 => bool) private _contentHashes;

  /*
   *     bytes4(keccak256('name()')) == 0x06fdde03
   *     bytes4(keccak256('symbol()')) == 0x95d89b41
   *     bytes4(keccak256('tokenURI(uint256)')) == 0xc87b56dd
   *     bytes4(keccak256('tokenMetadataURI(uint256)')) == 0x157c3df9
   *
   *     => 0x06fdde03 ^ 0x95d89b41 ^ 0xc87b56dd ^ 0x157c3df9 == 0x4e222e66
   */
  bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x4e222e66;

  Counters.Counter private _tokenIdTracker;

  /* *********
   * Modifiers
   * *********
   */

  /**
   * @notice Require that the token has not been burned and has been minted
   */
  modifier onlyExistingToken(uint256 tokenId) {
    require(_exists(tokenId), "ClipIt: nonexistent token");
    _;
  }

  /**
   * @notice Ensure that the provided spender is the approved or the owner of
   * the media for the specified tokenId
   */
  modifier onlyApprovedOrOwner(address spender, uint256 tokenId) {
    require(
      _isApprovedOrOwner(spender, tokenId),
      "ClipIt: Only approved or owner"
    );
    _;
  }

  /**
   * @notice Ensure the token has been created (even if it has been burned)
   */
  modifier onlyTokenCreated(uint256 tokenId) {
    require(
      _tokenIdTracker.current() > tokenId,
      "ClipIt: token with that id does not exist"
    );
    _;
  }

  /**
   * @notice Ensure that the provided URI is not empty
   */
  modifier onlyValidURI(string memory uri) {
    require(bytes(uri).length != 0, "ClipIt: specified uri must be non-empty");
    _;
  }

  /**
   * @notice On deployment, set the market contract address and register the
   * ERC721 metadata interface
   */
  constructor(address marketContractAddr) ERC721("ClipIt", "CLIP") {
    marketContract = marketContractAddr;
    _registerInterface(_INTERFACE_ID_ERC721_METADATA);
  }

  /* **************
   * View Functions
   * **************
   */

  /**
   * @notice return the URI for a particular piece of media with the specified tokenId
   * @dev This function is an override of the base OZ implementation because we
   * will return the tokenURI even if the media has been burned. In addition, this
   * protocol does not support a base URI, so relevant conditionals are removed.
   * @return the URI for a token
   */
  function tokenURI(uint256 tokenId)
    public
    view
    override
    onlyTokenCreated(tokenId)
    returns (string memory)
  {
    string memory _tokenURI = _tokenURIs[tokenId];

    return _tokenURI;
  }

  /**
   * @notice Return the metadata URI for a piece of media given the token URI
   * @return the metadata URI for the token
   */
  function tokenMetadataURI(uint256 tokenId)
    external
    view
    override
    onlyTokenCreated(tokenId)
    returns (string memory)
  {
    return _tokenMetadataURIs[tokenId];
  }

  /* ****************
   * Public Functions
   * ****************
   */

  /**
   * @notice see IClipIt
   */
  function mint(MediaData memory data, IMarket.BidShares memory bidShares, uint8 v, bytes32 r, bytes32 s)
    public
    override
    nonReentrant
  {
    require(_verifySignature(data.contentHash, msg.sender, v, r, s), "ClipIt: address not allowed to mint");
    _mintForCreator(msg.sender, data, bidShares);
  }

  /**
   * @notice see IClipIt
   */
  function auctionTransfer(uint256 tokenId, address recipient)
    external
    override
  {
    require(msg.sender == marketContract, "ClipIt: only market contract");
    previousTokenOwners[tokenId] = ownerOf(tokenId);
    _safeTransfer(ownerOf(tokenId), recipient, tokenId, "");
  }

  /**
   * @notice see IClipIt
   */
  function setAsk(uint256 tokenId, IMarket.Ask memory ask)
    public
    override
    nonReentrant
    onlyApprovedOrOwner(msg.sender, tokenId)
  {
    IMarket(marketContract).setAsk(tokenId, ask);
  }

  /**
   * @notice see IClipIt
   */
  function removeAsk(uint256 tokenId)
    external
    override
    nonReentrant
    onlyApprovedOrOwner(msg.sender, tokenId)
  {
    IMarket(marketContract).removeAsk(tokenId);
  }

  /**
   * @notice see IClipIt
   */
  function setBid(uint256 tokenId, IMarket.Bid memory bid)
    public
    override
    nonReentrant
    onlyExistingToken(tokenId)
  {
    require(msg.sender == bid.bidder, "Market: Bidder must be msg sender");
    IMarket(marketContract).setBid(tokenId, bid, msg.sender);
  }

  /**
   * @notice see IClipIt
   */
  function removeBid(uint256 tokenId)
    external
    override
    nonReentrant
    onlyTokenCreated(tokenId)
  {
    IMarket(marketContract).removeBid(tokenId, msg.sender);
  }

  /**
   * @notice see IClipIt
   */
  function acceptBid(uint256 tokenId, IMarket.Bid memory bid)
    public
    override
    nonReentrant
    onlyApprovedOrOwner(msg.sender, tokenId)
  {
    IMarket(marketContract).acceptBid(tokenId, bid);
  }

  /**
   * @notice Burn a token.
   * @dev Only callable if the media owner is also the creator.
   */
  function burn(uint256 tokenId)
    public
    override
    nonReentrant
    onlyExistingToken(tokenId)
    onlyApprovedOrOwner(msg.sender, tokenId)
  {
    address owner = ownerOf(tokenId);

    require(
      tokenCreators[tokenId] == owner,
      "ClipIt: owner is not creator of media"
    );

    _burn(tokenId);
  }

  /**
   * @notice Revoke the approvals for a token. The provided `approve` function is not sufficient
   * for this protocol, as it does not allow an approved address to revoke it's own approval.
   * In instances where a 3rd party is interacting on a user's behalf via `permit`, they should
   * revoke their approval once their task is complete as a best practice.
   */
  function revokeApproval(uint256 tokenId) external override nonReentrant {
    require(
      msg.sender == getApproved(tokenId),
      "ClipIt: caller not approved address"
    );
    _approve(address(0), tokenId);
  }

  /**
   * @notice see IClipIt
   * @dev only callable by approved or owner
   */
  function updateTokenURI(uint256 tokenId, string calldata _tokenURI)
    external
    override
    nonReentrant
    onlyApprovedOrOwner(msg.sender, tokenId)
    onlyValidURI(_tokenURI)
  {
    _setTokenURI(tokenId, _tokenURI);
    emit TokenURIUpdated(tokenId, msg.sender, _tokenURI);
  }

  /**
   * @notice see IClipIt
   * @dev only callable by approved or owner
   */
  function updateTokenMetadataURI(uint256 tokenId, string calldata metadataURI)
    external
    override
    nonReentrant
    onlyApprovedOrOwner(msg.sender, tokenId)
    onlyValidURI(metadataURI)
  {
    _setTokenMetadataURI(tokenId, metadataURI);
    emit TokenMetadataURIUpdated(tokenId, msg.sender, metadataURI);
  }

  /* *****************
   * Private Functions
   * *****************
   */

  /**
   * @notice Creates a new token for `creator`. Its token ID will be automatically
   * assigned (and available on the emitted {IERC721-Transfer} event), and the token
   * URI autogenerated based on the base URI passed at construction.
   *
   * See {ERC721-_safeMint}.
   *
   * On mint, also set the sha256 hashes of the content and its metadata for integrity
   * checks, along with the initial URIs to point to the content and metadata. Attribute
   * the token ID to the creator, mark the content hash as used, and set the bid shares for
   * the media's market.
   *
   * Note that although the content hash must be unique for future mints to prevent duplicate media,
   * metadata has no such requirement.
   */
  function _mintForCreator(
    address creator,
    MediaData memory data,
    IMarket.BidShares memory bidShares
  ) internal onlyValidURI(data.tokenURI) onlyValidURI(data.metadataURI) {
    require(data.contentHash != 0, "ClipIt: content hash must be non-zero");
    require(
      _contentHashes[data.contentHash] == false,
      "ClipIt: a token has already been created with this content hash"
    );
    require(data.metadataHash != 0, "ClipIt: metadata hash must be non-zero");

    uint256 tokenId = _tokenIdTracker.current();

    _safeMint(creator, tokenId);
    _tokenIdTracker.increment();
    _setTokenContentHash(tokenId, data.contentHash);
    _setTokenMetadataHash(tokenId, data.metadataHash);
    _setTokenMetadataURI(tokenId, data.metadataURI);
    _setTokenURI(tokenId, data.tokenURI);
    _contentHashes[data.contentHash] = true;

    tokenCreators[tokenId] = creator;
    previousTokenOwners[tokenId] = creator;
    IMarket(marketContract).setBidShares(tokenId, bidShares);
  }

  function _setTokenContentHash(uint256 tokenId, bytes32 contentHash)
    internal
    virtual
    onlyExistingToken(tokenId)
  {
    tokenContentHashes[tokenId] = contentHash;
  }

  function _setTokenMetadataHash(uint256 tokenId, bytes32 metadataHash)
    internal
    virtual
    onlyExistingToken(tokenId)
  {
    tokenMetadataHashes[tokenId] = metadataHash;
  }

  function _setTokenMetadataURI(uint256 tokenId, string memory metadataURI)
    internal
    virtual
    onlyExistingToken(tokenId)
  {
    _tokenMetadataURIs[tokenId] = metadataURI;
  }

  /**
   * @notice Destroys `tokenId`.
   * @dev We modify the OZ _burn implementation to
   * maintain metadata and to remove the
   * previous token owner from the piece
   */
  function _burn(uint256 tokenId) internal override {
    string memory tokenURI = _tokenURIs[tokenId];

    super._burn(tokenId);

    if (bytes(tokenURI).length != 0) {
      _tokenURIs[tokenId] = tokenURI;
    }

    delete previousTokenOwners[tokenId];
  }

  /**
   * @notice transfer a token and remove the ask for it.
   */
  function _transfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override {
    IMarket(marketContract).removeAsk(tokenId);

    super._transfer(from, to, tokenId);
  }

  function _verifySignature(
    bytes32 _msg,
    address _to,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal view returns (bool) {
    bytes32 _msgHash = keccak256(abi.encodePacked(_msg, _to));
    bytes32 _ethSignedMsgHash = keccak256(
      abi.encodePacked("\x19Ethereum Signed Message:\n32", _msgHash)
    );

    return ecrecover(_ethSignedMsgHash, v, r, s) == owner();
  }
}
