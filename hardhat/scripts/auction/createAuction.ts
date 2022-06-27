import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getAuctionAddress, getTokenAddress, getWETHAddress } from "../../lib";
import { AuctionHouse, ClipIt } from "../../typechain";
const AuctionContract = require("../../artifacts/contracts/AuctionHouse.sol/AuctionHouse.json");
const TokenContract = require("../../artifacts/contracts/ClipIt.sol/ClipIt.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";

async function main() {
  const auctionAddress = await getAuctionAddress();
  const tokenAddress = await getTokenAddress();
  const wethAddress = await getWETHAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];
  const auction = new ethers.Contract(auctionAddress, AuctionContract.abi, creator) as AuctionHouse;

  const token = new ethers.Contract(tokenAddress, TokenContract.abi, creator) as ClipIt;
  // approve auction to transfer this token
  await token.approve(auction.address, tokenId);

  const auctionDuration = 60 * 60 * 24; // seconds the auction should last since first bid
  const reservePrice = parseUnits("2", "ether");
  const curatorAddress = ethers.constants.AddressZero;
  const curatorFeePercentage = 0; // uint8 between 0 - 99
  const auctionCurrencyAddress = wethAddress;

  await auction.createAuction(
    tokenId,
    tokenAddress,
    auctionDuration,
    reservePrice,
    curatorAddress,
    curatorFeePercentage,
    auctionCurrencyAddress
  );

  console.log("Auction created!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
