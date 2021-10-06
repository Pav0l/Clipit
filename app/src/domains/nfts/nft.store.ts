import { BigNumber } from "ethers";
import { makeAutoObservable } from "mobx"
import { MetadataAttrs, StoreClipResp } from "../../lib/clipit-api/clipit-api.client";
import { MetaStore } from "../../store/meta.store";

enum MintingProgress {
  CONFIRM_TRANSACTION = "Generated transaction to create the NFT. Please sign it in your MetaMask wallet",
  TX_SIGNED = "Transaction status: Pending...",
  TX_CONFIRMED = "NFT minted! Taking you to the NFTs page..."
}

export class NftStore {
  meta: MetaStore;
  /**
   * clipId from a tx that was sent to backend to be allowed to be minted
   */
  confirmedClipId?: string;
  metadata?: Metadata;

  accounts: string[] = [];
  tokenId?: string;

  confirmationProgress: number = 0;
  waitingForBlockConfirmations: boolean = false;

  waitingForMintTx: boolean = false;
  progressMessage?: MintingProgress;
  transactionHash?: string = undefined;

  metadataCollection?: Record<string, any>;

  constructor(metaStore: MetaStore) {
    makeAutoObservable(this);
    this.meta = metaStore;
  }

  setMetadataCollection(data: Record<string, any>) {
    this.metadataCollection = data;
  }

  setAccounts = (accounts: string[]) => {
    console.log('[store]:accounts:', accounts)
    this.accounts = accounts;
  }

  setConfirmTx() {
    this.waitingForMintTx = true;
    this.progressMessage = MintingProgress.CONFIRM_TRANSACTION;
  }

  setPendingTx() {
    this.progressMessage = MintingProgress.TX_SIGNED;
  }

  setSuccessTx() {
    this.progressMessage = MintingProgress.TX_CONFIRMED;
  }

  setConfirmationProgress(percentageDone: number) {
    this.waitingForBlockConfirmations = true;
    this.confirmationProgress = percentageDone;
  }

  doneConfirmations(clipId: string) {
    this.waitingForBlockConfirmations = false;
    this.confirmationProgress = 0;
    this.confirmedClipId = clipId;
  }

  createMetadata(data: StoreClipResp) {
    this.metadata = new Metadata(data);
  }

  setTokenId(tokenId: string) {
    this.tokenId = tokenId;
    console.log(`[store]:tokenId:`, tokenId);
  }
}




interface IMetadataAttrs {
  traitType?: "Game" | "Streamer";
  value?: string;
}


class Metadata {
  clipCid?: string;
  metadataCid?: string;
  ownerAddress?: string; // address that is approved to mint this metadata into nft

  name?: string;
  description?: string;
  clipIpfsUri?: string;
  attributes?: Array<IMetadataAttrs>


  constructor(data: StoreClipResp) {
    makeAutoObservable(this);

    this.metadataCid = data.metadataCid;
    this.ownerAddress = data.address;
    this.clipCid = data.metadata?.cid;
    this.name = data.metadata?.name;
    this.description = data.metadata?.description;
    this.clipIpfsUri = data.metadata?.image;
    this.attributes = this.transformAttrs(data.metadata?.attributes);
  }

  private transformAttrs(attrs: MetadataAttrs[] = []): Array<IMetadataAttrs> {
    return attrs.map(attribute => {
      return {
        traitType: attribute.trait_type,
        value: attribute.value
      }
    })
  }
}
