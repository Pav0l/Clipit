import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Decimal, getWETHAddress } from "../../lib";
import { WETH } from "../../typechain";
import { ZoraMedia } from "../../typechain/ZoraMedia";
import { ZoraMarket } from "../../typechain/ZoraMarket";
const ZoraMediaContract = require("../../artifacts/contracts/zora/Media.sol/ZoraMedia.json");
const ZoraMarketContract = require("../../artifacts/contracts/zora/Market.sol/ZoraMarket.json");
const WETHContract = require("../../artifacts/contracts/tests/WETH.sol/WETH.json");


const tokenId = "4860";// "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  const tokenAddress = "0x7C2668BD0D3c050703CEcC956C11Bd520c26f7d4";
  const wethAddress = "0xc778417e063141139fce010982780140aa0cd5ab" // await getWETHAddress();

  const bidder = new ethers.Wallet("<ADD PRIVATE KEY>", ethers.provider);
  const media = (new ethers.Contract(tokenAddress, ZoraMediaContract.abi, bidder)) as ZoraMedia;
  const market = (new ethers.Contract(tokenAddress, ZoraMarketContract.abi, bidder)) as ZoraMarket;
  const weth = (new ethers.Contract(wethAddress, WETHContract.abi, bidder)) as WETH;

  // @USER This needs to be set by the user
  const bidAmount = parseUnits("2", "ether")

  // uncomment if you need to approve market first
  // console.log('approving market contract for bidder WETH transfers');
  // await weth.approve(market.address, ethers.constants.MaxUint256);

  // uncomment if you need to deposit
  // console.log('bidder depositing ETH to WETH');
  // await weth.deposit({ value: bidAmount });

  const wethVal = await weth.balanceOf(bidder.address);
  console.log('bidder WETH balance', wethVal.toString());

  const xxxx = await weth.allowance(bidder.address, market.address)
  console.log('market allowance', xxxx.toString());


  const ownerOf = await media.ownerOf(tokenId);
  console.log(`ownerof:${ownerOf}; bidder:${bidder.address}`);

  // @USER This needs to be set by the user
  const bid = {
    amount: bidAmount,
    currency: wethAddress, // localhost WETH contract address
    bidder: bidder.address,
    recipient: bidder.address,
    sellOnShare: Decimal.from(0)
  };

  console.log('Setting bid', bid);
  const tx = await media.setBid(tokenId, bid);
  const r = await tx.wait();
  console.log(r);

  console.log("Bid set");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

