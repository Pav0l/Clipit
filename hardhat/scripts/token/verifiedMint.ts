import { BytesLike, BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { getSignerWallet, getTokenAddress, Decimal } from "../../lib";
import { ClipIt } from "../../typechain/ClipIt";
const Contract = require("../../artifacts/contracts/ClipIt.sol/ClipIt.json");

interface ClipData {
  tokenURI: string;
  metadataURI: string;
  contentHash: BytesLike;
  metadataHash: BytesLike;
}
interface BidShares {
  prevOwner: { value: BigNumberish };
  creator: { value: BigNumberish };
  owner: { value: BigNumberish };
}

const CREATOR_ADDRESS = "";
const BID_SHARES: BidShares = {
  prevOwner: Decimal.from(0),
  creator: Decimal.from(10),
  owner: Decimal.from(90),
};
const MEDIA_DATA: ClipData = {
  tokenURI: "",
  metadataURI: "",
  contentHash: [], // Uint8Array
  metadataHash: [], // Uint8Array
};

async function main() {
  const contractAddress = await getTokenAddress();

  const signer = getSignerWallet();
  const contract = new ethers.Contract(contractAddress, Contract.abi, signer) as ClipIt;

  console.log("minting verified CLIP...", CREATOR_ADDRESS, MEDIA_DATA, BID_SHARES);
  const tx = await contract.verifiedMint(CREATOR_ADDRESS, MEDIA_DATA, BID_SHARES);
  console.log("transacton complete...", tx);

  const receipt = await tx.wait();
  console.log("transaction receipt:", receipt);

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
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
