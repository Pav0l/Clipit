import { ethers, network } from "hardhat";
import { writeFileSync } from "fs";
import deployments from "../deployment.json";
import { getSignerWallet, DEPLOYMENT_FILE_PATH, CONTRACT_NAME } from "../lib";


async function main() {
  const deployer = getSignerWallet();
  console.log("Init deployment flow from address:", deployer.address);

  const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);
  console.log(ethers.utils.formatEther(deployerBalanceBefore), "ETH");

  console.log("Deploying Market contract...");
  const MarketFactory = await ethers.getContractFactory("Market", { signer: deployer });
  const market = await MarketFactory.deploy();
  console.log("Waiting for the Market contract to be deployed...", market.deployTransaction.hash);
  console.log("gas limit & gas price", market.deployTransaction.gasLimit.toString(), market.deployTransaction.gasPrice?.toString())

  await market.deployed();
  console.log("Market contract deployed to:", market.address);

  const deployerBalanceAfterMarket = await ethers.provider.getBalance(deployer.address);
  console.log(ethers.utils.formatEther(deployerBalanceAfterMarket), "ETH");
  console.log("Market deployment cost", ethers.utils.formatEther(deployerBalanceBefore.sub(deployerBalanceAfterMarket)), "ETH");


  console.log(`Deploying ClipIt`);
  const ContractFactory = await ethers.getContractFactory(CONTRACT_NAME, { signer: deployer });
  const contract = await ContractFactory.deploy(market.address);

  console.log("Waiting for ClipIt to be deployed...", contract.deployTransaction.hash);
  console.log("gas limit & gas price", contract.deployTransaction.gasLimit.toString(), contract.deployTransaction.gasPrice?.toString())
  await contract.deployed();
  console.log("ClipIt deployed to:", contract.address);


  const deployerBalanceAfterToken = await ethers.provider.getBalance(deployer.address);
  console.log(ethers.utils.formatEther(deployerBalanceAfterMarket), "ETH");
  console.log("Token deployment cost", ethers.utils.formatEther(deployerBalanceAfterMarket.sub(deployerBalanceAfterToken)), "ETH");

  console.log("Total deployment cost:", ethers.utils.formatEther(deployerBalanceBefore.sub(deployerBalanceAfterToken)), "ETH")

  console.log("Configuring media contract address to Market contract");
  await market.configure(contract.address);


  const network = await ethers.provider.getNetwork();
  console.log("chainId", network.chainId);

  console.log("Done!")
  // const provider = network.name;

  // console.log(`Savig deployment to: ${DEPLOYMENT_FILE_PATH} for provider network: ${provider}`);
  // console.log("Previous deployment.json", JSON.stringify(deployments, null, 2));

  // const data = JSON.stringify({
  //   ...deployments,
  //   [provider]: {
  //     address: contract.address,
  //     /* TODO - STORE ANY RELEVANT DATA */
  //   },
  // }, null, 2);

  // writeFileSync(DEPLOYMENT_FILE_PATH, data);
  // console.log("Current deployment.json", data);

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
