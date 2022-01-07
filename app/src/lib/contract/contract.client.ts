import { ethers, BigNumberish, BytesLike } from "ethers";

import ContractBuild from "./ClipIt.json";
import { ClipIt } from "./ClipIt";
import { contractAddress } from "../constants";
import { EthereumProvider } from "../ethereum/ethereum.types";


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

  constructor(provider: EthereumProvider) {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const jsonRpcSigner = ethersProvider.getSigner();
      this.contract = (new ethers.Contract(contractAddress, ContractBuild.abi, jsonRpcSigner)) as ClipIt;
    } catch (error) {
      // TODO sentry
      console.log("[contract.client]:construct:error", error);
      throw new Error('Invalid ethereum provider');
    }
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
