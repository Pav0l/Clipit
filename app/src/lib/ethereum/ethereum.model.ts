import { ethers } from "ethers";
import { makeAutoObservable } from "mobx"
import { MetaModel } from "../../domains/app/meta.model";

export class EthereumModel {
  meta: MetaModel;

  signer?: ethers.providers.JsonRpcSigner;
  accounts?: string[];
  chainId?: string;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setSigner(signer: ethers.providers.JsonRpcSigner) {
    this.signer = signer;
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts;
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  isProviderConnected(): boolean {
    return Boolean(this.accounts && this.accounts.length > 0);
  }

  isMetaMaskInstalled(): boolean {
    return Boolean(window.ethereum && window.ethereum.isMetaMask);
  }
}


export enum MetaMaskErrors {
  INSTALL_METAMASK = "Please install MetaMask extension and click the Connect button to view or create Clip NFTs",
  CONNECT_METAMASK = "Connect your MetaMask wallet to view or create Clip NFTs",
  DISCONNECTED = "It seems we were disconnected. Please check your internet connection",
  FAILED_TO_MINT = "Failed to generate the NFT",
  CONFIRM_MINT = "Please confirm the mint transaction in MetaMask",
  MINT_REJECTED = "Mint transaction rejected",
  SOMETHING_WENT_WRONG = "Something went wrong",
  REQUEST_ALREADY_PENDING = "Request already pending. Please open your MetaMask wallet and confirm it",
}
