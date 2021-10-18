import { Wallet, Signature } from "ethers";
import { keccak256, toUtf8Bytes, hashMessage, arrayify } from "ethers/lib/utils";


/**
 * generateSignature generates ECDSA signature from Ethereum Signed Message
 * 
 * The message consists of Keccak 256 hash of ${cid}${address} Uint8Array, which is then prefixed
 * with `\x19Ethereum Signed Message:\n` message and hashed again with Keccak 256.
 * 
 * This Ethereum Signed Message hash is then signed by signers private key and generates ECDSA signature,
 * which is used in contract to verify if an address is allowed to mint a clip with supplied CID.
 * 
 * @param signer - account address of the contract owner 
 * @param cid - IPFS content identifier of the clip metadata
 * @param address - account address of user who wants to mint a clip
 * @returns ECDSA signature promise which r, s, and v attributes are used to call the contracts `mint` function
 */
export async function generateSignature(signer: Wallet, cid: string, address: string): Promise<Signature> {
  const cidBytes = toUtf8Bytes(cid);
  const addressBytes = arrayify(address);
  const msg = [...cidBytes, ...addressBytes];

  const msgHash = keccak256(msg);
  const msgHashBytes = arrayify(msgHash);

  const ethPrefixedMsgHash = hashMessage(msgHashBytes);

  return signer._signingKey().signDigest(ethPrefixedMsgHash);;
}