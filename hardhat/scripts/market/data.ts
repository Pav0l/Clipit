import { ethers } from "hardhat";
import { getMarketAddress } from "../../lib";
import { Market } from "../../typechain";
const MarketContract = require("../../artifacts/contracts/Market.sol/Market.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const marketAddress = await getMarketAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];
  const market = new ethers.Contract(marketAddress, MarketContract.abi, creator) as Market;

  const askForToken = await market.currentAskForToken(tokenId);
  console.log("askForToken", askForToken);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
