import { ethers } from "ethers";

import ContractClient from "../../lib/contract/contract.client";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { NftController } from "../nfts/nft.controller";
import EthereumController from "../../lib/ethereum/ethereum.controller";
import { EthereumModel, MetaMaskErrors } from "../../lib/ethereum/ethereum.model";
import { NftErrors } from "../nfts/nft.errors";
import { NftModel } from "../nfts/nft.model";
import { SubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";


export interface IWeb3Controller {
  nft?: NftController;
  eth?: EthereumController;
  contract?: ContractClient;

  connectMetaMaskIfNecessaryForConnectBtn: () => Promise<void>;
  requestConnectAndGetTokensMetadata: () => Promise<void>;
  requestConnectAndGetTokenMetadata: (tokenId: string) => Promise<void>;
  requestConnectAndMint: (clipId: string) => Promise<void>;
}


export class Web3Controller implements IWeb3Controller {
  nft?: NftController;
  eth?: EthereumController;
  contract?: ContractClient;

  constructor(
    private ethModel: EthereumModel,
    private nftModel: NftModel,
    private snackbar: SnackbarClient,
    private offChainStorage: OffChainStorage,
    private subgraph: SubgraphClient
  ) {

  }

  async connectMetaMaskIfNecessaryForConnectBtn() {
    console.log('[app.controller]:connectMetaMaskIfNecessaryForConnectBtn', this.ethModel.isMetaMaskInstalled(), this.ethModel.isProviderConnected());

    if (!this.ethModel.isMetaMaskInstalled()) {
      // if MM is not installed, do nothing. the button will prompt for installation
      return;
    }

    // MM connected -> nothing to do
    if (this.ethModel.isProviderConnected()) {
      return;
    }

    try {
      this.initEthereumCtrlIfNotExist(this.ethModel, this.snackbar);
      if (!this.eth) {
        throw new Error("Failed to init Etheruem Controller");
      }
      await this.eth.ethAccounts();
    } catch (error) {
      // TODO Sentry - this should not happen
      console.log('[app.controller]:connectMetaMaskIfNecessaryForConnectBtn:error', error);
      this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }

  }

  async requestConnectAndGetTokensMetadata() {
    await this.initNftRoutes();

    if (!this.ethModel.accounts || !this.ethModel.accounts[0]) {
      this.ethModel.meta.setError(MetaMaskErrors.CONNECT_METAMASK);
      return;
    }
    this.nft!.getCurrentSignerTokensMetadata(this.ethModel.accounts[0]);
  }

  async requestConnectAndGetTokenMetadata(tokenId: string) {
    await this.initNftRoutes();
    this.nft!.getTokenMetadata(tokenId);
  }

  async requestConnectAndMint(clipId: string) {
    try {
      if (!this.ethModel.isMetaMaskInstalled()) {
        this.snackbar.sendInfo(MetaMaskErrors.INSTALL_METAMASK);
        return;
      }

      if (!this.ethModel.isProviderConnected()) {
        this.initEthereumCtrlIfNotExist(this.ethModel, this.snackbar);
        if (!this.eth) {
          throw new Error("Failed to init Etheruem Controller");
        }
        await this.eth.requestAccounts();
      }

      this.initContractIfNotExist(this.ethModel.signer);
      if (!this.contract) {
        throw new Error("Failed to init Contract");
      }

      this.createNftCtrlIfNotExist(this.contract);
      if (!this.nft) {
        throw new Error("Failed to init NFT Controller");
      }

      if (!this.ethModel.accounts || !this.ethModel.accounts[0]) {
        throw new Error("Provider not connected???");
      }

      await this.nft.prepareMetadataAndMintClip(
        clipId,
        this.ethModel.accounts[0]
      );
    } catch (error) {
      console.log('[LOG]:requestConnectAndMint:err', error);
      // TODO sentry
      // invalid provider
      // init contract
      // prepareMetadataAndMintClip
      //  - storeClip error
      this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  private async initNftRoutes() {
    // can't display this page if MM not installed
    if (!this.ethModel.isMetaMaskInstalled()) {
      this.nftModel.meta.setError(MetaMaskErrors.INSTALL_METAMASK);
      return;
    }

    // MM not yet connected
    if (!this.ethModel.isProviderConnected()) {
      try {
        this.initEthereumCtrlIfNotExist(this.ethModel, this.snackbar);
        if (!this.eth) {
          throw new Error("Failed to init Etheruem Controller");
        }
        await this.eth.requestAccounts();
      } catch (error) {
        // TODO track in sentry, this should not happen
        this.snackbar.sendError(MetaMaskErrors.SOMETHING_WENT_WRONG);
        return;
      }
    }

    if (!this.ethModel.signer) {
      // TODO sentry this should not happen
      this.ethModel.meta.setError(MetaMaskErrors.SOMETHING_WENT_WRONG);
      return;
    }

    this.initContractIfNotExist(this.ethModel.signer);
    if (!this.contract) {
      // TODO sentry this should not happen
      this.ethModel.meta.setError(MetaMaskErrors.SOMETHING_WENT_WRONG);
      return;
    }

    this.createNftCtrlIfNotExist(this.contract);

    if (!this.nft) {
      return;
    }
  }

  private initEthereumCtrlIfNotExist(ethModel: EthereumModel, snackbar: SnackbarClient) {
    if (!this.eth) {
      this.eth = new EthereumController(ethModel, window.ethereum as EthereumProvider, snackbar);
    }
  }

  private initContractIfNotExist(signer?: ethers.providers.JsonRpcSigner) {
    if (!signer) {
      return;
    }

    if (this.contract) {
      return;
    }

    try {
      this.contract = new ContractClient(signer);
    } catch (error) {
      // TODO sentry - probably invalid signer
      this.snackbar.sendError(MetaMaskErrors.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * createNftCtrlIfNotExist creates NftController instance. 
   * This will require MetaMask to be installed from the user,
   * that's why we're instantiating it only just when we need it
   */
  private createNftCtrlIfNotExist(contract: ContractClient) {
    if (!this.nft) {
      this.nft = new NftController(
        this.nftModel,
        this.snackbar,
        this.offChainStorage,
        contract,
        this.subgraph
      )
    }
  }
}
