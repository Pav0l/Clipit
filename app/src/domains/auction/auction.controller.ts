import { BigNumberish, constants, utils } from "ethers";
import { IAuctionContractClient } from "../../lib/contracts/AuctionHouse/auction-contract.client";
import { AuctionContractErrors } from "../../lib/contracts/AuctionHouse/auction-contract.errors";
import { isEthersJsonRpcError } from "../../lib/contracts/jsonRpc.errors";
import { AppError } from "../../lib/errors/errors";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { isRpcError, RpcErrors } from "../../lib/ethereum/rpc.errors";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { IConfig } from "../app/config";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import {
  AuctionBidLoadStatus,
  AuctionCancelLoadStatus,
  AuctionEndLoadStatus,
  AuctionLoadStatus,
  AuctionModel,
  AuctionErrors,
} from "./auction.model";

export class AuctionController {
  constructor(
    private model: AuctionModel,
    private auctionContractCreator: (provider: EthereumProvider, address: string) => IAuctionContractClient,
    private snackbar: SnackbarClient,
    private sentry: SentryClient,
    private config: IConfig
  ) {}

  createAuction = async (
    tokenId: string,
    duration: BigNumberish,
    minPrice: BigNumberish
  ): Promise<string | undefined> => {
    try {
      const auctionContract = this.createAuctionContract();

      this.model.setAuctionCreateLoader();

      const tx = await auctionContract.createAuction(
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
      this.model.setCreateAuctionTxHash(tx.hash);

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
            this.snackbar.sendInfo(AuctionErrors.AUCTION_CREATE_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (err.message.includes(AuctionContractErrors.INVALID_CURATOR_FEE)) {
              this.snackbar.sendError(AuctionContractErrors.INVALID_CURATOR_FEE_USER_ERR);
            } else if (err.message.includes(AuctionContractErrors.NOT_ALLOWED_TO_CREATE_AUCTION)) {
              this.snackbar.sendError(AuctionContractErrors.NOT_APPROVED_TO_AUCTION);
            }
            break;
          default:
            this.snackbar.sendError(AuctionErrors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // unknown error
        this.model.meta.setError(new AppError({ msg: AuctionErrors.AUCTION_CREATE_FAILED, type: "web3-unknown" }));
      }

      return;
    } finally {
      if (this.model.approveAuctionStatus) {
        this.model.clearAuctionApproveStatus();
      }
      if (this.model.auctionLoadStatus) {
        this.model.clearAuctionLoader();
      }
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  };

  endAuction = async (auctionId: string) => {
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
            this.snackbar.sendInfo(AuctionErrors.AUCTION_END_REJECTED);
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
            this.snackbar.sendError(AuctionErrors.AUCTION_END_FAILED);
            break;
        }
      } else {
        // unknown error
        this.snackbar.sendError(AuctionErrors.AUCTION_END_FAILED);
      }

      return null;
    } finally {
      this.model.clearAuctionEndLoader();
    }
  };

  cancelAuction = async (auctionId: string) => {
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
            this.snackbar.sendInfo(AuctionErrors.AUCTION_CANCEL_REJECTED);
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
            this.snackbar.sendError(AuctionErrors.AUCTION_CANCEL_FAILED);
            break;
        }
      } else {
        // unknown error
        this.snackbar.sendError(AuctionErrors.AUCTION_CANCEL_FAILED);
      }

      return null;
    } finally {
      this.model.clearAuctionCancelLoader();
    }
  };

  bidOnAuction = async (auctionId: string, amount: string) => {
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
            this.snackbar.sendInfo(AuctionErrors.AUCTION_BID_REJECTED);
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
            this.snackbar.sendError(AuctionErrors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // unknown error
        this.snackbar.sendError(AuctionErrors.SOMETHING_WENT_WRONG);
      }
    } finally {
      this.model.clearAuctionBidLoader();
    }
  };

  private createAuctionContract = () => {
    return this.auctionContractCreator(window.ethereum as EthereumProvider, this.config.auctionAddress);
  };
}
