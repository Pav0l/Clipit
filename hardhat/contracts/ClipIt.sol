//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


// TODO:
// - change owner
// - deposit & withdraw (payable)

contract ClipIt is ERC721 {

  string private baseTokenUri;

  address public owner;

  enum CidMintStatus {
    NotExistantOrCanceled,
    Allowed,
    Minted
  }

  // Mapping from tokenId to ipfs CID
  mapping(uint256 => string) private content;
  // Mapping keeps track of which address is allowed to mint which CID
  mapping(address => mapping(string => CidMintStatus)) private isAllowedToMint;

  constructor() ERC721("ClipIt", "CLIP") {
    baseTokenUri = "ipfs://";
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(_msgSender() == owner, "caller is not owner");
    _;
  }

  modifier notYetMinted(address _to, string memory _cid) {
    require(!(isAllowedToMint[_to][_cid] == CidMintStatus.Minted), "token already minted");
    _;
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    require(_exists(_tokenId), "token does not exist");

    string memory baseURI = _baseURI();
    return string(abi.encodePacked(baseURI, content[_tokenId]));
  }

  function mint(address _to, string memory _cid) public {
    require(isAllowedToMint[_to][_cid] == CidMintStatus.Allowed, "address not allowed to mint this token");

    uint256 _tokenId = uint256(keccak256(abi.encode(_cid)));

    _safeMint(_to, _tokenId);

    content[_tokenId] = _cid;
    isAllowedToMint[_to][_cid] = CidMintStatus.Minted;
  }

  function setBaseURI(string memory _uri) external onlyOwner {
    baseTokenUri = _uri;
  }

  function allowMint(address _to, string memory _cid) external onlyOwner notYetMinted(_to, _cid) {
    isAllowedToMint[_to][_cid] = CidMintStatus.Allowed;
  }

  function cancelMint(address _to, string memory _cid) external onlyOwner notYetMinted(_to, _cid) {
    isAllowedToMint[_to][_cid] = CidMintStatus.NotExistantOrCanceled;
  }

  function getAllowedToMint(address _to, string memory _cid) external view onlyOwner returns(CidMintStatus) {
    return isAllowedToMint[_to][_cid];
  }

  function _baseURI() internal view override returns (string memory) {
    return baseTokenUri;
  }
}
