//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// TODO:
// - change owner
// - deposit & withdraw (payable)
// - kill contract

contract ClipItV0 is ERC721 {
  string private baseTokenUri;

  address public owner;

  // Mapping from tokenId to ipfs CID
  mapping(uint256 => string) private content;

  constructor() ERC721("ClipItV0", "CLIP") {
    baseTokenUri = "ipfs://";
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(_msgSender() == owner, "caller is not owner");
    _;
  }

  function verifySignature(
    string memory _msg,
    address _to,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal view returns (bool) {
    bytes32 _msgHash = keccak256(abi.encodePacked(_msg, _to));
    bytes32 _ethSignedMsgHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _msgHash));

    return ecrecover(_ethSignedMsgHash, v, r, s) == owner;
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    require(_exists(_tokenId), "token does not exist");

    string memory baseURI = _baseURI();
    return string(abi.encodePacked(baseURI, content[_tokenId]));
  }

  function mint(
    address _to,
    string memory _cid,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    require(verifySignature(_cid, _to, v, r, s), "address not allowed to mint");

    uint256 _tokenId = uint256(keccak256(abi.encode(_cid)));

    _safeMint(_to, _tokenId);

    content[_tokenId] = _cid;
  }

  function setBaseURI(string memory _uri) external onlyOwner {
    baseTokenUri = _uri;
  }

  function _baseURI() internal view returns (string memory) {
    return baseTokenUri;
  }
}
