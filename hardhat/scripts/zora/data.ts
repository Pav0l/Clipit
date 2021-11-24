import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getTokenAddress } from "../../lib";
import { getSignerWallet } from "../../lib/get-signer-wallet";
import type { ZoraMedia } from "../../contracts/zora/types/ZoraMedia";
import type { ZoraMarket } from "../../contracts/zora/types/ZoraMarket";
const ZoraMediaContract = require("../../contracts/zora/contracts/Market/ZoraMarket.json");
const ZoraMarketContract = require("../../contracts/zora/contracts/Market/ZoraMarket.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const contractAddress = "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00"; // localhost

  const signer = getSignerWallet();

  const contract = (new ethers.Contract(contractAddress, ZoraMediaContract.abi, signer)) as ZoraMedia;
  const marketAddr = await contract.name();
  console.log('marketAddr', marketAddr);


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
