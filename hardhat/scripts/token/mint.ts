import { BytesLike, BigNumber, BigNumberish } from "ethers";
import { keccak256, arrayify, toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getSignerWallet, getTokenAddress, generateSignatureV2, Decimal } from "../../lib";
import { ClipIt } from "../../typechain/ClipIt";
const Contract = require("../../artifacts/contracts/ClipIt.sol/ClipIt.json");


const tokenCid = "tokenCID";
const metadataCid = "metadataCID";
/**
 * Wallet address that you wnat to mint to
 */
const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

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
  const contractAddress = await getTokenAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];

  const signer = getSignerWallet();
  const contract = (new ethers.Contract(contractAddress, Contract.abi, creator)) as ClipIt;


  console.log("generating signature...");
  const signature = await generateSignatureV2(signer, contentHash, creator.address);

  console.log("minting CLIP...", mintData, bidShares);
  const tx = await contract.mint(mintData, bidShares, BigNumber.from(signature.v), signature.r, signature.s);
  console.log('transacton complete...', tx);

  const receipt = await tx.wait();
  console.log('transaction receipt:', receipt);

  if (receipt.events) {
    receipt.events.forEach((ev) => {
      console.log("Transfer event topics:");
      console.log("from:", ev.topics[1]);
      console.log("to:", ev.topics[2]);
      console.log("tokenId:", ev.topics[3]);
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
