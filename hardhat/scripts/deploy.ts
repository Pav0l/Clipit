import { ethers, network } from "hardhat";
import { writeFileSync } from "fs";
import deployments from '../deployment.json'
import { getSignerWallet, DEPLOYMENT_FILE_PATH, ETHERSCAN_ARGS_FILE_PATH, CONTRACT_NAME } from "../lib";


async function main() {
  const signer = getSignerWallet();

  console.log(`Deploying contract from address`, signer.address);

  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`Address balance ${ethers.utils.formatEther(balance)} ETH`);

  const ContractFactory = await ethers.getContractFactory(CONTRACT_NAME, { signer });
  const estimatedGas = await signer.estimateGas(ContractFactory.getDeployTransaction());
  console.log(`estimated gas`, estimatedGas.toString());

  const factoryaaddr = await ContractFactory.signer.getAddress()

  let balanceF = await ethers.provider.getBalance(factoryaaddr);
  console.log(`Address ${factoryaaddr} balance ${ethers.utils.formatEther(balanceF)} ETH`);

  console.log('Deploying...')
  const contract = await ContractFactory.deploy();

  console.log(`Waiting for the contract to be deployed...`);
  console.log(`Check progress on EtherScan by searching: ${contract.address}`)
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  console.log("Updating deployment file and etherscan args file...");

  const provider = network.name;

  const data = JSON.stringify({
    ...deployments,
    [provider]: {
      /* TODO ADD RELEVANT DATA FOR DEPLOYMENT FILE */
      address: contract.address,
    },
  }, null, 2);

  writeFileSync(DEPLOYMENT_FILE_PATH, data);

  const etherscanArgs = `module.exports = [
    ${/* TODO ETHERSCAN ARGS */''},
  ];`

  writeFileSync(ETHERSCAN_ARGS_FILE_PATH, etherscanArgs);

  console.log("Don't forget to update npm scripts & docs with new contract address");
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
