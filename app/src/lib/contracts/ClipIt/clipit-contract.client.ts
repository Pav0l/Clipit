import { ethers, BigNumberish, BytesLike } from "ethers";

import ContractBuild from "./ClipIt.json";
import { ClipIt } from "./ClipIt";
import { EthereumProvider } from "../../ethereum/ethereum.types";

export interface MediaData {
  tokenURI: string;
  metadataURI: string;
  contentHash: BytesLike;
  metadataHash: BytesLike;
}

export interface BidShares {
  prevOwner: { value: BigNumberish };
  creator: { value: BigNumberish };
  owner: { value: BigNumberish };
}

export interface Signature {
  v: BigNumberish;
  r: BytesLike;
  s: BytesLike;
}

export interface IClipItContractClient {
  mint: (data: MediaData, bidShares: BidShares, signature: Signature) => Promise<ethers.ContractTransaction>;
  getTokenMetadataURI: (tokenId: string) => Promise<string>;
  getTokenOwner: (tokenId: string) => Promise<string>;
  getApproved: (tokenId: string) => Promise<string>;
  approve: (to: string, tokenId: string) => Promise<ethers.ContractTransaction>;
}

class ClipItContractClient implements IClipItContractClient {
  private contract: ClipIt;

  constructor(provider: EthereumProvider, address: string) {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const jsonRpcSigner = ethersProvider.getSigner();
      this.contract = new ethers.Contract(address, ContractBuild.abi, jsonRpcSigner) as ClipIt;
    } catch (error) {
      // SENTRY
      console.log("[contract.client]:construct:error", error);
      throw new Error("Invalid ethereum provider");
    }
  }

  async approve(to: string, tokenId: string): Promise<ethers.ContractTransaction> {
    return this.contract.approve(to, tokenId);
  }

  async getApproved(tokenId: string): Promise<string> {
    return this.contract.getApproved(tokenId);
  }

  async mint(data: MediaData, bidShares: BidShares, signature: Signature) {
    return this.contract.mint(data, bidShares, signature.v, signature.r, signature.s);
  }

  async getTokenMetadataURI(tokenId: string): Promise<string> {
    return this.contract.tokenMetadataURI(tokenId);
  }

  async getTokenOwner(tokenId: string): Promise<string> {
    return this.contract.ownerOf(tokenId);
  }
}

export function ClipItContractCreator(provider: EthereumProvider, address: string): IClipItContractClient {
  return new ClipItContractClient(provider, address);
}
