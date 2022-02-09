import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getWETHAddress, getSignerWallet } from "../../lib";
import { ZoraMedia } from "../../typechain/ZoraMedia";
const Contract = require("../../artifacts/contracts/zora/Media.sol/ZoraMedia.json");

const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  const mediaAddress = "0x998abeb3E57409262aE5b751f60747921B33613E";
  const wethAddress = await getWETHAddress();

  const signer = getSignerWallet();
  const media = new ethers.Contract(mediaAddress, Contract.abi, signer) as ZoraMedia;

  // @USER This needs to be set by the user
  const ask = {
    amount: parseUnits("1", "ether"),
    currency: wethAddress, // localhost WETH contract address
  };

  console.log(`Setting ask for token:${tokenId}`, ask);
  const tx = await media.setAsk(tokenId, ask);
  const r = await tx.wait();
  console.log(r);

  console.log("Ask set!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
