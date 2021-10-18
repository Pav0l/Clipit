import { getSignerWallet, generateSignature } from "../lib";


const cid = "";
const address = "";

async function main() {
  const signer = getSignerWallet();

  if (!cid) {
    throw new Error("Missing cid to generate signature");
  }

  if (!address) {
    throw new Error("Missing address to generate signature");
  }

  const signature = await generateSignature(signer, cid, address);

  console.log("signature:", signature);
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
