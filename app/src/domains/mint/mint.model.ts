import { makeAutoObservable } from "mobx";
import { MetaModel } from "../meta/meta.model";

export enum MintErrors {
  FAILED_TO_MINT = "Failed to generate the NFT",
  MINT_REJECTED = "Mint transaction rejected",
  SOMETHING_WENT_WRONG = "Something went wrong",
}

export enum MintStatus {
  CONFIRM_MINT = "Clip ready to be turned into an NFT! Please confirm the transaction in MetaMask",
  WAIT_FOR_MINT_TX = "Clip minted, waiting for the transaction to confirm...",
}

enum StoreClipStatus {
  PREPARING_CLIP = "Preparing your clip, this may take some time. Please do not refresh the page.",
  GENERATING_SIG = "Almost there, generating a signature for your clip...",
}

export class MintModel {
  meta: MetaModel;

  // Saving clip & generating signature loader
  storeClipStatus?: StoreClipStatus;
  private storeClipTimeoutId?: number;

  // Minting NFT loader
  mintStatus?: MintStatus;
  mintTxHash?: string;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  startClipStoreLoader() {
    this.setClipStoreStatus(StoreClipStatus.PREPARING_CLIP);

    const timeoutId = window.setTimeout(() => {
      this.setClipStoreStatus(StoreClipStatus.GENERATING_SIG);
    }, 20_000);

    this.setStoreClipTimeoutId(timeoutId);
  }

  stopClipStoreLoaderAndStartMintLoader() {
    this.stopClipStoreLoader();
    this.startMintLoader();
  }

  stopClipStoreLoader() {
    clearTimeout(this.storeClipTimeoutId);
    this.setStoreClipTimeoutId(undefined);
    this.storeClipStatus = undefined;
  }

  stopMintLoader() {
    this.mintStatus = undefined;
  }

  setMintTxHash(hash: string | undefined) {
    this.mintTxHash = hash;
  }

  setWaitForMintTx() {
    this.mintStatus = MintStatus.WAIT_FOR_MINT_TX;
  }

  private setStoreClipTimeoutId(value: number | undefined) {
    this.storeClipTimeoutId = value;
  }

  private startMintLoader() {
    this.mintStatus = MintStatus.CONFIRM_MINT;
  }

  private setClipStoreStatus(status: StoreClipStatus) {
    this.storeClipStatus = status;
  }
}
