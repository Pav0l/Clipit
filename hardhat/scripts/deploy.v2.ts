import { ethers } from "hardhat";
import { getSignerWallet, CONTRACT_NAME, writeDeploymentAddresses, getWETHAddress } from "../lib";


async function main() {
  const deployer = getSignerWallet();
  const network = await ethers.provider.getNetwork();
  console.log("Init deployment flow from address:", deployer.address);

  const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.utils.formatEther(deployerBalanceBefore), "ETH");

  // Market
  console.log(`Deploying Market contract to ${network.name}(${network.chainId})...`);
  const MarketFactory = await ethers.getContractFactory("Market", { signer: deployer });
  const market = await MarketFactory.deploy();

  console.log("Waiting for the Market contract to be deployed. tx hash:", market.deployTransaction.hash);
  console.log("gas limit & gas price of the tx:", market.deployTransaction.gasLimit.toString(), market.deployTransaction.gasPrice?.toString())
  await market.deployed();
  console.log("Market contract deployed to:", market.address);

  const deployerBalanceAfterMarket = await ethers.provider.getBalance(deployer.address);
  console.log("Market deployment cost", ethers.utils.formatEther(deployerBalanceBefore.sub(deployerBalanceAfterMarket)), "ETH");

  // Token
  console.log(`Deploying ClipIt token contract...`);
  const TokenFactory = await ethers.getContractFactory(CONTRACT_NAME, { signer: deployer });
  const token = await TokenFactory.deploy(market.address);

  console.log("Waiting for ClipIt to be deployed...", token.deployTransaction.hash);
  console.log("gas limit & gas price", token.deployTransaction.gasLimit.toString(), token.deployTransaction.gasPrice?.toString())
  await token.deployed();
  console.log("ClipIt deployed to:", token.address);

  const deployerBalanceAfterToken = await ethers.provider.getBalance(deployer.address);
  console.log("Token deployment cost", ethers.utils.formatEther(deployerBalanceAfterMarket.sub(deployerBalanceAfterToken)), "ETH");


  console.log("Configuring media token address to Market contract");
  await market.configure(token.address);

  // Auction House
  console.log(`Deploying Auction House contract...`);
  const wethAddress = await getWETHAddress();

  const AuctionFactory = await ethers.getContractFactory("AuctionHouse", { signer: deployer });
  const auction = await AuctionFactory.deploy(token.address, wethAddress);

  console.log("Waiting for Auction House to be deployed...", auction.deployTransaction.hash);
  console.log("gas limit & gas price", auction.deployTransaction.gasLimit.toString(), auction.deployTransaction.gasPrice?.toString())
  await auction.deployed();
  console.log("Auction House deployed to:", auction.address);

  const deployerBalanceAfterAuction = await ethers.provider.getBalance(deployer.address);
  console.log("Auction deployment cost", ethers.utils.formatEther(deployerBalanceAfterToken.sub(deployerBalanceAfterAuction)), "ETH");


  console.log("Total deployment cost:", ethers.utils.formatEther(deployerBalanceBefore.sub(deployerBalanceAfterAuction)), "ETH")
  console.log("Storing contract addresses to deployment file...");
  writeDeploymentAddresses(market.address, token.address, auction.address, wethAddress, network.chainId);

  console.log("Done!");
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
