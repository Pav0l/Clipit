import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Decimal, getMarketAddress, getTokenAddress, getWETHAddress } from "../../lib";
import { WETH } from "../../typechain";
import { ClipIt } from "../../typechain/ClipIt";
import { Market } from "../../typechain/Market";
const ClipItContract = require("../../artifacts/contracts/ClipIt.sol/ClipIt.json");
const MarketContract = require("../../artifacts/contracts/Market.sol/Market.json");
const WETHContract = require("../../artifacts/contracts/tests/WETH.sol/WETH.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const tokenAddress = await getTokenAddress();
  const wethAddress = await getWETHAddress();
  const marketAddress = await getMarketAddress();

  const wallets = await ethers.getSigners();
  const bidder = wallets[2];
  const token = new ethers.Contract(tokenAddress, ClipItContract.abi, bidder) as ClipIt;
  const market = new ethers.Contract(marketAddress, MarketContract.abi, bidder) as Market;
  const currency = new ethers.Contract(wethAddress, WETHContract.abi, bidder) as WETH;

  // @USER This needs to be set by the user
  const bidAmount = parseUnits("2", "ether");

  await currency.approve(market.address, ethers.constants.MaxUint256);
  // await currency.deposit({ value: bidAmount });

  const bidderBalance = await currency.balanceOf(bidder.address);
  console.log("currency", bidderBalance.toString());

  const bidderAllowance = await currency.allowance(bidder.address, token.address);
  console.log("allowance", bidderAllowance.toString());

  const ownerOf = await token.ownerOf(tokenId);
  console.log(`ownerof:${ownerOf}; bidder:${bidder.address}`);

  // @USER This needs to be set by the user
  const bid = {
    amount: bidAmount,
    currency: wethAddress,
    bidder: bidder.address,
    recipient: bidder.address,
    sellOnShare: Decimal.from(0),
  };

  await token.setBid(tokenId, bid);

  console.log("Bid set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
