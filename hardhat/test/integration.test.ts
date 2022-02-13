import { ethers, waffle } from "hardhat";
import { BigNumber, Wallet } from "ethers";
import { ClipIt } from "../typechain/ClipIt";
import { Market } from "../typechain/Market";
import { BaseERC20 } from "../typechain/BaseERC20";

import { sha256, toUtf8Bytes } from "ethers/lib/utils";
import { AuctionHouse, WETH } from "../typechain";
import { expect } from "chai";
import { Decimal, generateSignature } from "../lib";

describe("AuctionHouse", function () {
  let tokenContract: ClipIt;
  let marketContract: Market;
  let auctionContract: AuctionHouse;
  let deployer: Wallet, owner: Wallet, bidder: Wallet, bidder2: Wallet;
  let wethContract: WETH;
  let currencyContract: BaseERC20;
  let wethAddress: string;

  const clipCID = "clipCID";
  const tid = BigNumber.from("0");

  const mtdt =
    '{"name":"Almost again","description":"streamer playing game","external_url":"https://foo.bar/nft/id","image":"ipfs://bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku","cid":"bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku","attributes":[{"trait_type":"Game","value":"name of game"},{"trait_type":"Streamer","value":"name of streamer"}]}';
  const metadataURI = "ipfs://metadataCid";
  const metadataHash = sha256(toUtf8Bytes(mtdt));
  const tokenURI = `ipfs://${clipCID}`;
  const contentHash = sha256(toUtf8Bytes("content"));

  const oneDay = 24 * 60 * 60;
  const oneEther = ethers.utils.parseEther("1");

  async function deployWeth() {
    const factory = await ethers.getContractFactory("WETH");
    wethContract = (await factory.deploy()) as WETH;
    return wethContract.address;
  }

  async function deployCurrency(owner: Wallet) {
    const factory = await ethers.getContractFactory("BaseERC20", { signer: owner });
    currencyContract = (await factory.deploy("test", "TEST", 18)) as BaseERC20;
    return currencyContract.address;
  }

  async function setupToken(owner: Wallet) {
    const sig = await generateSignature(deployer, contentHash, owner.address);
    const data = {
      tokenURI,
      metadataURI,
      contentHash,
      metadataHash,
    };
    const shares = {
      creator: Decimal.from(10),
      owner: Decimal.from(90),
      prevOwner: Decimal.from(0),
    };

    const ownerCaller = tokenContract.connect(owner);
    await ownerCaller.mint(data, shares, sig.v, sig.r, sig.s);
    await ownerCaller.approve(auctionContract.address, tid);
  }

  async function setupAuction(currency: string) {
    const auctionCaller = auctionContract.connect(owner);
    await auctionCaller.createAuction(
      tid,
      tokenContract.address,
      oneDay,
      "0",
      ethers.constants.AddressZero,
      "0",
      currency
    );
  }

  async function getAndApproveWeth(caller: Wallet, to: string, amount = oneEther) {
    const wethCaller = wethContract.connect(caller);
    await wethCaller.deposit({ value: amount });
    await wethCaller.approve(to, oneEther);
  }

  beforeEach(async () => {
    [deployer, owner, bidder, bidder2] = waffle.provider.getWallets();

    const marketFactory = await ethers.getContractFactory("Market", {
      signer: deployer,
    });
    marketContract = (await marketFactory.deploy()) as Market;

    const contractFactory = await ethers.getContractFactory("ClipIt", {
      signer: deployer,
    });
    tokenContract = (await contractFactory.deploy(marketContract.address)) as ClipIt;

    await marketContract.configure(tokenContract.address);

    wethAddress = await deployWeth();

    const auctionFactory = await ethers.getContractFactory("AuctionHouse", {
      signer: deployer,
    });
    auctionContract = (await auctionFactory.deploy(tokenContract.address, wethAddress)) as AuctionHouse;

    // mint and approve for auction
    await setupToken(owner);
  });

  it("auction in weth", async () => {
    await setupAuction(wethAddress);

    // swap & approve WETH
    await getAndApproveWeth(bidder, auctionContract.address);

    // bid
    await auctionContract.connect(bidder).createBid("0", oneEther, { value: oneEther });

    await ethers.provider.send("evm_increaseTime", [oneDay]);

    await auctionContract.connect(owner).endAuction("0");

    const ownerBalance = await wethContract.balanceOf(owner.address);
    // owner === creator => ownerShare + creatorShare - deployerShare => 1 * (0.9 + 0.1 - 0.9*0.01) = 0,991ETH
    expect(ownerBalance.toString()).eql(oneEther.mul(991).div(1000).toString());

    const bidderBalance = await wethContract.balanceOf(bidder.address);
    expect(bidderBalance.toString()).eql(BigNumber.from(0).toString());
    expect(await tokenContract.ownerOf(tid)).eql(bidder.address);
  });

  it("auction in erc20", async () => {
    // setup ERC20 token, mint and approve
    await deployCurrency(bidder);
    await currencyContract.mint(bidder.address, oneEther);
    const erc20Caller = currencyContract.connect(bidder);
    await erc20Caller.approve(auctionContract.address, oneEther);

    await setupAuction(currencyContract.address);

    // bid
    await auctionContract.connect(bidder).createBid("0", oneEther, { value: oneEther });

    // move forward in time until auction expires
    await ethers.provider.send("evm_increaseTime", [oneDay]);

    await auctionContract.connect(owner).endAuction("0");

    const balance = await currencyContract.balanceOf(owner.address);
    expect(balance.toString()).eql(oneEther.mul(991).div(1000).toString());

    const bidderBalance = await currencyContract.balanceOf(bidder.address);
    expect(bidderBalance.toString()).eql(BigNumber.from(0).toString());
    expect(await tokenContract.ownerOf(tid)).eql(bidder.address);
  });

  it("auction in native ETH", async () => {
    await setupAuction(ethers.constants.AddressZero);

    // bid
    await auctionContract.connect(bidder).createBid("0", oneEther, { value: oneEther });

    // move forward in time until auction expires
    await ethers.provider.send("evm_increaseTime", [oneDay]);

    const ownerBalanceBefore = await owner.getBalance();

    await auctionContract.connect(owner).endAuction("0");

    const ownerBalanceAfter = await owner.getBalance();
    // just make sure balance increased
    expect(ownerBalanceAfter.gt(ownerBalanceBefore)).eql(true);
    expect(await tokenContract.ownerOf(tid)).eql(bidder.address);
  });

  it("market bid persists through auction cycle from active to finished", async () => {
    // get WETH and approve Market contract
    await getAndApproveWeth(bidder, marketContract.address);

    const marketBid = {
      amount: oneEther,
      currency: wethAddress,
      bidder: bidder.address,
      recipient: bidder.address,
      sellOnShare: Decimal.from(0),
    };
    // set market bid
    await tokenContract.connect(bidder).setBid(tid, marketBid);

    //
    await setupAuction(wethAddress);

    // get WETH and approve auction for second bidder
    await getAndApproveWeth(bidder2, auctionContract.address);
    // bid on auction as bidder2
    await auctionContract.connect(bidder2).createBid("0", oneEther, { value: oneEther });

    await ethers.provider.send("evm_increaseTime", [oneDay]);
    await auctionContract.connect(owner).endAuction("0");

    // auction ended -> bidder2 is owner of token
    const newOwner = await tokenContract.ownerOf(tid);
    expect(newOwner).eql(bidder2.address);

    // bidder2 can now accept bid
    await tokenContract.connect(bidder2).acceptBid(tid, marketBid);

    const latestOwner = await tokenContract.ownerOf(tid);
    expect(latestOwner).eql(bidder.address);
  });
});
