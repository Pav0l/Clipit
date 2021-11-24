import { BytesLike, BigNumberish } from "ethers";
import { keccak256, arrayify, toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getSignerWallet, Decimal } from "../../lib";
import { ZoraMedia } from "../../typechain/ZoraMedia";
const Contract = require("../../artifacts/contracts/zora/Media.sol/ZoraMedia.json");


const tokenCid = "tokenCID";
const metadataCid = "metadataCID";

const metadataURI = `ipfs://${metadataCid}`;
const metadataHash = keccak256(toUtf8Bytes(metadataCid));
const metadataHashBytes = arrayify(metadataHash);

const tokenURI = `ipfs://${tokenCid}`;
const contentHash = keccak256(toUtf8Bytes(tokenCid));
const contentHashBytes = arrayify(contentHash);

interface ClipData {
  tokenURI: string;
  metadataURI: string;
  contentHash: BytesLike;
  metadataHash: BytesLike;
};
interface BidShares {
  prevOwner: { value: BigNumberish };
  creator: { value: BigNumberish };
  owner: { value: BigNumberish };
}

const mintData: ClipData = {
  tokenURI,
  metadataURI,
  contentHash: contentHashBytes,
  metadataHash: metadataHashBytes,
};

// @USER This needs to be set by the user
const bidShares: BidShares = {
  prevOwner: Decimal.from(0),
  creator: Decimal.from(5),
  owner: Decimal.from(95),
}


async function main() {
  const contractAddress = "0x998abeb3E57409262aE5b751f60747921B33613E";

  const signer = getSignerWallet();
  const contract = (new ethers.Contract(contractAddress, Contract.abi, signer)) as ZoraMedia;

  console.log("minting NFT to", signer.address);
  const tx = await contract.mint(mintData, bidShares);
  const r = await tx.wait();

  console.log(r);

  console.log("Done...")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
