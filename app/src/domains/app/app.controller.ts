import { ethers } from "ethers";
import { BigNumberish } from "@ethersproject/bignumber";

import type { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from "../../lib/contract/contract.client";
import { IpfsClient } from "../../lib/ipfs/ipfs.client";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { AppModel } from "./app.model";
import { NftController } from "../nfts/nft.controller";
import { ClipController } from "../twitch-clips/clip.controller";
import { GameController } from "../twitch-games/game.controller";
import { UserController } from "../twitch-user/user.controller";
import { OAuthController } from "../../lib/twitch-oauth/oauth.controller";
import { ILocalStorage } from "../../lib/local-storage";
import EthereumController from "../../lib/ethereum/ethereum.controller";
import { MetaMaskErrors } from "../../lib/ethereum/ethereum.model";
import { NftErrors } from "../nfts/nft.errors";



export interface IAppController {
  nft?: NftController;
  clip: ClipController;
  game: GameController;
  user: UserController;
  auth: OAuthController;
  eth?: EthereumController;

  connectMetaMaskIfNecessaryForConnectBtn: () => Promise<void>;
  requestConnectAndGetTokensMetadata: () => Promise<void>;
  requestConnectAndGetTokenMetadata: (tokenId: string) => Promise<void>;
  requestConnectAndMint: (clipId: string) => Promise<void>;
}


export class AppController implements IAppController {
  nft?: NftController;
  clip: ClipController;
  game: GameController;
  user: UserController;
  auth: OAuthController;

  eth?: EthereumController;
  contract?: ContractClient;

  constructor(
    private model: AppModel,
    private snackbar: SnackbarClient,
    private clipitApi: ClipItApiClient,
    private twitchApi: TwitchApiClient,
    private ipfsApi: IpfsClient,
    private storage: ILocalStorage,
  ) {
    this.auth = new OAuthController(model.auth, this.storage);
    this.auth.checkTokenInStorage();
    this.clip = new ClipController(model.clip, this.snackbar, this.twitchApi);
    this.game = new GameController(model.game, this.twitchApi);
    this.user = new UserController(model.user, this.twitchApi);
  }

  async connectMetaMaskIfNecessaryForConnectBtn() {
    console.log('[app.controller]:connectMetaMaskIfNecessaryForConnectBtn', this.model.eth.isMetaMaskInstalled(), this.model.eth.isProviderConnected());

    if (!this.model.eth.isMetaMaskInstalled()) {
      // if MM is not installed, do nothing. the button will prompt for installation
      return;
    }

    // MM connected -> nothing to do
    if (this.model.eth.isProviderConnected()) {
      return;
    }

    try {
      this.eth = new EthereumController(this.model.eth, window.ethereum as EthereumProvider, this.snackbar);
      await this.eth.ethAccounts();
    } catch (error) {
      // TODO Sentry - this should not happen
      console.log('[app.controller]:connectMetaMaskIfNecessaryForConnectBtn:error', error);
    }

  }

  async requestConnectAndGetTokensMetadata() {
    console.log('requestConnectAndGetTokensMetadata', this.model.eth.isProviderConnected())
    await this.initNftRoutes();

    if (!this.model.eth.accounts || !this.model.eth.accounts[0]) {
      this.model.eth.meta.setError(MetaMaskErrors.CONNECT_METAMASK);
      return;
    }
    this.nft!.getCurrentSignerTokensMetadata(this.model.eth.accounts[0]);
  }

  async requestConnectAndGetTokenMetadata(tokenId: string) {
    console.log('requestConnectAndGetTokenMetadata', this.model.eth.isProviderConnected())

    await this.initNftRoutes();
    this.nft!.getTokenMetadata(tokenId);
  }

  async requestConnectAndMint(clipId: string) {
    try {
      if (!this.model.eth.isMetaMaskInstalled()) {
        this.snackbar.sendInfo(MetaMaskErrors.INSTALL_METAMASK);
        return;
      }

      if (!this.model.eth.isProviderConnected()) {
        this.eth = new EthereumController(
          this.model.eth,
          window.ethereum as EthereumProvider,
          this.snackbar
        );


        await this.eth.requestAccounts();
      }

      this.initContractIfNotExist(this.model.eth.signer);
      if (!this.contract) {
        // TODO track in sentry, this should not happen
        this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
        return;
      }

      this.createNftCtrlIfNotExist(this.contract);

      if (!this.nft) {
        return;
      }

      if (!this.model.eth.accounts || !this.model.eth.accounts[0]) {
        // TODO track in sentry, this should not happen
        this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
        return;
      }

      await this.nft.prepareMetadataAndMintClip(
        clipId,
        this.model.eth.accounts[0]
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
    if (!this.model.eth.isMetaMaskInstalled()) {
      this.model.nft.meta.setError(MetaMaskErrors.INSTALL_METAMASK);
      return;
    }

    // MM not yet connected
    if (!this.model.eth.isProviderConnected()) {
      try {
        this.eth = new EthereumController(this.model.eth, window.ethereum as EthereumProvider, this.snackbar);
        await this.eth.requestAccounts();
      } catch (error) {
        // should not happen
        this.snackbar.sendError(MetaMaskErrors.SOMETHING_WENT_WRONG);
        return;
      }
    }

    if (!this.model.eth.signer) {
      // TODO sentry this should not happen
      this.model.eth.meta.setError(MetaMaskErrors.SOMETHING_WENT_WRONG);
      return;
    }

    this.initContractIfNotExist(this.model.eth.signer);
    if (!this.contract) {
      // TODO sentry this should not happen
      this.model.eth.meta.setError(MetaMaskErrors.SOMETHING_WENT_WRONG);
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

          // TODO refactor this ugliness
          if (location.pathname.includes('/nfts/')) {
            console.log('multiple TRANSFER handler calls')
            return;
          }

          this.model.nft.stopMintLoader();

          const tId = tokenId?.toString()

          this.model.nft.setTokenId(tId);
          if (tId) {
            console.log("tokenId from mint -> redirecting", tokenId);
            this.model.nft.setTokenId(undefined);
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
    // TODO remove log
    console.log('createNftCtrlIfNotExist:', Boolean(!this.nft));
    if (!this.nft) {
      this.nft = new NftController(
        this.model.nft,
        this.snackbar,
        this.clipitApi,
        this.ipfsApi,
        contract
      )
    }
  }
}
