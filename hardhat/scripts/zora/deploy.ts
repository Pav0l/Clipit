import { ethers } from "hardhat";
import { getSignerWallet } from "../../lib";

import type { ZoraMedia } from "../../contracts/zora/types/ZoraMedia";
const ZoraMediaContract = require("../../contracts/zora/contracts/Media/ZoraMedia.json");

import type { ZoraMarket } from "../../contracts/zora/types/ZoraMarket";
const ZoraMarketContract = require("../../contracts/zora/contracts/Market/ZoraMarket.json");

/**
 * Localhost deployment:
 * MEDIA:  0x998abeb3E57409262aE5b751f60747921B33613E
 * MARKET: 0x95401dc811bb5740090279Ba06cfA8fcF6113778
 *
 *
 * RINKEBY:
 * MEDIA: 0x7C2668BD0D3c050703CEcC956C11Bd520c26f7d4
 * MARKET: 0x85e946e1Bd35EC91044Dc83A5DdAB2B6A262ffA6
 * WETH: 0xc778417e063141139fce010982780140aa0cd5ab
 */

async function main() {
  const deployer = getSignerWallet();
  const network = await ethers.provider.getNetwork();
  console.log("Init deployment flow from address:", deployer.address);

  // Zora Market
  console.log(`Deploying Zora Market contract to ${network.name}(${network.chainId})...`);
  const MarketFactory = new ethers.ContractFactory(ZoraMarketContract.abi, ZoraMarketContract.bytecode, deployer);
  // const MarketFactory = await ethers.getContractFactory("ZoraMarket", { signer: deployer });
  const market = (await MarketFactory.deploy()) as ZoraMarket;

  console.log("Waiting for the Market contract to be deployed. tx hash:", market.deployTransaction.hash);
  await market.deployed();
  console.log("Zora Market contract deployed to:", market.address);

  // Media
  console.log(`Deploying Zora Media contract...`);
  // const MediaFactory = await ethers.getContractFactory("ZoraMedia", { signer: deployer });
  const MediaFactory = new ethers.ContractFactory(ZoraMediaContract.abi, ZoraMediaContract.bytecode, deployer);
  const media = (await MediaFactory.deploy(market.address)) as ZoraMedia;

  console.log("Waiting for Zora Media to be deployed...", media.deployTransaction.hash);
  await media.deployed();
  console.log("Zora Media deployed to:", media.address);

  console.log("Configuring Media contract address to Market contract");
  await market.configure(media.address);

  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
