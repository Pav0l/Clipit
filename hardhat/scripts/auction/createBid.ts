import { ethers } from "hardhat";
import { getAuctionAddress, getSignerWallet } from "../../lib";
import { AuctionHouse } from "../../typechain";
const AuctionContract = require("../../artifacts/contracts/AuctionHouse.sol/AuctionHouse.json");


async function main() {
  const auctionAddress = await getAuctionAddress();
  const wallet = await getSignerWallet();
  const auction = (new ethers.Contract(auctionAddress, AuctionContract.abi, wallet)) as AuctionHouse;



  const auctionId = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const amount = ethers.utils.parseEther("0.373");
  console.log(`Creating Bid for auction ${auctionId} on contract ${auctionAddress}`);

  const tx = await auction.createBid(auctionId, amount, { value: amount });
  console.log('waiting for tx: ', tx.hash);
  await tx.wait();

  console.log(`Bid for auction ${auctionId} created`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

