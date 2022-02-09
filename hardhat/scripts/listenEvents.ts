import { ethers } from "hardhat";
import { getAuctionAddress, getMarketAddress, getTokenAddress } from "../lib";
import { getSignerWallet } from "../lib/get-signer-wallet";
import { ClipIt } from "../typechain/ClipIt";
const Token = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");
const Market = require("../artifacts/contracts/Market.sol/Market.json");
const Auction = require("../artifacts/contracts/AuctionHouse.sol/AuctionHouse.json");

async function main() {
  const signer = getSignerWallet();

  // TOKEN
  const tokenAddress = await getTokenAddress();
  const token = new ethers.Contract(tokenAddress, Token.abi, signer) as ClipIt;

  console.log("Listening for ClipIt Events...");
  token.on("Transfer", console.log);
  token.on("Approval", console.log);
  token.on("ApprovalForAll", console.log);

  // MARKET
  const marketAddress = await getMarketAddress();
  const market = new ethers.Contract(marketAddress, Market.abi, signer);

  console.log("Listening for Market Events...");
  market.on("BidCreated", console.log);
  market.on("BidRemoved", console.log);
  market.on("BidFinalized", console.log);
  market.on("AskCreated", console.log);
  market.on("AskRemoved", console.log);
  market.on("BidShareUpdated", console.log);

  // AUCTION
  const auctionAddress = await getAuctionAddress();
  const auction = new ethers.Contract(auctionAddress, Auction.abi, signer);

  console.log("Listening for Auction Events...");
  auction.on("AuctionCreated", console.log);
  auction.on("AuctionApprovalUpdated", console.log);
  auction.on("AuctionReservePriceUpdated", console.log);
  auction.on("AuctionBid", console.log);
  auction.on("AuctionDurationExtended", console.log);
  auction.on("AuctionEnded", console.log);
  auction.on("AuctionCanceled", console.log);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
