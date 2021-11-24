import { ethers } from "hardhat";
import { getAuctionAddress } from "../../lib";
import { AuctionHouse } from "../../typechain";
const AuctionContract = require("../../artifacts/contracts/AuctionHouse.sol/AuctionHouse.json");

const auctionId = "0x0000000000000000000000000000000000000000000000000000000000000000";


async function main() {
  const auctionAddress = await getAuctionAddress();

  const wallets = await ethers.getSigners();
  const creator = wallets[1];
  const auction = (new ethers.Contract(auctionAddress, AuctionContract.abi, creator)) as AuctionHouse;


  const auctionTokenOwner = await auction.auctions(auctionId);
  console.log(auctionTokenOwner);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

