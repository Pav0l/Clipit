import { makeAutoObservable } from "mobx"
import { pinataGatewayUri } from "../../lib/constants";
import { MetaModel } from "../app/meta.model";

enum MintStatus {
  CONFIRM_MINT = "Clip ready to be turned into an NFT!\nPlease confirm the transaction in MetaMask",
  WAIT_FOR_TX = "Clip minted, waiting for the transaction to confirm..."
}

enum StoreClipStatus {
  PREPARING_CLIP = "Preparing your clip, this may take some time. Please do not refresh the page.",
  GENERATING_SIG = "Almost there, generating a signature for your clip...",
}

export class NftModel {
  meta: MetaModel;

  // Saving clip & generating signature loader
  storeClipLoad: boolean = false;
  storeClipStatus?: StoreClipStatus;
  storeClipTimeoutId?: number;
  // Minting NFT loader
  mintLoad: boolean = false;
  mintStatus?: MintStatus;

  metadata: Metadata[] = [];;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  addMetadata(data: MetadataInput): void {
    this.metadata.push(new Metadata(data))
  }

  getMetadata(clipCid: string): Metadata {
    return this.metadata.filter(metadata => metadata.clipCid === clipCid)[0];
  }

  getTokenMetadata(tokenId: string): Metadata {
    return this.metadata.filter(metadata => metadata.tokenId === tokenId)[0];
  }

  startClipStoreLoader() {
    this.storeClipLoad = true;
    this.setClipStoreStatus(StoreClipStatus.PREPARING_CLIP);

    const timeoutId = window.setTimeout(() => {
      this.setClipStoreStatus(StoreClipStatus.GENERATING_SIG);
    }, 20_000);

    this.storeClipTimeoutId = timeoutId;
  }

  stopClipStoreLoaderAndStartMintLoader() {
    this.stopClipStoreLoader();
    this.startMintLoader()
  }

  stopMintLoader() {
    this.mintLoad = false;
    this.mintStatus = undefined;
  }

  setWaitForTransaction() {
    this.mintLoad = true;
    this.mintStatus = MintStatus.WAIT_FOR_TX;
  }

  private startMintLoader() {
    this.mintLoad = true;
    this.mintStatus = MintStatus.CONFIRM_MINT;
  }

  private stopClipStoreLoader() {
    clearTimeout(this.storeClipTimeoutId);
    this.storeClipTimeoutId = undefined;
    this.storeClipLoad = false;
  }
  private setClipStoreStatus(status: StoreClipStatus) {
    this.storeClipStatus = status;
  }
}


export interface Signature {
  v: number;
  r: string;
  s: string
}

interface MetadataInput {
  clipCid: string;
  name: string;
  description: string;
  metadataCid: string;
  tokenId: string;
}

class Metadata {
  clipTitle: string;
  clipCid: string;
  description: string;
  clipIpfsUri: string;
  metadataCid: string;
  tokenId: string;

  constructor(data: MetadataInput, private ipfsGatewayUri: string = pinataGatewayUri) {
    makeAutoObservable(this);

    this.clipCid = this.validateField(data.clipCid);
    this.clipTitle = this.validateField(data.name);
    this.description = this.validateField(data.description);
    this.clipIpfsUri = this.createClipIpfsGatewayUri(this.validateField(data.clipCid));
    this.metadataCid = this.validateField(data.metadataCid);
    this.tokenId = this.validateField(data.tokenId);
  }

  private validateField<T>(field: unknown) {
    if (typeof field === undefined) {
      throw new Error(`Undefined metadata field type: ${field}`);
    }
    return field as T;
  }

  private createClipIpfsGatewayUri = (cid: string) => {
    return `${this.ipfsGatewayUri}/${cid}`;
  }
}
