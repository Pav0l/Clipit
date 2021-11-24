import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getSignerWallet, getWETHAddress } from "../../lib";
import { WETH } from "../../typechain";
const WETHContract = require("../../artifacts/contracts/tests/WETH.sol/WETH.json");



const ONE_ETH = parseUnits("3", "ether");

async function main() {
  const wethAddress = await getWETHAddress();

  const signer = await getSignerWallet();
  const weth = (new ethers.Contract(wethAddress, WETHContract.abi, signer)) as WETH;

  let balance = await ethers.provider.getBalance(signer.address);
  console.log('Signer ETH balance:', balance.toString());
  let wethBalance = await weth.balanceOf(signer.address);
  console.log(`Signer WETH balance:${wethBalance.toString()}`);


  console.log(`Depositing ${ONE_ETH.toString()}ETH to WETH at ${wethAddress} from ${signer.address}`);
  const tx = await weth.deposit({ value: ONE_ETH });

  console.log("transaction:", tx);

  const receipt = await tx.wait();

  console.log("receipt", receipt);

  wethBalance = await weth.balanceOf(signer.address);
  console.log(`Signer WETH balance:${wethBalance.toString()}`);
  balance = await ethers.provider.getBalance(signer.address);
  console.log('Signer ETH balance:', balance.toString());


  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

