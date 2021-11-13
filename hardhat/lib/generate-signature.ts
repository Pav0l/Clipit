import { Wallet, Signature, BigNumberish, BytesLike } from "ethers";
import { keccak256, toUtf8Bytes, hashMessage, arrayify, splitSignature } from "ethers/lib/utils";
import { signTypedData } from 'eth-sig-util';
import { ClipIt, ClipIt__factory } from "../typechain";


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

export async function generateSignatureV2(signer: Wallet, contentHash: string, address: string): Promise<Signature> {
  const contentBytes = arrayify(contentHash);
  const addressBytes = arrayify(address);

  const msg = [...contentBytes, ...addressBytes];
  const msgHash = keccak256(msg);
  const msgHashBytes = arrayify(msgHash);

  const ethPrefixedMsgHash = hashMessage(msgHashBytes);

  return signer._signingKey().signDigest(ethPrefixedMsgHash);
}


const defaultDeadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
export async function signPermit(
  owner: Wallet,
  spender: string,
  tokenAddress: string,
  tokenId: number,
  chainId: number,
  deadline: number = defaultDeadline
): Promise<{
  deadline: BigNumberish;
  v: BigNumberish;
  r: BytesLike;
  s: BytesLike;
} | void> {
  try {
    const contract = ClipIt__factory.connect(tokenAddress, owner)
    const nonce = await (await contract.permitNonces(owner.address, tokenId)).toNumber();
    const name = await contract.name();

    const signedData = signTypedData(Buffer.from(owner.privateKey.slice(2), 'hex'), {
      data: {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Permit: [
            { name: 'spender', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        domain: {
          name,
          version: '1',
          chainId,
          verifyingContract: contract.address
        },
        message: {
          spender,
          tokenId,
          nonce,
          deadline
        }
      }
    });

    const sig = splitSignature(signedData);

    return {
      r: sig.r,
      s: sig.s,
      v: sig.v,
      deadline: deadline.toString(),
    };

  } catch (error) {
    console.log('generateSignedTypedData:err:', error);
    throw new Error('Unable to generate eth_signTypedData signature');
  }
}
