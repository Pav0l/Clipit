import { BigNumber, BigNumberish, BytesLike } from "ethers";

import { IClipItContractClient } from "../../lib/contracts/ClipIt/clipit-contract.client";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { ChainId, EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { Web3Model, Web3Errors } from "./web3.model";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { Decimal } from "../../lib/decimal/decimal";
import { ClipItContractErrors } from "../../lib/contracts/ClipIt/clipit-contract.errors";
import { isEthersJsonRpcError } from "../../lib/contracts/jsonRpc.errors";
import { isRpcError, RpcErrors } from "../../lib/ethereum/rpc.errors";
import EthereumClient from "../../lib/ethereum/ethereum.client";
import { IConfig } from "../app/config";
import { ClipItApiErrors } from "../../lib/clipit-api/clipit-api.client";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { AppError } from "../../lib/errors/errors";
import { MintModel } from "../mint/mint.model";
import { AuctionModel } from "../auction/auction.model";
import { AuctionController } from "../auction/auction.controller";

interface Signature {
  v: number;
  r: string;
  s: string;
}

export interface IWeb3Controller {
  // silently try to get ethAccounts
  requestEthAccounts: () => Promise<void>;
  // mint token
  requestConnectAndMint: (
    clipId: string,
    data: {
      creatorShare: string;
      clipTitle: string;
      clipDescription?: string;
    }
  ) => Promise<void>;
  // open MM and call requestAccounts
  requestConnect: (andThenCallThisWithSignerAddress?: (addr: string) => Promise<void>) => Promise<void>;
  // get current users balance
  getBalance: (address: string) => Promise<void>;
  requestConnectAndCreateAuction: (tokenId: string, duration: BigNumberish, minPrice: BigNumberish) => Promise<void>;
  // Bid on token in auction
  requestConnectAndBid: (auctionId: string, amount: string) => Promise<void>;
  requestConnectAndCancelAuction: (auctionId: string) => Promise<void>;
  requestConnectAndEndAuction: (auctionId: string) => Promise<void>;
}

export class Web3Controller implements IWeb3Controller {
  constructor(
    private model: Web3Model,
    // TODO abstract into UI ctrl
    private mintModel: MintModel,
    private auctionModel: AuctionModel,
    private auctionController: AuctionController,
    // end TODO
    private offChainStorage: OffChainStorage,
    private snackbar: SnackbarClient,
    private sentry: SentryClient,
    private clipitContractCreator: (provider: EthereumProvider, address: string) => IClipItContractClient,
    private config: IConfig
  ) {}

  async requestEthAccounts() {
    if (!this.model.isMetaMaskInstalled()) {
      return;
    }

    // MM connected already -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    await this.ethAccounts();
  }

  requestConnect = async (andThenCallThisWithSignerAddress?: (addr: string) => Promise<void>) => {
    // can't display this page if MM not installed
    if (!this.model.isMetaMaskInstalled()) {
      this.model.meta.setError(new AppError({ msg: Web3Errors.INSTALL_METAMASK, type: "missing-provider" }));
      return;
    }

    // MM connected already -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    this.model.meta.setLoading(true);

    await this.requestAccounts();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      this.model.meta.setError(new AppError({ msg: Web3Errors.CONNECT_METAMASK, type: "connect-provider" }));
      return;
    }

    if (andThenCallThisWithSignerAddress) {
      await andThenCallThisWithSignerAddress(signerAddress);
    }

    this.model.meta.setLoading(false);
  };

  async requestConnectAndMint(
    clipId: string,
    data: {
      creatorShare: string;
      clipTitle: string;
      clipDescription?: string;
    }
  ) {
    await this.requestConnectIfProviderExist();
    const address = this.model.getAccount();
    if (!address) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.prepareMetadataAndMintClip(clipId, { ...data, address });
  }

  getBalance = async (address: string) => {
    try {
      const balance = await this.initEthClient().getBalance(address);
      this.model.setEthBalance(BigNumber.from(balance));
    } catch (error) {
      this.sentry.captureException(error);
    }
  };

  requestConnectAndCreateAuction = async (tokenId: string, duration: BigNumberish, minPrice: BigNumberish) => {
    await this.requestConnectIfProviderExist();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    // TODO this should not be here
    const token = this.createTokenContract();
    const approved = await token.getApproved(tokenId);

    console.log("[LOG]:token approved", approved);
    if (approved !== this.config.auctionAddress) {
      this.auctionModel.setApproveAuctionLoader();

      const tx = await token.approveAll(this.config.auctionAddress, true);

      this.auctionModel.setWaitForApproveAuctionTxLoader();
      console.log("[LOG]:approve auction tx hash", tx.hash);
      await tx.wait();
    }

    await this.auctionController.createAuction(tokenId, duration, minPrice);
  };

  requestConnectAndBid = async (auctionId: string, amount: string) => {
    await this.requestConnectIfProviderExist();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.auctionController.bidOnAuction(auctionId, amount);
  };

  requestConnectAndCancelAuction = async (auctionId: string) => {
    await this.requestConnectIfProviderExist();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.auctionController.cancelAuction(auctionId);
  };

  requestConnectAndEndAuction = async (auctionId: string) => {
    await this.requestConnectIfProviderExist();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.auctionController.endAuction(auctionId);
  };

  private async requestConnectIfProviderExist() {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }
  }

  private prepareMetadataAndMintClip = async (
    clipId: string,
    data: {
      address: string;
      creatorShare: string;
      clipTitle: string;
      clipDescription?: string;
    }
  ) => {
    const { address, creatorShare, clipTitle, clipDescription } = data;
    if (!clipId || !address || !clipTitle) {
      this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
      this.sentry.captureEvent({
        message: "missing data to mint clip",
        contexts: {
          data: {
            clipId,
            address,
            clipTitle,
          },
        },
      });
      return;
    }

    this.mintModel.startClipStoreLoader();

    const resp = await this.offChainStorage.saveClipAndCreateMetadata(clipId, {
      address,
      clipTitle,
      clipDescription,
    });

    if (resp.statusOk && !this.offChainStorage.isStoreClipError(resp.body)) {
      this.mintModel.stopClipStoreLoaderAndStartMintLoader();

      const txHash = await this.mintNFT(resp.body.mediadata, resp.body.signature, creatorShare);
      if (!txHash) {
        return;
      }

      this.mintModel.setMintTxHash(txHash);
    } else {
      if (this.offChainStorage.isStoreClipError(resp.body)) {
        if (resp.statusCode === 403 && resp.body.error.includes(ClipItApiErrors.NOT_BROADCASTER)) {
          this.snackbar.sendError(ClipItApiErrors.DISPLAY_NOT_BROADCASTER);
        }
      } else {
        this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
      }

      this.mintModel.stopClipStoreLoader();
    }
  };

  private mintNFT = async (
    data: {
      tokenURI: string;
      metadataURI: string;
      contentHash: BytesLike;
      metadataHash: BytesLike;
    },
    signature: Signature,
    creatorShare: string
  ) => {
    const forCreator = Number(creatorShare); // if creatorShare is '' it's converted to 0 here
    const defaultBidshares = {
      creator: Decimal.from(forCreator),
      owner: Decimal.from(100 - forCreator),
      prevOwner: Decimal.from(0),
    };

    try {
      const contract = this.createTokenContract();
      const tx = await contract.mint(data, defaultBidshares, signature);
      console.log("[LOG]:minting NFT in tx", tx.hash);

      this.mintModel.setWaitForMintTx();

      const receipt = await tx.wait();
      console.log("[LOG]:mint:done! gas used to mint:", receipt.gasUsed.toString());

      return tx.hash;
    } catch (error) {
      console.log("[LOG]:mint:error", error);
      this.sentry.captureException(error);

      let err = error;
      if (isEthersJsonRpcError(err)) {
        // take out Rpc error from Ethers error
        if (err.error) {
          err = err.error;
        }
      }

      if (isRpcError(err)) {
        switch (err.code) {
          case RpcErrors.USER_REJECTED_REQUEST:
            this.snackbar.sendInfo(Web3Errors.MINT_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (
              err.message.includes(ClipItContractErrors.ERC721_TOKEN_MINTED) ||
              err.message.includes(ClipItContractErrors.CLIPIT_TOKEN_EXIST)
            ) {
              this.snackbar.sendError(ClipItContractErrors.TOKEN_ALREADY_MINTED);
            } else if (err.message.includes(ClipItContractErrors.CLIPIT_INVALID_ADDRESS)) {
              this.snackbar.sendError(ClipItContractErrors.ADDRESS_NOT_ALLOWED);
            }
            break;
          default:
            this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // unknown error
        this.model.meta.setError(new AppError({ msg: Web3Errors.FAILED_TO_MINT, type: "web3-unknown" }));
      }

      return null;
    } finally {
      // clean the loading screen
      this.mintModel.stopMintLoader();
    }
  };

  private requestAccounts = async () => {
    try {
      const accounts = await this.initEthClient().requestAccounts();
      console.log("[ethereum.controller]:requestAccounts:accounts", accounts);

      await this.updateAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:requestAccounts:error", error);

      if (!isRpcError(error)) {
        this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
        return;
      }

      switch (error.code) {
        case RpcErrors.REQUEST_ALREADY_PENDING:
          this.snackbar.sendInfo(Web3Errors.REQUEST_ALREADY_PENDING);
          break;
        case RpcErrors.USER_REJECTED_REQUEST:
          this.snackbar.sendInfo(Web3Errors.CONNECT_MM_WARNING);
          break;
        default:
          this.snackbar.sendError(Web3Errors.CONNECT_METAMASK);
          break;
      }
    }
  };

  private ethAccounts = async () => {
    try {
      const accounts = await this.initEthClient().ethAccounts();
      console.log("[ethereum.controller]:ethAccounts:accounts", accounts);

      await this.updateAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:ethAccounts:error", error);
      this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
    }
  };

  private initEthClient = () => {
    const client = new EthereumClient(window.ethereum as EthereumProvider);
    client.registerEventHandler("chainChanged", this.handleChainChanged);
    client.registerEventHandler("accountsChanged", this.handleAccountsChange);
    return client;
  };

  private handleAccountsChange = async (accounts: string[]) => {
    console.log("[web3.controller]:handleAccountsChange", accounts);
    // TODO when accounts change, we should update NFT states of owners, etc
    await this.updateAccounts(accounts);
    // TODO in ext - we need to also map account to user
    this.model.resetEthBalance();
  };

  private updateAccounts = async (accounts: string[]) => {
    this.model.setAccounts(accounts);
    const address = this.model.getAccount();
    if (!address) {
      return;
    }

    const name = await this.initEthClient().resolveEnsName(address);
    this.model.setEnsName(name);
  };

  private handleChainChanged(chainId: ChainId) {
    console.log("[web3.controller]::chainChanged", chainId);
    window.location.reload();
  }

  private createTokenContract = () => {
    return this.clipitContractCreator(window.ethereum as EthereumProvider, this.config.tokenAddress);
  };
}
