import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";

export function getTokenIdFromCid(cid: string): string {
  const encoded = ethers.utils.defaultAbiCoder.encode(["string"], [cid]);
  const hashed = ethers.utils.keccak256(encoded);
  const tokenId = BigNumber.from(hashed);

  return tokenId.toString();
}
