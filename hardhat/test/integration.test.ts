import { ethers, waffle } from "hardhat";
import { BigNumber, Wallet } from "ethers";
import { ClipIt } from "../typechain/ClipIt";
import { Market } from "../typechain/Market";
import { BaseERC20 } from "../typechain/BaseERC20";

import { sha256, toUtf8Bytes } from "ethers/lib/utils";
import { AuctionHouse, WETH } from "../typechain";
import { expect } from "chai";
import { Decimal, generateSignatureV2 } from "../lib";

describe.only("AuctionHouse", function () {
  let tokenContract: ClipIt;
  let marketContract: Market;
  let auctionContract: AuctionHouse;
  let deployer: Wallet, owner: Wallet, three: Wallet, four: Wallet;
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
    const sig = await generateSignatureV2(deployer, contentHash, owner.address);
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
    return auctionCaller;
  }

  beforeEach(async () => {
    [deployer, owner, three, four] = waffle.provider.getWallets();

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
  });

  it("auction in weth", async () => {
    // mint and approve for auction
    await setupToken(owner);

    const auctionCaller = await setupAuction(wethAddress);

    // swap & approve WETH
    const wethCaller = wethContract.connect(three);
    await wethCaller.deposit({ value: oneEther });
    await wethCaller.approve(auctionContract.address, oneEther);
    // bid
    const bidder = auctionContract.connect(three);
    await bidder.createBid("0", oneEther, { value: oneEther });

    await ethers.provider.send("evm_increaseTime", [oneDay]);

    await auctionCaller.endAuction("0");

    const ownerBalance = await wethCaller.balanceOf(owner.address);
    // owner === creator => ownerShare + creatorShare - deployerShare => 1 * (0.9 + 0.1 - 0.9*0.01) = 0,991ETH
    expect(ownerBalance.toString()).eql(oneEther.mul(991).div(1000).toString());

    const bidderBalance = await wethCaller.balanceOf(bidder.address);
    expect(bidderBalance.toString()).eql(BigNumber.from(0).toString());
    expect(await tokenContract.ownerOf(tid)).eql(three.address);
  });

  it("auction in erc20", async () => {
    await setupToken(owner);

    const oneEther = ethers.utils.parseEther("1");

    // setup ERC20 token, mint and approve
    await deployCurrency(three);
    await currencyContract.mint(three.address, oneEther);
    const erc20Caller = currencyContract.connect(three);
    await erc20Caller.approve(auctionContract.address, oneEther);

    const auctionCaller = await setupAuction(currencyContract.address);

    // bid
    const bidder = auctionContract.connect(three);
    await bidder.createBid("0", oneEther, { value: oneEther });

    // move forward in time until auction expires
    await ethers.provider.send("evm_increaseTime", [oneDay]);

    await auctionCaller.endAuction("0");

    const balance = await currencyContract.balanceOf(owner.address);
    expect(balance.toString()).eql(oneEther.mul(991).div(1000).toString());

    const bidderBalance = await currencyContract.balanceOf(bidder.address);
    expect(bidderBalance.toString()).eql(BigNumber.from(0).toString());
    expect(await tokenContract.ownerOf(tid)).eql(three.address);
  });

  it("auction in native ETH", async () => {
    await setupToken(owner);
    const auctionCaller = await setupAuction(ethers.constants.AddressZero);

    // bid
    await auctionContract.connect(three).createBid("0", oneEther, { value: oneEther });

    // move forward in time until auction expires
    await ethers.provider.send("evm_increaseTime", [oneDay]);

    const ownerBalanceBefore = await owner.getBalance();

    await auctionCaller.endAuction("0");

    const ownerBalanceAfter = await owner.getBalance();
    // just make sure balance increased
    expect(ownerBalanceAfter.gt(ownerBalanceBefore)).eql(true);
    expect(await tokenContract.ownerOf(tid)).eql(three.address);
  });
});
