import { ethers } from "ethers";
import { makeAutoObservable } from "mobx"
import { MetaModel } from "../../domains/app/meta.model";

export class EthereumModel {
  meta: MetaModel;

  accounts: string[] = [];
  signer?: ethers.providers.JsonRpcSigner;
  chainId?: string;

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
    return this.accounts[0] ?? null;
  }

  isProviderConnected(): boolean {
    return Boolean(this.accounts.length > 0);
  }

  isMetaMaskInstalled(): boolean {
    return Boolean(window.ethereum && window.ethereum.isMetaMask);
  }
}

// TODO clean up NftErrors, RpcErrors, ContractErrors between nft.errors, web3.errors and ethereum.types
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
