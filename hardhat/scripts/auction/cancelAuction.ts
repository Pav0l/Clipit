import { ethers } from "hardhat";
import { getAuctionAddress } from "../../lib";
import { AuctionHouse } from "../../typechain";
const AuctionContract = require("../../artifacts/contracts/AuctionHouse.sol/AuctionHouse.json");

async function main() {
  const auctionAddress = await getAuctionAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];
  const auction = new ethers.Contract(auctionAddress, AuctionContract.abi, creator) as AuctionHouse;

  // @USER This needs to be set by the user
  const auctionId = "0x0000000000000000000000000000000000000000000000000000000000000000";

  await auction.cancelAuction(auctionId);

  console.log("Auction canceled!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
