import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getSignerWallet, getContractAddress, generateSignature } from "../lib";
import { ClipIt } from "../typechain/ClipIt";
const Contract = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");


// TODO utilize input-handler for these
const cid = "bafybeiealga7wox5q4hzyhusi5izfbkpyvgydphyjwb76r75y5idkvlawe";
const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";


async function main() {
  const contractAddress = getContractAddress();

  const signer = getSignerWallet();
  const contract = (new ethers.Contract(contractAddress, Contract.abi, signer)) as ClipIt;


  console.log("generating signature...");
  const signature = await generateSignature(signer, cid, address);

  console.log("minting CLIP...");
  const tx = await contract.mint(address, cid, BigNumber.from(signature.v), signature.r, signature.s);
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
