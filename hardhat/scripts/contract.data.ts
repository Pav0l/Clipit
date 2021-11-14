import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getTokenAddress } from "../lib";
import { getSignerWallet } from "../lib/get-signer-wallet";
import { ClipIt } from "../typechain/ClipIt";
const Contract = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");

const tokenId = "68919460976705972566622395162149526032156782722651794670000650452764152022153";

async function main() {
  const contractAddress = await getTokenAddress();

  const signer = getSignerWallet();

  const contract = (new ethers.Contract(contractAddress, Contract.abi, signer)) as ClipIt;
  const owner = await contract.owner()
  console.log('contract owner', owner);

  const tokenUri = await contract.tokenURI(BigNumber.from(tokenId));
  console.log('tokenUri:', tokenUri);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
