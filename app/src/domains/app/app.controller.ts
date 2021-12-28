import { ethers } from "ethers";
import { BigNumberish } from "@ethersproject/bignumber";

import type { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from "../../lib/contract/contract.client";
import { IpfsClient } from "../../lib/ipfs/ipfs.client";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { NftController } from "../nfts/nft.controller";
import EthereumController from "../../lib/ethereum/ethereum.controller";
import { EthereumModel, MetaMaskErrors } from "../../lib/ethereum/ethereum.model";
import { NftErrors } from "../nfts/nft.errors";
import { NftModel } from "../nfts/nft.model";


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
    private clipitApi: ClipItApiClient,
    private ipfsApi: IpfsClient,
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
      this.eth = new EthereumController(this.ethModel, window.ethereum as EthereumProvider, this.snackbar);
      await this.eth.ethAccounts();
    } catch (error) {
      // TODO Sentry - this should not happen
      console.log('[app.controller]:connectMetaMaskIfNecessaryForConnectBtn:error', error);
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
        this.eth = new EthereumController(this.ethModel, window.ethereum as EthereumProvider, this.snackbar);
        await this.eth.requestAccounts();
      }

      this.initContractIfNotExist(this.ethModel.signer);
      if (!this.contract) {
        // TODO track in sentry, this should not happen
        this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
        return;
      }

      this.createNftCtrlIfNotExist(this.contract);
      if (!this.nft) {
        // TODO track in sentry, this should not happen
        return;
      }

      if (!this.ethModel.accounts || !this.ethModel.accounts[0]) {
        // TODO track in sentry, this should not happen
        this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
        return;
      }

      await this.nft.prepareMetadataAndMintClip(
        clipId,
        this.ethModel.accounts[0]
      );
    } catch (error) {
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
        this.eth = new EthereumController(this.ethModel, window.ethereum as EthereumProvider, this.snackbar);
        await this.eth.requestAccounts();
      } catch (error) {
        // should not happen
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

  private initContractIfNotExist(signer?: ethers.providers.JsonRpcSigner) {
    if (!signer) {
      return;
    }

    if (this.contract) {
      return;
    }

    try {
      this.contract = new ContractClient(signer, {
        handleApproval: (
          owner?: string | null,
          approved?: string | null,
          tokenId?: BigNumberish | null
        ) => {
          console.log(
            `[APPROVAL](initContractIfNotExist) from ${owner} to ${approved} for ${tokenId}`
          );
        },
        handleApprovalAll: (
          owner?: string | null,
          operator?: string | null,
          approved?: any
        ) => {
          console.log(
            `[APPROVAL_ALL](initContractIfNotExist) from ${owner} to ${operator} approval status: ${approved}`
          );
        },
        handleTransfer: (
          from?: string | null,
          to?: string | null,
          tokenId?: BigNumberish | null
        ) => {
          console.log(`[TRANSFER](initContractIfNotExist) from ${from} to ${to} for ${tokenId}`);

          // TODO should check if tokenId is different than one in pathname
          if (location.pathname.includes('/nfts/')) {
            console.log('multiple TRANSFER handler calls')
            return;
          }

          this.nftModel.stopMintLoader();

          const tId = tokenId?.toString()

          this.nftModel.setTokenId(tId);
          if (tId) {
            console.log("tokenId from mint -> redirecting", tokenId);
            this.nftModel.setTokenId(undefined);
            location.replace(location.origin + `/nfts/${tokenId}`);
          }
        }
      });
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
        this.clipitApi,
        this.ipfsApi,
        contract
      )
    }
  }
}
