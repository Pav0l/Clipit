import { ethers, network } from "hardhat";
import { writeFileSync } from "fs";
import deployments from '../deployment.json';
import { getSignerWallet, DEPLOYMENT_FILE_PATH, CONTRACT_NAME } from "../lib";


async function main() {
  const signer = getSignerWallet();

  console.log(`Deploying contract from address`, signer.address);
  const ContractFactory = await ethers.getContractFactory(CONTRACT_NAME, signer);

  const contract = await ContractFactory.deploy(/* TODO */);

  console.log("Waiting for the contract to be deployed...");
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);

  const provider = network.name;

  console.log(`Savig deployment to: ${DEPLOYMENT_FILE_PATH} for provider network: ${provider}`);
  console.log("Previous deployment.json", JSON.stringify(deployments, null, 2));

  const data = JSON.stringify({
    ...deployments,
    [provider]: {
      address: contract.address,
      /* TODO - STORE ANY RELEVANT DATA */
    },
  }, null, 2);

  writeFileSync(DEPLOYMENT_FILE_PATH, data);
  console.log("Current deployment.json", data);

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
