import { ethers } from "hardhat";
import { getMarketAddress, getSignerWallet, getWETHAddress } from "../../lib";
import { WETH } from "../../typechain";
const WETHContract = require("../../artifacts/contracts/tests/WETH.sol/WETH.json");

const ONE_ETH = ethers.utils.parseUnits("1", "ether");

async function main() {
  const wethAddress = await getWETHAddress();
  const marketAddress = "0x85e946e1Bd35EC91044Dc83A5DdAB2B6A262ffA6"; // Zora Market address on Rinkeby

  const signer = await getSignerWallet();
  const weth = (new ethers.Contract(wethAddress, WETHContract.abi, signer)) as WETH;

  let approved = await weth.allowance(signer.address, marketAddress);
  console.log('WETH allowance of Market contract from Signer', approved.toString());

  const balance = await weth.balanceOf(signer.address);
  console.log(`${signer.address} WETH balance is: ${balance}`);
  console.log('1ETH', ethers.utils.parseUnits("1", "ether"));

  console.log(`Approving ${marketAddress} the allowance for ${signer.address}`);
  const tx = await weth.approve(marketAddress, ONE_ETH);

  const r = await tx.wait();
  console.log('tx receipt:', r);

  approved = await weth.allowance(signer.address, marketAddress);
  console.log('WETH allowance of Market contract from Signer', approved.toString());


  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

