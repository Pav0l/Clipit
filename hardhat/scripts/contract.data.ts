import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getContractAddress } from "../lib/get-contract";
import { getSignerWallet } from "../lib/get-signer-wallet";
import { ClipIt } from "../typechain/ClipIt";
const Contract = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");



async function main() {
  const contractAddress = getContractAddress();

  const signer = getSignerWallet();

  const contract = (new ethers.Contract(contractAddress, Contract.abi, signer)) as ClipIt;
  const owner = await contract.owner()
  console.log('contract owner', owner);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
