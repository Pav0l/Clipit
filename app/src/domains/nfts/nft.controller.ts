import type { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import type { NftModel, Signature } from "./nft.model";
import type ContractClient from '../../lib/contract/contract.client';
import type { IpfsClient } from '../../lib/ipfs/ipfs.client';
import type { SnackbarClient } from '../../lib/snackbar/snackbar.client';

import { isStoreClipError } from "../../lib/clipit-api/clipit-api.client";
import { ContractErrors, isRpcError, NftErrors, RpcErrors } from './nft.errors';
import { BytesLike } from "ethers";
import { Decimal } from "../../lib/decimal/decimal";
import { SubgraphClient } from "../../lib/graphql/subgraph.client";


export class NftController {

  constructor(
    private model: NftModel,
    private snackbarClient: SnackbarClient,
    private clipitApi: ClipItApiClient,
    private ipfsClient: IpfsClient,
    private contractClient: ContractClient,
    private subgraph: SubgraphClient
  ) { }

  prepareMetadataAndMintClip = async (clipId: string, address: string) => {
    this.model.startClipStoreLoader();

    const resp = await this.clipitApi.storeClip(clipId, address);

    if (resp.statusOk && !isStoreClipError(resp.body)) {
      this.model.stopClipStoreLoaderAndStartMintLoader();

      const nftClip = await this.mintNFT(resp.body.mediadata, clipId, resp.body.signature);
      console.log('[LOG]:nftClip', nftClip);
      if (nftClip) {
        const tokenId = nftClip.id;

        this.model.addMetadata({ ...resp.body.metadata, metadataCid: resp.body.metadataCid, tokenId })
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

      const metadataURI = await this.contractClient.getTokenMetadataURI(tokenId);
      const metadataCid = this.parseCidFromURI(metadataURI);
      if (!metadataCid) {
        // TODO sentry this should not happen
        throw new Error("Invalid metadataURI");
      }

      const metadata = await this.getMetadataFromIpfs(metadataCid);
      if (!metadata) {
        throw new Error(`No token metadata? ${metadataURI}`)
      }

      this.model.addMetadata({ ...metadata, metadataCid, tokenId });
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

      for (const clipData of data.collection) {
        const metadataCid = this.parseCidFromURI(clipData.metadataURI);
        if (!metadataCid) {
          // TODO sentry this should not happen
          continue;
        }

        const metadata = await this.getMetadataFromIpfs(metadataCid);
        if (!metadata) {
          // in case the metadata fetch fails
          continue;
        }

        this.model.addMetadata({ ...metadata, metadataCid, tokenId: clipData.id });
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

  private parseCidFromURI = (uri: string): string => {
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "").split("/")[0];
    }
    return "";
  }

  private getMetadataFromIpfs = async (cid: string) => {
    // TODO refactor this error handling
    try {
      return this.ipfsClient.getMetadata(cid);
    } catch (error) {
      // TODO sentry
      console.log('[LOG]:getMetadata err', error);
      return null;
    }
  }

  private mintNFT = async (data: { tokenURI: string, metadataURI: string, contentHash: BytesLike, metadataHash: BytesLike }, clipId: string, signature: Signature) => {
    // TODO for now just set some default bidshares
    const defaultBidshares = {
      creator: Decimal.from(5),
      owner: Decimal.from(95),
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
