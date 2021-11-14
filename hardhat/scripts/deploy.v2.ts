import { ethers } from "hardhat";
import { getSignerWallet, CONTRACT_NAME, writeDeploymentAddresses } from "../lib";


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
  const ContractFactory = await ethers.getContractFactory(CONTRACT_NAME, { signer: deployer });
  const contract = await ContractFactory.deploy(market.address);

  console.log("Waiting for ClipIt to be deployed...", contract.deployTransaction.hash);
  console.log("gas limit & gas price", contract.deployTransaction.gasLimit.toString(), contract.deployTransaction.gasPrice?.toString())
  await contract.deployed();
  console.log("ClipIt deployed to:", contract.address);

  const deployerBalanceAfterToken = await ethers.provider.getBalance(deployer.address);
  console.log("Token deployment cost", ethers.utils.formatEther(deployerBalanceAfterMarket.sub(deployerBalanceAfterToken)), "ETH");

  console.log("Total deployment cost:", ethers.utils.formatEther(deployerBalanceBefore.sub(deployerBalanceAfterToken)), "ETH")

  console.log("Configuring media contract address to Market contract");
  await market.configure(contract.address);

  console.log("Storing contract addresses to deployment file...");
  writeDeploymentAddresses(market.address, contract.address, network.chainId);

  console.log("Done!")
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
