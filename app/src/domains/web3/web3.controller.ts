import { BigNumber, BigNumberish, BytesLike, constants, utils } from "ethers";

import { IClipItContractClient } from "../../lib/contracts/ClipIt/clipit-contract.client";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { ChainId, EthereumProvider } from "../../lib/ethereum/ethereum.types";
import {
  Web3Model,
  Web3Errors,
  AuctionLoadStatus,
  AuctionBidLoadStatus,
  AuctionCancelLoadStatus,
  AuctionEndLoadStatus,
} from "./web3.model";
import { isSubgraphError, ISubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { Decimal } from "../../lib/decimal/decimal";
import { ClipItContractErrors } from "../../lib/contracts/ClipIt/clipit-contract.errors";
import { isEthersJsonRpcError } from "../../lib/contracts/jsonRpc.errors";
import { isRpcError, RpcErrors } from "../../lib/ethereum/rpc.errors";
import EthereumClient from "../../lib/ethereum/ethereum.client";
import { IAuctionContractClient } from "../../lib/contracts/AuctionHouse/auction-contract.client";
import { AuctionContractErrors } from "../../lib/contracts/AuctionHouse/auction-contract.errors";
import { IConfig } from "../app/config";
import { ClipItApiErrors } from "../../lib/clipit-api/clipit-api.client";
import { SentryClient } from "../../lib/sentry/sentry.client";

interface Signature {
  v: number;
  r: string;
  s: string;
}

export interface IWeb3Controller {
  // silently try to get ethAccounts
  connectMetaMaskIfNecessaryForConnectBtn: () => Promise<void>;
  // mint token
  requestConnectAndMint: (
    clipId: string,
    data: {
      creatorShare: string;
      clipTitle: string;
      clipDescription?: string;
    },
    options?: { withReturn?: boolean }
  ) => Promise<string | undefined>;
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
    private offChainStorage: OffChainStorage,
    private subgraph: ISubgraphClient,
    private snackbar: SnackbarClient,
    private sentry: SentryClient,
    private clipitContractCreator: (provider: EthereumProvider, address: string) => IClipItContractClient,
    private auctionContractCreator: (provider: EthereumProvider, address: string) => IAuctionContractClient,
    private config: IConfig
  ) {}

  async connectMetaMaskIfNecessaryForConnectBtn() {
    if (!this.model.isMetaMaskInstalled()) {
      // TODO maybe the button text handling should live somewhere here
      // so this controller does not have to rely on the button logic
      // if MM is not installed, do nothing. the button will prompt for installation
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
      this.model.meta.setError(Web3Errors.INSTALL_METAMASK);
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
      this.model.meta.setError(Web3Errors.CONNECT_METAMASK);
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
    },
    options: { withReturn?: boolean } = {}
  ) {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }
    const address = this.model.getAccount();
    if (!address) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    return await this.prepareMetadataAndMintClip(clipId, { ...data, address }, options);
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
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.createAuction(tokenId, duration, minPrice);
  };

  requestConnectAndBid = async (auctionId: string, amount: string) => {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.bidOnAuction(auctionId, amount);
  };

  requestConnectAndCancelAuction = async (auctionId: string) => {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.cancelAuction(auctionId);
  };

  requestConnectAndEndAuction = async (auctionId: string) => {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.endAuction(auctionId);
  };

  private cancelAuction = async (auctionId: string) => {
    try {
      const auction = this.createAuctionContract();

      this.model.setAuctionCancelLoader();

      const tx = await auction.cancelAuction(auctionId);

      this.model.setWaitForAuctionCancelTxLoader();

      console.log("[LOG]:cancel auction tx hash", tx.hash);

      await tx.wait();

      this.snackbar.sendSuccess(AuctionCancelLoadStatus.AUCTION_CANCEL_SUCCESS);
    } catch (error) {
      console.log("[LOG]:cancel auction:error", error);
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
            this.snackbar.sendInfo(Web3Errors.AUCTION_CANCEL_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (err.message.includes(AuctionContractErrors.AUCTION_DOES_NOT_EXIST)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_DOES_NOT_EXIST);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_CANCEL_INVALID_CALLER)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_CANCEL_INVALID_CALLER);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_CANCEL_RUNNING)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_CANCEL_RUNNING);
            }
            break;
          default:
            this.snackbar.sendError(Web3Errors.AUCTION_CANCEL_FAILED);
            break;
        }
      } else {
        // unknown error
        this.snackbar.sendError(Web3Errors.AUCTION_CANCEL_FAILED);
      }

      return null;
    } finally {
      this.model.clearAuctionCancelLoader();
    }
  };

  private endAuction = async (auctionId: string) => {
    try {
      const auction = this.createAuctionContract();

      this.model.setAuctionEndLoader();

      const tx = await auction.endAuction(auctionId);

      this.model.setWaitForAuctionEndTxLoader();

      console.log("[LOG]:end auction tx hash", tx.hash);

      await tx.wait();

      this.snackbar.sendSuccess(AuctionEndLoadStatus.AUCTION_END_SUCCESS);
    } catch (error) {
      console.log("[LOG]:end auction:error", error);
      this.sentry.captureException(error);

      let err = error;
      if (isEthersJsonRpcError(err)) {
        // take out Rpc err from Ethers error
        if (err.error) {
          err = err.error;
        }
      }

      if (isRpcError(err)) {
        switch (err.code) {
          case RpcErrors.USER_REJECTED_REQUEST:
            this.snackbar.sendInfo(Web3Errors.AUCTION_END_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (err.message.includes(AuctionContractErrors.AUCTION_DOES_NOT_EXIST)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_DOES_NOT_EXIST);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_END_HAS_NOT_STARTED)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_END_HAS_NOT_STARTED);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_END_HAS_NOT_COMPLETED)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_END_HAS_NOT_COMPLETED);
            }
            break;
          default:
            this.snackbar.sendError(Web3Errors.AUCTION_END_FAILED);
            break;
        }
      } else {
        // unknown error
        this.snackbar.sendError(Web3Errors.AUCTION_END_FAILED);
      }

      return null;
    } finally {
      this.model.clearAuctionEndLoader();
    }
  };

  private prepareMetadataAndMintClip = async (
    clipId: string,
    data: {
      address: string;
      creatorShare: string;
      clipTitle: string;
      clipDescription?: string;
    },
    options: { withReturn?: boolean } = {}
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

    this.model.startClipStoreLoader();

    const resp = await this.offChainStorage.saveClipAndCreateMetadata(clipId, {
      address,
      clipTitle,
      clipDescription,
    });

    if (resp.statusOk && !this.offChainStorage.isStoreClipError(resp.body)) {
      this.model.stopClipStoreLoaderAndStartMintLoader();

      const txHash = await this.mintNFT(resp.body.mediadata, resp.body.signature, creatorShare);
      if (!txHash) {
        return;
      }

      this.model.meta.setLoading(true);

      const clip = await this.subgraph.fetchClipByHashCached(txHash);
      console.log("[LOG]:clip", clip);

      if (!clip) {
        this.model.meta.setError(Web3Errors.FAILED_TO_FETCH_SUBGRAPH_DATA);

        this.sentry.captureEvent({
          message: "empty clip from subgraph",
          contexts: {
            data: {
              txHash: txHash,
              clipId,
            },
          },
        });
        return;
      }

      if (isSubgraphError(clip)) {
        this.model.meta.setError(Web3Errors.SOMETHING_WENT_WRONG);

        this.sentry.captureEvent({
          message: "failed to fetch clip from subgraph",
          contexts: {
            data: {
              txHash: txHash,
              clipId,
              errors: JSON.stringify(clip.errors),
            },
          },
        });
        return;
      }

      this.model.meta.setLoading(false);

      const tokenId = clip.id;

      if (options.withReturn) {
        return tokenId;
      }

      // TODO ideally we do not want to reload the app here and just update state
      location.assign(location.origin + `/nfts/${tokenId}`);
    } else {
      if (this.offChainStorage.isStoreClipError(resp.body)) {
        if (resp.statusCode === 403 && resp.body.error.includes(ClipItApiErrors.NOT_BROADCASTER)) {
          this.snackbar.sendError(ClipItApiErrors.DISPLAY_NOT_BROADCASTER);
        }
      } else {
        this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
      }

      this.model.stopClipStoreLoader();
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

      this.model.setWaitForMintTx();

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
        this.model.meta.setError(Web3Errors.FAILED_TO_MINT);
      }

      return null;
    } finally {
      // clean the loading screen
      this.model.stopMintLoader();
    }
  };

  private requestAccounts = async () => {
    try {
      const accounts = await this.initEthClient().requestAccounts();
      console.log("[ethereum.controller]:requestAccounts:accounts", accounts);

      this.model.setAccounts(accounts);
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

      this.model.setAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:ethAccounts:error", error);
      this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
    }
  };

  private createAuction = async (tokenId: string, duration: BigNumberish, minPrice: BigNumberish) => {
    try {
      const auction = this.createAuctionContract();
      const token = this.createTokenContract();

      const approved = await token.getApproved(tokenId);
      console.log("[LOG]:token approved", approved);
      if (!approved || approved === constants.AddressZero) {
        this.model.setAuctionApproveTokenLoader();

        // TODO consider using approveAll
        const tx = await token.approve(this.config.auctionAddress, tokenId);

        this.model.setWaitForApproveTxLoader();
        console.log("[LOG]:approve auction tx hash", tx.hash);
        await tx.wait();
      }

      this.model.setAuctionCreateLoader();

      const tx = await auction.createAuction(
        tokenId,
        this.config.tokenAddress,
        duration,
        minPrice,
        // TODO - support currators
        constants.AddressZero,
        0,
        // TODO - support other currencies
        constants.AddressZero
      );

      this.model.setWaitForAuctionCreateTxLoader();

      console.log("[LOG]:auction create tx hash", tx.hash);

      await tx.wait();

      this.model.clearAuctionLoader();
      this.snackbar.sendSuccess(AuctionLoadStatus.CREATE_AUCTION_SUCCESS);
    } catch (error) {
      console.log("[LOG]:createAuction:error", error);
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
            this.snackbar.sendInfo(Web3Errors.AUCTION_CREATE_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (err.message.includes(AuctionContractErrors.INVALID_CURATOR_FEE)) {
              this.snackbar.sendError(AuctionContractErrors.INVALID_CURATOR_FEE_USER_ERR);
            }
            break;
          default:
            this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // unknown error
        this.model.meta.setError(Web3Errors.AUCTION_CREATE_FAILED);
      }

      return null;
    }
  };

  private bidOnAuction = async (auctionId: string, amount: string) => {
    try {
      const auction = this.createAuctionContract();

      this.model.setAuctionBidLoader();

      const etherAmount = utils.parseEther(amount);
      const tx = await auction.createBid(auctionId, etherAmount);

      this.model.setWaitForAuctionBidTxLoader();

      console.log("[LOG]:auction bid tx hash", tx.hash);

      await tx.wait();

      this.snackbar.sendSuccess(AuctionBidLoadStatus.AUCTION_BID_SUCCESS);
    } catch (error) {
      console.log("[LOG]:bid auction:error", error);
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
            this.snackbar.sendInfo(Web3Errors.AUCTION_BID_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (err.message.includes(AuctionContractErrors.AUCTION_DOES_NOT_EXIST)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_DOES_NOT_EXIST);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_NOT_APPROVED)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_NOT_STARTED);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_EXPIRED)) {
              this.snackbar.sendError(AuctionContractErrors.AUCTION_EXPIRED);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_BID_LOWER_THAN_RESERVE_PRICE)) {
              // TODO send displayReservePrice here as well
              this.snackbar.sendError(AuctionContractErrors.BID_NOT_HIGH_ENOUGH);
            } else if (err.message.includes(AuctionContractErrors.AUCTION_BID_LOWER_THAN_PREVIOUS_BID)) {
              // TODO send minBidIncrementPercentage here as well
              this.snackbar.sendError(AuctionContractErrors.BID_NOT_HIGH_ENOUGH);
            }
            // TODO handle AUCTION_BID_INVALID_FOR_SHARE_SPLITTING
            break;
          default:
            this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // unknown error
        this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
      }

      return null;
    } finally {
      this.model.clearAuctionBidLoader();
    }
  };

  private initEthClient = () => {
    const client = new EthereumClient(window.ethereum as EthereumProvider);
    client.registerEventHandler("chainChanged", this.handleChainChanged);
    client.registerEventHandler("accountsChanged", this.handleAccountsChange);
    return client;
  };

  private handleAccountsChange = (accounts: string[]) => {
    console.log("[web3.controller]:handleAccountsChange", accounts);
    // TODO when accounts change, we should update NFT states of owners, etc
    this.model.setAccounts(accounts);
    this.model.resetEthBalance();
  };

  private handleChainChanged(chainId: ChainId) {
    console.log("[web3.controller]::chainChanged", chainId);
    window.location.reload();
  }

  private createAuctionContract = () => {
    return this.auctionContractCreator(window.ethereum as EthereumProvider, this.config.auctionAddress);
  };

  private createTokenContract = () => {
    return this.clipitContractCreator(window.ethereum as EthereumProvider, this.config.tokenAddress);
  };
}
