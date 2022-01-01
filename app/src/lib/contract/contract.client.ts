import { ethers, BigNumberish, BytesLike } from "ethers";

import ContractBuild from "./ClipIt.json";
import { ClipIt } from "./ClipIt";
import { contractAddress } from "../constants";


interface MediaData {
  tokenURI: string;
  metadataURI: string;
  contentHash: BytesLike;
  metadataHash: BytesLike;
}

interface BidShares {
  prevOwner: { value: BigNumberish };
  creator: { value: BigNumberish };
  owner: { value: BigNumberish };
}

interface Signature {
  v: BigNumberish,
  r: BytesLike,
  s: BytesLike,
}
export default class ContractClient {
  private contract: ClipIt;

  constructor(signer: ethers.providers.JsonRpcSigner) {
    this.contract = (new ethers.Contract(contractAddress, ContractBuild.abi, signer)) as ClipIt;
  }

  async mint(data: MediaData, bidShares: BidShares, signature: Signature) {
    return this.contract.mint(data, bidShares, signature.v, signature.r, signature.s);
  }

  async getTokenMetadataURI(tokenId: string): Promise<string> {
    return this.contract.tokenMetadataURI(tokenId);
  }
}
