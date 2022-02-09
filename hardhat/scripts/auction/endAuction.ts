import { ethers } from "hardhat";
import { getAuctionAddress } from "../../lib";
import { AuctionHouse } from "../../typechain";
const AuctionContract = require("../../artifacts/contracts/AuctionHouse.sol/AuctionHouse.json");

async function main() {
  const auctionAddress = await getAuctionAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];
  const auction = new ethers.Contract(auctionAddress, AuctionContract.abi, creator) as AuctionHouse;

  const auctionId = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const tx = await auction.endAuction(auctionId);
  console.log("waiting for tx: ", tx.hash);
  await tx.wait();

  console.log("Auction ended!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
