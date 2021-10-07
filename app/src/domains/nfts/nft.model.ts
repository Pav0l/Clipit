import { makeAutoObservable } from "mobx"
import { ipfsIoGatewayUri, pinataGatewayUri } from "../../lib/constants";
import { MetaModel } from "../app/meta.model";

enum MintingProgress {
  CONFIRM_TRANSACTION = "Generated transaction to create the NFT. Please sign it in your MetaMask wallet",
  TX_SIGNED = "Transaction status: Pending...",
  TX_CONFIRMED = "NFT minted! Taking you to the NFTs page..."
}

export class NftModel {
  meta: MetaModel;

  confirmationProgress: number = 0;
  waitingForBlockConfirmations: boolean = false;

  waitingForMintTx: boolean = false;
  progressMessage?: MintingProgress;
  transactionHash?: string = undefined;

  /**
   * clipId from a tx that was sent to backend to be allowed to be minted
   */
  confirmedClipId?: string;
  metadataCid?: string;
  metadata?: Metadata;
  tokenId?: string;
  accounts: string[] = [];

  /**
   * Object that holds {tokenId: metadata} key-value pairs
   */
  metadataCollection: Record<string, Metadata> = {};

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setMetadataCid(cid?: string) {
    this.metadataCid = cid;
  }

  setMetadataCollection(data: Record<string, MetadataInput>, ipfsGatewayUri: string = ipfsIoGatewayUri) {
    const collection: Record<string, Metadata> = {};
    Object.keys(data).forEach(key => collection[key] = new Metadata(data[key], ipfsGatewayUri));
    this.metadataCollection = collection;
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

  createMetadata(data: MetadataInput, ipfsGatewayUri: string = pinataGatewayUri) {
    this.metadata = new Metadata(data, ipfsGatewayUri);
  }

  setTokenId(tokenId: string) {
    this.tokenId = tokenId;
    console.log(`[store]:tokenId:`, tokenId);
  }
}


interface MetadataInput {
  cid?: string
  name?: string
  description?: string
  // TODO maybe remove - unused?
  image?: string
}

class Metadata {
  clipTitle: string;
  // TODO maybe remove - unused?
  clipCid: string;
  description: string;
  clipIpfsUri: string;

  constructor(data: MetadataInput, private ipfsGatewayUri: string) {
    makeAutoObservable(this);

    this.clipCid = this.validateField(data.cid);
    this.clipTitle = this.validateField(data.name);
    this.description = this.validateField(data.description);
    this.clipIpfsUri = this.createClipIpfsGatewayUri(this.validateField(data.cid));
  }

  private validateField<T>(field: unknown) {
    if (typeof field === undefined) {
      throw new Error(`Invalid metadata field type.`);
    }
    return field as T;
  }

  private createClipIpfsGatewayUri = (cid: string) => {
    return `${this.ipfsGatewayUri}/${cid}`;
  }
}
