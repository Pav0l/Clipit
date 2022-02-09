import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getTokenAddress, getWETHAddress } from "../../lib";
import { ClipIt } from "../../typechain/ClipIt";
const Contract = require("../../artifacts/contracts/ClipIt.sol/ClipIt.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const tokenAddress = await getTokenAddress();
  const wethAddress = await getWETHAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];
  const token = new ethers.Contract(tokenAddress, Contract.abi, creator) as ClipIt;

  // @USER This needs to be set by the user
  const ask = {
    amount: parseUnits("1", "ether"),
    currency: wethAddress, // localhost WETH contract address
  };

  console.log(`Setting ask for token:${tokenId}`, ask);
  await token.setAsk(tokenId, ask);

  console.log("Ask set!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
