import { BytesLike } from "ethers";
import { IClipItApiClient, ClipItApiErrors } from "../../lib/clipit-api/clipit-api.client";
import { IClipItContractClient, Signature } from "../../lib/contracts/ClipIt/clipit-contract.client";
import { ClipItContractErrors } from "../../lib/contracts/ClipIt/clipit-contract.errors";
import { isEthersJsonRpcError } from "../../lib/contracts/jsonRpc.errors";
import { Decimal } from "../../lib/decimal/decimal";
import { AppError } from "../../lib/errors/errors";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { isRpcError, RpcErrors } from "../../lib/ethereum/rpc.errors";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { IConfig } from "../app/config";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { MintErrors, MintModel } from "./mint.model";

export class MintController {
  private clipitContract?: IClipItContractClient;

  constructor(
    private model: MintModel,
    private clipitContractCreator: (provider: EthereumProvider, address: string) => IClipItContractClient,
    private clipit: IClipItApiClient,
    private snackbar: SnackbarClient,
    private sentry: SentryClient,
    private config: IConfig
  ) {}

  prepareMetadataAndMintClip = async (
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
      this.snackbar.sendError(MintErrors.SOMETHING_WENT_WRONG);
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

    const resp = await this.clipit.storeClip(clipId, {
      address,
      clipTitle,
      clipDescription,
    });

    if (resp.statusOk && !this.clipit.isClipItApiError(resp.body)) {
      this.model.stopClipStoreLoaderAndStartMintLoader();

      const txHash = await this.mintNFT(resp.body.mediadata, resp.body.signature, creatorShare);
      if (!txHash) {
        return;
      }

      this.model.setMintTxHash(txHash);
    } else {
      if (this.clipit.isClipItApiError(resp.body)) {
        if (resp.statusCode === 403 && resp.body.error.includes(ClipItApiErrors.NOT_BROADCASTER)) {
          return this.snackbar.sendError(ClipItApiErrors.DISPLAY_NOT_BROADCASTER);
        }
      }

      this.snackbar.sendError(MintErrors.SOMETHING_WENT_WRONG);
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
      const tx = await this.contract.mint(data, defaultBidshares, signature);
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
            this.snackbar.sendInfo(MintErrors.MINT_REJECTED);
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
            this.snackbar.sendError(MintErrors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // unknown error
        this.model.meta.setError(new AppError({ msg: MintErrors.FAILED_TO_MINT, type: "web3-unknown" }));
      }

      return null;
    } finally {
      // clean the loading screen
      this.model.stopMintLoader();
    }
  };

  private get contract() {
    if (this.clipitContract) {
      return this.clipitContract;
    }

    this.clipitContract = this.clipitContractCreator(window.ethereum as EthereumProvider, this.config.tokenAddress);
    return this.clipitContract;
  }
}
