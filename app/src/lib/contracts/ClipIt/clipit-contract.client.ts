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
  approveAll: (to: string, approved: boolean) => Promise<ethers.ContractTransaction>;
}

class ClipItContractClient implements IClipItContractClient {
  private contract: ClipIt;

  constructor(provider: EthereumProvider, address: string) {
    // this can throw!
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const jsonRpcSigner = ethersProvider.getSigner();
    this.contract = new ethers.Contract(address, ContractBuild.abi, jsonRpcSigner) as ClipIt;
  }

  async approve(to: string, tokenId: string): Promise<ethers.ContractTransaction> {
    return this.contract.approve(to, tokenId);
  }

  async approveAll(to: string, approved: boolean): Promise<ethers.ContractTransaction> {
    return this.contract.setApprovalForAll(to, approved);
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
