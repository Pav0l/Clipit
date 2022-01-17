import type { NftModel } from "./nft.model";
import { NftErrors } from './nft.errors';
import { ISubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { ClipPartialFragment } from "../../lib/graphql/types";


export class NftController {

  constructor(
    private model: NftModel,
    private offChainStorage: OffChainStorage,
    private subgraph: ISubgraphClient
  ) { }

  getTokenMetadata = async (tokenId: string) => {
    try {
      const tokenMetadata = this.model.getTokenMetadata(tokenId);
      if (tokenMetadata) {
        return tokenMetadata;
      }

      const clip = await this.subgraph.fetchClipCached(tokenId);
      if (!clip) {
        this.model.meta.setError(NftErrors.CLIP_DOES_NOT_EXIST);
        return;
      }

      await this.getMetadataForClipFragmentAndStoreInModel(clip, true);
    } catch (error) {
      // TODO SENTRY
      console.log('[LOG]:getTokenMetadata err', error);
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  getCurrentSignerTokensMetadata = async (address: string) => {
    try {
      this.model.meta.setLoading(true);

      const data = await this.subgraph.fetchUserCached(address);
      if (!data) {
        return;
      }

      for (const clip of data.collection) {
        await this.getMetadataForClipFragmentAndStoreInModel(clip);
        // we can stop loading after we have data for first NFT
        this.model.meta.setLoading(false);
      }

    } catch (error) {
      // TODO SENTRY
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    } finally {
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  }

  getOwnerMetadata = (ownerAddress: string | null) => {
    if (!ownerAddress) {
      return [];
    }
    return this.model.getOwnMetadata(ownerAddress);
  }

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

      for (const clip of data.clips) {
        await this.getMetadataForClipFragmentAndStoreInModel(clip);
        this.model.meta.setLoading(false);
      }
    } catch (error) {
      // TODO SENTRY
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    } finally {
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  }

  getAuctionForToken = async (tokenId: string) => {
    try {
      this.model.meta.setLoading(true);

      const data = await this.subgraph.fetchAuctionCached(tokenId);

      if (data === null) {
        return;
      }

      // update reserveAuction for token
      this.model.updateTokenAuction(tokenId, data);

    } catch (error) {
      // TODO SENTRY
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    } finally {
      if (this.model.meta.isLoading) {
        this.model.meta.setLoading(false);
      }
    }
  }

  private getMetadataForClipFragmentAndStoreInModel = async (clip?: ClipPartialFragment, shouldThrow?: boolean) => {
    if (clip == null) {
      return;
    }

    if (this.model.hasMetadata[clip.id]) {
      // we already have metadata for this clip
      return;
    }

    const metadataCid = this.parseCidFromURI(clip.metadataURI);
    if (!metadataCid) {
      // TODO sentry this should not happen
      if (shouldThrow) {
        throw new Error(`Invalid metadataURI? ${clip.metadataURI}`);
      }
      return;
    }

    const metadata = await this.getMetadataFromIpfs(metadataCid);
    if (!metadata) {
      // TODO sentry - in case the metadata fetch fails
      if (shouldThrow) {
        throw new Error(`No token metadata? ${clip.metadataURI}`)
      }
      return;
    }

    this.model.addMetadata({
      ...metadata,
      metadataCid,
      tokenId: clip.id,
      owner: clip.owner.id,
      currentBids: clip.currentBids,
      reserveAuction: clip.reserveAuctions,
    });
  }

  private parseCidFromURI = (uri: string): string => {
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "").split("/")[0];
    }
    return "";
  }

  private getMetadataFromIpfs = async (cid: string) => {
    const resp = await this.offChainStorage.getMetadata(cid);
    if (resp.statusOk) {
      return resp.body;
    }
    return null;
  }
}
