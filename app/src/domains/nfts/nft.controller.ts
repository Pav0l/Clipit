import type { NftModel } from "./nft.model";
import { NftErrors } from "./nft.errors";
import { isSubgraphError, ISubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { ClipPartialFragment } from "../../lib/graphql/types";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { AppError } from "../../lib/errors/errors";

export class NftController {
  constructor(
    private model: NftModel,
    private offChainStorage: OffChainStorage,
    private subgraph: ISubgraphClient,
    private snackbar: SnackbarClient,
    private sentry: SentryClient
  ) {}

  getTokenMetadata = async (tokenId: string) => {
    try {
      const tokenMetadata = this.model.getTokenMetadata(tokenId);
      if (tokenMetadata) {
        return tokenMetadata;
      }

      const clip = await this.subgraph.fetchClipCached(tokenId);
      if (!clip) {
        this.model.meta.setError(new AppError({ msg: NftErrors.CLIP_DOES_NOT_EXIST, type: "subgraph-clip" }));
        return;
      }

      if (isSubgraphError(clip)) {
        this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "subgraph-query" }));

        this.sentry.captureEvent({
          message: "failed to get clip from subgraph",
          contexts: {
            data: {
              tokenId,
            },
            error: {
              errors: JSON.stringify(clip.errors),
            },
          },
        });

        return;
      }

      await this.getMetadataForClipFragmentAndStoreInModel(clip, { target: "metadata", shouldThrow: true });
    } catch (error) {
      console.log("[LOG]:getTokenMetadata err", error);
      this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "nft-unknown" }));

      this.sentry.captureException(error);
    }
  };

  getCurrentSignerTokensMetadata = async (address: string) => {
    try {
      this.model.meta.setLoading(true);

      const data = await this.subgraph.fetchUserCached(address);
      if (!data) {
        return;
      }

      if (isSubgraphError(data)) {
        this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "subgraph-query" }));

        this.sentry.captureEvent({
          message: "failed to get user from subgraph",
          contexts: {
            data: {
              address,
            },
            error: {
              errors: JSON.stringify(data.errors),
            },
          },
        });
        return;
      }

      for (const clip of data.collection) {
        await this.getMetadataForClipFragmentAndStoreInModel(clip, { target: "metadata" });
        // we can stop loading after we have data for first NFT
        this.model.meta.setLoading(false);
      }

      for (const bid of data.reserveAuctionBids) {
        await this.getMetadataForClipFragmentAndStoreInModel(bid, { target: "auctionBid" });
        // we can stop loading after we have data for first NFT
        this.model.meta.setLoading(false);
      }
    } catch (error) {
      this.sentry.captureException(error);
      this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "nft-unknown" }));
    } finally {
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  };

  getOwnerMetadata = (ownerAddress: string | null) => {
    if (!ownerAddress) {
      return [];
    }
    return this.model.getOwnMetadata(ownerAddress);
  };

  /**
   * Fetch a list of clips from subgraph. Use `skip` to paginate more clips
   * @param skip
   */
  getClips = async (skip?: number) => {
    try {
      this.model.meta.setLoading(true);

      const data = await this.subgraph.fetchClips(skip);

      if (data === null) {
        return;
      }

      if (isSubgraphError(data)) {
        this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "subgraph-query" }));

        this.sentry.captureEvent({
          message: "failed to get clips from subgraph",
          contexts: {
            data: {
              skip,
            },
            error: {
              errors: JSON.stringify(data.errors),
            },
          },
        });
        return;
      }

      for (const clip of data.clips) {
        await this.getMetadataForClipFragmentAndStoreInModel(clip, { target: "metadata" });
        this.model.meta.setLoading(false);
      }
    } catch (error) {
      this.sentry.captureException(error);
      this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "nft-unknown" }));
    } finally {
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  };

  getAuctionForToken = async (tokenId: string, options: { clearCache: boolean } = { clearCache: false }) => {
    try {
      this.model.meta.setLoading(true);

      const data = await this.subgraph.fetchAuctionCached(tokenId, options);

      if (data === null) {
        return;
      }
      if (isSubgraphError(data)) {
        this.model.meta.setError(new AppError({ msg: NftErrors.ERROR_TRY_REFRESH, type: "subgraph-query" }));

        this.sentry.captureEvent({
          message: "failed to get auction from subgraph",
          contexts: {
            data: {
              tokenId,
              cleareCache: options.clearCache,
            },
            error: {
              errors: JSON.stringify(data.errors),
            },
          },
        });
        return;
      }

      // update reserveAuction for token
      this.model.updateTokenAuction(tokenId, data);
    } catch (error) {
      this.sentry.captureException(error);
      this.snackbar.sendError(NftErrors.ERROR_TRY_REFRESH);
    } finally {
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  };

  getClipIdForTxHash = async (txHash: string): Promise<{ id: string } | null> => {
    this.model.meta.setLoading(true);

    try {
      const nftClip = await this.subgraph.fetchClipByHashCached(txHash);
      console.log("[LOG]:nftClip", nftClip);

      if (!nftClip) {
        this.model.meta.setError(new AppError({ msg: NftErrors.FAILED_TO_FETCH_SUBGRAPH_DATA, type: "subgraph-clip" }));

        this.sentry.captureEvent({
          message: "empty clip from subgraph",
          contexts: {
            data: {
              txHash: txHash,
            },
          },
        });
        return null;
      }

      if (isSubgraphError(nftClip)) {
        this.model.meta.setError(new AppError({ msg: NftErrors.SOMETHING_WENT_WRONG, type: "subgraph-query" }));

        this.sentry.captureEvent({
          message: "failed to fetch clip from subgraph",
          contexts: {
            data: {
              txHash: txHash,
              errors: JSON.stringify(nftClip.errors),
            },
          },
        });
        return null;
      }

      return nftClip;
    } catch (error) {
      console.log("[LOG]:fetchClipByHashCached err", error);
      this.model.meta.setError(new AppError({ msg: NftErrors.FAILED_TO_FETCH_SUBGRAPH_DATA, type: "subgraph-clip" }));

      this.sentry.captureException(error, {
        contexts: {
          data: {
            txHash: txHash,
            error: JSON.stringify(error),
          },
        },
      });

      return null;
    } finally {
      this.model.meta.setLoading(false);
    }
  };

  private getMetadataForClipFragmentAndStoreInModel = async (
    clip?: ClipPartialFragment,
    options: { shouldThrow?: boolean; target: "metadata" | "auctionBid" } = { target: "metadata" }
  ) => {
    const { shouldThrow, target } = options;

    if (clip == null) {
      return;
    }

    if (target === "metadata" && this.model.hasMetadata[clip.id]) {
      // we already have metadata for this clip
      return;
    }

    if (target === "auctionBid" && this.model.hasAuctionBidsMetadata[clip.id]) {
      // we already have metadata for this clip aucton bid
      return;
    }

    const metadataCid = this.parseCidFromURI(clip.metadataURI);
    if (!metadataCid) {
      this.sentry.captureEvent({
        message: "invalid metadata cid from metadataURI",
        contexts: {
          data: {
            metadataURI: clip.metadataURI,
            metadataCid,
            tokenId: clip.id,
          },
        },
      });
      if (shouldThrow) {
        throw new Error(`Invalid metadataURI? ${clip.metadataURI}`);
      }
      return;
    }

    const metadata = await this.getMetadataFromIpfs(metadataCid);
    if (!metadata) {
      if (shouldThrow) {
        throw new Error(`No token metadata? ${clip.metadataURI}`);
      }
      return;
    }

    const metadataForModel = {
      ...metadata,
      metadataCid,
      tokenId: clip.id,
      owner: clip.owner.id,
      currentBids: clip.currentBids,
      reserveAuction: clip.reserveAuctions,
    };

    if (target === "metadata") {
      this.model.addMetadata(metadataForModel);
    } else if (target === "auctionBid") {
      this.model.addAuctionBidMetadata(metadataForModel);
    } else {
      throw new Error(`Invalid metadata target: ${target}`);
    }
  };

  private parseCidFromURI = (uri: string): string => {
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "").split("/")[0];
    }
    return "";
  };

  private getMetadataFromIpfs = async (cid: string) => {
    const resp = await this.offChainStorage.getMetadata(cid);
    if (resp.statusOk && this.offChainStorage.isIpfsMetadata(resp.body)) {
      return resp.body;
    }

    this.sentry.captureEvent({
      message: "failed to get metadata from IPFS",
      contexts: {
        request: {
          cid,
        },
        response: {
          statusCode: resp.statusCode,
          statusOk: resp.statusOk,
          body: JSON.stringify(resp.body),
        },
      },
    });

    return null;
  };
}
