import { BytesLike, BigNumber, BigNumberish } from "ethers";
import { keccak256, arrayify, toUtf8Bytes, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getSignerWallet, getTokenAddress, generateSignature, getWETHAddress, Decimal, getMarketAddress } from "../lib";
import { ClipIt } from "../typechain/ClipIt";
import { WETH } from "../typechain";
const Contract = require("../artifacts/contracts/ClipIt.sol/ClipIt.json");
const WETHContract = require("../artifacts/contracts/tests/WETH.sol/WETH.json");

const tokenCid = "tokenCID" + Date.now().toString();
const metadataCid = "metadataCID" + Date.now().toString();

const metadataURI = `ipfs://${metadataCid}`;
const metadataHash = keccak256(toUtf8Bytes(metadataCid));
const metadataHashBytes = arrayify(metadataHash);

const tokenURI = `ipfs://${tokenCid}`;
const contentHash = keccak256(toUtf8Bytes(tokenCid));
const contentHashBytes = arrayify(contentHash);

interface ClipData {
  tokenURI: string;
  metadataURI: string;
  contentHash: BytesLike;
  metadataHash: BytesLike;
}
interface BidShares {
  prevOwner: { value: BigNumberish };
  creator: { value: BigNumberish };
  owner: { value: BigNumberish };
}

const mintData: ClipData = {
  tokenURI,
  metadataURI,
  contentHash: contentHashBytes,
  metadataHash: metadataHashBytes,
};

const bidShares: BidShares = {
  prevOwner: Decimal.from(0),
  creator: Decimal.from(5),
  owner: Decimal.from(95),
};

const creator = new ethers.Wallet(process.env["RINKEBY_CREATOR_PK"]!, ethers.provider);
const bidder1 = new ethers.Wallet(process.env["RINKEBY_BIDDER1_PK"]!, ethers.provider);
const bidder2 = new ethers.Wallet(process.env["RINKEBY_BIDDER2_PK"]!, ethers.provider);
const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000002";

async function main() {
  const contractAddress = await getTokenAddress();
  const contractOwner = getSignerWallet();

  const contract = new ethers.Contract(contractAddress, Contract.abi, creator) as ClipIt;

  console.log("generating signature...");
  const signature = await generateSignature(contractOwner, contentHash, creator.address);

  console.log("minting CLIP...");
  let tx = await contract.mint(mintData, bidShares, BigNumber.from(signature.v), signature.r, signature.s);
  const receipt = await tx.wait();

  console.log("mint done...");
  if (receipt.events) {
    receipt.events.forEach((ev) => {
      console.log("Transfer event topics:");
      console.log("from:", ev.topics[1]);
      console.log("to:", ev.topics[2]);
      console.log("tokenId:", ev.topics[3]);
    });
  }

  const wethAddress = await getWETHAddress();
  const ask = {
    amount: parseUnits("0.3", "ether"),
    currency: wethAddress,
  };

  console.log(`Setting ask for token:${tokenId}`, ask);
  tx = await contract.setAsk(tokenId, ask);
  await tx.wait();

  console.log("Ask set!");

  const marketAddress = await getMarketAddress();

  const bidder1Contract = new ethers.Contract(contractAddress, Contract.abi, bidder1) as ClipIt;
  const currencyBidder1 = new ethers.Contract(wethAddress, WETHContract.abi, bidder1) as WETH;

  const bidder2Contract = new ethers.Contract(contractAddress, Contract.abi, bidder2) as ClipIt;
  const currencyBidder2 = new ethers.Contract(wethAddress, WETHContract.abi, bidder2) as WETH;

  console.log("approving Market for WETH...");
  const bidAmount = parseUnits("0.2", "ether");
  tx = await currencyBidder1.approve(marketAddress, ethers.constants.MaxUint256);
  await tx.wait();
  console.log("depositing WETH...");
  tx = await currencyBidder1.deposit({ value: bidAmount });
  await tx.wait();

  const bidder1CurrencyBalance = await currencyBidder1.balanceOf(bidder1.address);
  console.log(`Balance of bidder1 ${bidder1.address}`, bidder1CurrencyBalance.toString());
  const bidder1allowance = await currencyBidder1.allowance(bidder1.address, marketAddress);
  console.log("Allowance of bidder1", bidder1allowance.toString());
  const ownerOf = await contract.ownerOf(tokenId);
  console.log(`ownerof:${ownerOf}; bidder1:${bidder1.address}`);

  const bid = {
    amount: bidAmount,
    currency: wethAddress,
    bidder: bidder1.address,
    recipient: bidder1.address,
    sellOnShare: Decimal.from(0),
  };

  console.log("setting bid for bidder1...");

  const bid1 = await bidder1Contract.setBid(tokenId, bid);
  console.log(bid1);
  console.log("Bid 1 set");

  console.log("approving Bidder2 and Market for WETH...");
  const bid2Amount = parseUnits("0.31", "ether");
  tx = await currencyBidder2.approve(marketAddress, ethers.constants.MaxUint256);
  await tx.wait();
  console.log("depositing WETH...", bid2Amount);
  tx = await currencyBidder2.deposit({ value: bid2Amount });
  await tx.wait();

  const bidder2CurrencyBalance = await currencyBidder2.balanceOf(bidder2.address);
  console.log(`Balance of bidder 2 ${bidder2.address}`, bidder2CurrencyBalance.toString());
  const bidder2Allowance = await currencyBidder2.allowance(bidder2.address, marketAddress);
  console.log("Allowance of bidder 2", bidder2Allowance.toString());

  const bid2 = {
    amount: bid2Amount,
    currency: wethAddress,
    bidder: bidder2.address,
    recipient: bidder2.address,
    sellOnShare: Decimal.from(0),
  };

  console.log("setting bid for bidder2...");

  const createdBid2 = await bidder2Contract.setBid(tokenId, bid2);
  console.log(createdBid2);

  console.log("Bid 2 set");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
