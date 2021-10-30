import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getSignerWallet, getContractAddress, generateSignature } from "../lib";
import { ClipIt } from "../typechain/ClipIt";
const Contract = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");


const to = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const tokenId = "101352479550096108241817719032806142388122693513050901758856327660349146233044";

async function main() {
  const contractAddress = getContractAddress();

  const signer = getSignerWallet();
  const contract = (new ethers.Contract(contractAddress, Contract.abi, signer)) as ClipIt;

  console.log(`transfering CLIP ${tokenId} from ${signer.address} to ${to}`);
  const tx = await contract.transferFrom(signer.address, to, BigNumber.from(tokenId));
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
