import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getTokenAddress } from "../../lib";
import { getSignerWallet } from "../../lib/get-signer-wallet";
import { ClipIt } from "../../typechain/ClipIt";
const Contract = require("../../artifacts/contracts/ClipIt.sol/ClipIt.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const contractAddress = await getTokenAddress();

  const signer = getSignerWallet();

  const contract = new ethers.Contract(contractAddress, Contract.abi, signer) as ClipIt;
  const owner = await contract.owner();
  console.log("contract owner", owner);

  const tokenUri = await contract.tokenURI(BigNumber.from(tokenId));
  console.log("tokenUri:", tokenUri);

  const tokenOwner = await contract.ownerOf(tokenId);
  console.log("tokenOwner:", tokenOwner);

  const wallets = await ethers.getSigners();
  wallets.forEach((w) => console.log(w.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
