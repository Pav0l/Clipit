import { ethers } from "hardhat";
import { getSignerWallet } from "../lib/";

const signer = getSignerWallet();
const TO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ETHER_VALUE = "5";

async function main() {
  console.log(`Sending transaction from ${signer.address} to ${TO_ADDRESS} with value: ${ETHER_VALUE}`)

  const tx = await signer.sendTransaction({
    to: TO_ADDRESS,
    value: ethers.utils.parseEther(ETHER_VALUE)
  });

  console.log("transaction pending:", tx.hash);
  tx.wait();
  console.log("done!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
