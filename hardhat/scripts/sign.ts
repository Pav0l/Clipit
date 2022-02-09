import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { getSignerWallet, generateSignature, generateSignatureV2 } from "../lib";

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

  const sigV2 = await generateSignatureV2(signer, keccak256(toUtf8Bytes(cid)), address);
  console.log("signatureV2", sigV2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
