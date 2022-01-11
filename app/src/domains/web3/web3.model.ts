import type { ethers } from "ethers";
import { makeAutoObservable } from "mobx"
import { MetaModel } from "../app/meta.model";

enum MintStatus {
  CONFIRM_MINT = "Clip ready to be turned into an NFT!\nPlease confirm the transaction in MetaMask",
  WAIT_FOR_TX = "Clip minted, waiting for the transaction to confirm..."
}

enum StoreClipStatus {
  PREPARING_CLIP = "Preparing your clip, this may take some time. Please do not refresh the page.",
  GENERATING_SIG = "Almost there, generating a signature for your clip...",
}

export class Web3Model {
  meta: MetaModel;

  accounts: string[] = [];
  signer?: ethers.providers.JsonRpcSigner;
  chainId?: string;

  // Saving clip & generating signature loader
  storeClipLoad: boolean = false;
  storeClipStatus?: StoreClipStatus;
  storeClipTimeoutId?: number;
  // Minting NFT loader
  mintLoad: boolean = false;
  mintStatus?: MintStatus;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setSigner(signer: ethers.providers.JsonRpcSigner) {
    this.signer = signer;
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts.map(address => address.toLowerCase());
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  getAccount(): string | null {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }

  isProviderConnected(): boolean {
    return this.accounts.length > 0;
  }

  isMetaMaskInstalled(): boolean {
    return Boolean(window.ethereum && window.ethereum.isMetaMask);
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

export enum Web3Errors {
  INSTALL_METAMASK = "Please install MetaMask extension and click the Connect button to view or create Clip NFTs",
  CONNECT_METAMASK = "Connect your MetaMask wallet to view or create Clip NFTs",
  CONNECT_MM_WARNING = "Request to connect MetaMask was rejected",

  FAILED_TO_MINT = "Failed to generate the NFT",
  MINT_REJECTED = "Mint transaction rejected",

  FAILED_TO_FETCH_SUBGRAPH_DATA = "There was an issue fetching your NFT data. The NFT was minted, however it may take some time to update the data. Please check your list of NFTs in couple of minutes",

  REQUEST_ALREADY_PENDING = "Request already pending. Please open your MetaMask wallet and confirm it",

  SOMETHING_WENT_WRONG = "Something went wrong",
}
