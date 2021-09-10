import { ethers, BigNumberish } from "ethers";

import ContractBuild from "./ClipIt.json";
import { ClipIt } from "./ClipIt";
import { contractAddress } from "../constants";

enum ContractEvents {
  APPROVE = "Approval",
  APPROVE_ALL = "ApprovalForAll",
  TRANSFER = "Transfer"
}

interface EventHandlers {
  handleTransfer: (from?: string | null, to?: string | null, tokenId?: BigNumberish | null) => void;
  handleApproval: (owner?: string | null, approved?: string | null, tokenId?: BigNumberish | null) => void;
  handleApprovalAll: (owner?: string | null, operator?: string | null, approved?: any) => void;
}

export default class ContractClient {
  private contract: ClipIt;

  constructor(signer: ethers.providers.JsonRpcSigner, handlers: EventHandlers) {
    this.contract = (new ethers.Contract(contractAddress, ContractBuild.abi, signer)) as ClipIt;

    // register listeners for contract events
    this.contract.on(ContractEvents.APPROVE, handlers.handleApproval);

    this.contract.on(ContractEvents.APPROVE_ALL, handlers.handleApprovalAll);

    this.contract.on(ContractEvents.TRANSFER, handlers.handleTransfer);
  }

  async mint(to: string, metadataCid: string) {
    return this.contract.mint(to, metadataCid);
  }


  async getMetadataTokenUri(tokenId: string) {
    return this.contract.tokenURI(tokenId);
  }

  // convienience method to fetch minted tokens from wallet
  async getWalletsClipNFTs(walletAddress: string) {
    const filter = this.contract.filters.Transfer(
      ethers.constants.AddressZero, // "Transfer" from zero address => minted token
      walletAddress,
      null // ignore this filter -> return all minted tokens to wallet address
    );

    const emittedEvents = await this.contract.queryFilter(filter);
    console.log('mint transfers to wallet', emittedEvents);

    return emittedEvents;
  }
}
