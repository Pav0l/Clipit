
import fs from "fs";
import { ethers } from "hardhat";


export function writeDeploymentAddresses(marketAddress: string, contractAddress: string, chainId: number) {
  const data = JSON.stringify({
    [Contract.MARKET]: marketAddress,
    [Contract.TOKEN]: contractAddress
  }, null, 2);

  fs.writeFileSync(getDeploymentFilePath(chainId), data);
}

export async function getMarketAddress(): Promise<string> {
  return getContractAddress(Contract.MARKET);
}

export async function getTokenAddress(): Promise<string> {
  return getContractAddress(Contract.TOKEN);
}

enum Contract {
  MARKET = "market",
  TOKEN = "token"
};

/**
 * getContractAddress returns address of market or token contract 
 * based on the network it's called on (main/testnets/hardhat/...)
 */
async function getContractAddress(contract: Contract): Promise<string> {
  const { chainId } = await ethers.provider.getNetwork();
  const filePath = getDeploymentFilePath(chainId);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment file for network ${chainId} does not exist`);
  }

  let data: any;
  try {
    data = fs.readFileSync(filePath);
  } catch (error) {
    console.log(error);
    throw new Error(`FAILED TO READ DEPLOYMENT FILE FROM ${filePath}`);
  }

  let deployment: { "market": string; "token": string } | undefined;
  if (data) {
    try {
      deployment = JSON.parse(data);
    } catch (error) {
      console.log("data:", data);
      console.log(error);
      throw new Error(`INVALID JSON FORMAT IN ${filePath}`);
    }
    if (!deployment) {
      throw new Error(`Empty deployment file in ${filePath}`);
    }

    const contractAddress = deployment[contract];
    if (!contractAddress) {
      throw new Error(`Missing $${contract} contract deployment in ${filePath}`);
    }

    return contractAddress;
  }

  throw new Error(`Empty deployment file in ${filePath}`);
}

function getDeploymentFilePath(chainId: number) {
  return `deployments/${chainId}.json`;
}


