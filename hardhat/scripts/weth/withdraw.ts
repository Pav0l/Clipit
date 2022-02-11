import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getSignerWallet, getWETHAddress } from "../../lib";
import { WETH } from "../../typechain";
const WETHContract = require("../../artifacts/contracts/tests/WETH.sol/WETH.json");

const AMOUNT = parseUnits("1", "ether");

async function main() {
  const wethAddress = await getWETHAddress();

  const signer = await getSignerWallet();
  const weth = new ethers.Contract(wethAddress, WETHContract.abi, signer) as WETH;

  let balance = await ethers.provider.getBalance(signer.address);
  console.log("Signer ETH balance:", balance.toString());
  let wethBalance = await weth.balanceOf(signer.address);
  console.log(`Signer WETH balance:${wethBalance.toString()}`);

  if (wethBalance.lte(AMOUNT)) {
    throw new Error(`Signers WETH balance is lower then the amount you're trying to withdraw`);
  }

  console.log(`Withdrawing ${AMOUNT.toString()}wei from WETH at ${wethAddress} to ${signer.address}`);
  const tx = await weth.withdraw(AMOUNT);

  console.log("transaction:", tx);

  const receipt = await tx.wait();

  console.log("receipt", receipt);

  wethBalance = await weth.balanceOf(signer.address);
  console.log(`Signer WETH balance:${wethBalance.toString()}`);
  balance = await ethers.provider.getBalance(signer.address);
  console.log("Signer ETH balance:", balance.toString());

  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
