import { makeAutoObservable } from "mobx"
import { ipfsIoGatewayUri, pinataGatewayUri } from "../../lib/constants";
import { MetaModel } from "../app/meta.model";

enum MintStatus {
  CONFIRM_MINT = "Clip ready to be turned into an NFT!\nPlease confirm the transaction in MetaMask",
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

  startClipStoreLoader() {
    this.storeClipLoad = true;
    this.setClipStoreStatus(StoreClipStatus.PREPARING_CLIP);

    const timeoutId = window.setTimeout(() => {
      this.setClipStoreStatus(StoreClipStatus.GENERATING_SIG);
    }, 20_000);

    this.storeClipTimeoutId = timeoutId;
  }

  private stopClipStoreLoader() {
    clearTimeout(this.storeClipTimeoutId);
    this.storeClipTimeoutId = undefined;
    this.storeClipLoad = false;
  }
  private setClipStoreStatus(status: StoreClipStatus) {
    this.storeClipStatus = status;
  }

  stopClipStoreLoaderAndStartMintLoader() {
    this.stopClipStoreLoader();
    this.startMintLoader()
  }

  private startMintLoader() {
    this.mintLoad = true;
    this.mintStatus = MintStatus.CONFIRM_MINT;
  }

  stopMintLoader() {
    this.mintLoad = false;
    this.mintStatus = undefined;
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

  createMetadata(data: MetadataInput, ipfsGatewayUri: string = pinataGatewayUri) {
    this.metadata = new Metadata(data, ipfsGatewayUri);
  }

  setTokenId(tokenId: string | undefined) {
    this.tokenId = tokenId;
    console.log(`[store]:tokenId:`, tokenId);
  }
}


export interface Signature {
  v: number;
  r: string;
  s: string
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
