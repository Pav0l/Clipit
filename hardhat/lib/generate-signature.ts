import { Wallet, Signature } from "ethers";
import { keccak256, hashMessage, arrayify } from "ethers/lib/utils";

export async function generateSignature(signer: Wallet, contentHash: string, address: string): Promise<Signature> {
  const contentBytes = arrayify(contentHash);
  const addressBytes = arrayify(address);

  const msg = [...contentBytes, ...addressBytes];
  const msgHash = keccak256(msg);
  const msgHashBytes = arrayify(msgHash);

  const ethPrefixedMsgHash = hashMessage(msgHashBytes);

  return signer._signingKey().signDigest(ethPrefixedMsgHash);
}
