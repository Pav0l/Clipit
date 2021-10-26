import { ethers } from "hardhat";
import { getContractAddress } from "../lib/get-contract";
import { getSignerWallet } from "../lib/get-signer-wallet";
import { ClipIt } from "../typechain/ClipIt";
const Contract = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");


async function main() {
  const contractAddress = getContractAddress();
  const signer = getSignerWallet();
  const contract = (new ethers.Contract(contractAddress, Contract.abi, signer)) as ClipIt;

  console.log("contract created, listening for events...");
  contract.on("Transfer", console.log);
  contract.on("Approval", console.log);
  contract.on("ApprovalForAll", console.log);
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
