import { ethers } from "hardhat";
import { getSignerWallet } from "../lib";


async function main() {
  const deployer = getSignerWallet();
  const network = await ethers.provider.getNetwork();

  if (network.chainId !== 31337) {
    throw new Error(`Do not deploy WETH outside local network`);
  }

  console.log("Init deployment flow from address:", deployer.address);

  // WETH
  console.log(`Deploying WETH contract to ${network.name}(${network.chainId})...`);
  const WETH_Factory = await ethers.getContractFactory("WETH", { signer: deployer });
  const weth = await WETH_Factory.deploy();
  await weth.deployed();

  console.log("WETH contract deployed to:", weth.address);

  console.log("Done!")
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
