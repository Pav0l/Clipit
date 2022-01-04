import { BytesLike } from "ethers";
import type { NftModel, Signature } from "./nft.model";
import type ContractClient from '../../lib/contract/contract.client';
import type { SnackbarClient } from '../../lib/snackbar/snackbar.client';
import { ContractErrors, isRpcError, NftErrors, RpcErrors } from './nft.errors';
import { Decimal } from "../../lib/decimal/decimal";
import { SubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { ClipPartialFragment } from "../../lib/graphql/types";


export class NftController {

  constructor(
    private model: NftModel,
    private snackbarClient: SnackbarClient,
    private offChainStorage: OffChainStorage,
    private contractClient: ContractClient,
    private subgraph: SubgraphClient
  ) { }

  prepareMetadataAndMintClip = async (clipId: string, address: string, creatorShare: string, clipTitle: string, clipDescription?: string) => {
    if (!address || !clipTitle) {
      // TODO sentry this should not happen
      this.snackbarClient.sendError(NftErrors.SOMETHING_WENT_WRONG);
      return;
    }

    this.model.startClipStoreLoader();

    const resp = await this.offChainStorage.saveClipAndCreateMetadata(clipId, { address, clipTitle, clipDescription });

    if (resp.statusOk && !this.offChainStorage.isStoreClipError(resp.body)) {
      this.model.stopClipStoreLoaderAndStartMintLoader();

      const nftClip = await this.mintNFT(resp.body.mediadata, clipId, resp.body.signature, creatorShare);
      console.log('[LOG]:nftClip', nftClip);
      if (nftClip) {
        const tokenId = nftClip.id;

        this.model.addMetadata({ ...resp.body.metadata, metadataCid: resp.body.metadataCid, tokenId, owner: nftClip.owner.id })
        this.model.stopMintLoader();

        // TODO ideally we do not want to reload the app here
        location.replace(location.origin + `/nfts/${tokenId}`);
      } else {
        // TODO sentry this should not happen    
        this.model.meta.setError(NftErrors.FAILED_TO_FETCH_SUBGRAPH_DATA);
        return;
      }

    } else {
      this.snackbarClient.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  getTokenMetadata = async (tokenId: string) => {
    try {
      const tokenMetadata = this.model.getTokenMetadata(tokenId);
      if (tokenMetadata) {
        return tokenMetadata
      }

      const clip = await this.subgraph.fetchClipCached(tokenId);

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

  private getMetadataForClipFragmentAndStoreInModel = async (clip: ClipPartialFragment, shouldThrow?: boolean) => {
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

    this.model.addMetadata({ ...metadata, metadataCid, tokenId: clip.id, owner: clip.owner.id });
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

  private mintNFT = async (data: { tokenURI: string, metadataURI: string, contentHash: BytesLike, metadataHash: BytesLike }, clipId: string, signature: Signature, creatorShare: string) => {
    // TODO abstract bidShares creation & calculation away
    const forCreator = Number(creatorShare); // if creatorShare is '' it's converted to 0 here
    const defaultBidshares = {
      creator: Decimal.from(forCreator),
      owner: Decimal.from(100 - forCreator),
      prevOwner: Decimal.from(0),
    }

    try {
      const tx = await this.contractClient.mint(data, defaultBidshares, signature);
      console.log("[LOG]:minting NFT in tx", tx.hash);

      this.model.setWaitForTransaction();

      const receipt = await tx.wait();
      console.log("[LOG]:mint:done! gas used to mint:", receipt.gasUsed.toString());

      return this.subgraph.fetchClipByHashCached(tx.hash);
    } catch (error) {
      console.log("[LOG]:mint:error", error);

      if (isRpcError(error)) {
        // clean the loading screen
        this.model.stopMintLoader();

        // TODO double check these error codes with spec & errors that we get from contract
        switch (error.code) {
          case RpcErrors.USER_REJECTED_REQUEST:
            this.snackbarClient.sendError(NftErrors.MINT_REJECTED);
            // redirect to Clip, since we have the clip metadata, we'd otherwise display the IPFS Clip
            // TODO this can definitely be improved
            location.replace(`${location.origin}/clips/${clipId}`);

            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract errors / reverts
            if (error.message.includes("token already minted") || error.message.includes("token has already been created with this content hash")) {
              this.snackbarClient.sendError(ContractErrors.TOKEN_ALREADY_MINTED);
            } else if ((error.data?.message as string).includes("not allowed to mint")) {
              this.snackbarClient.sendError(ContractErrors.ADDRESS_NOT_ALLOWED);
            }
            break;
          default:
            // SENTRY
            this.snackbarClient.sendError(NftErrors.SOMETHING_WENT_WRONG);
            break;
        }
        return;
      } else {
        // SENTRY
        // unknown error
        this.model.meta.setError(NftErrors.FAILED_TO_MINT);
      }
    }
  }
}
