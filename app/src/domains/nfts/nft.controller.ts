import type { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import type { NftModel, Signature } from "./nft.model";
import type ContractClient from '../../lib/contract/contract.client';
import type { IpfsClient } from '../../lib/ipfs/ipfs.client';
import type { SnackbarClient } from '../../lib/snackbar/snackbar.client';

import { isStoreClipError } from "../../lib/clipit-api/clipit-api.client";
import { ContractErrors, isRpcError, NftErrors, RpcErrors } from './nft.errors';
import { BytesLike } from "ethers";
import { Decimal } from "../../lib/decimal/decimal";



export class NftController {

  constructor(
    private model: NftModel,
    private snackbarClient: SnackbarClient,
    private clipitApi: ClipItApiClient,
    private ipfsClient: IpfsClient,
    private contractClient: ContractClient
  ) { }

  prepareMetadataAndMintClip = async (clipId: string, address: string) => {
    this.model.startClipStoreLoader();

    const resp = await this.clipitApi.storeClip(clipId, address);

    if (resp.statusOk && !isStoreClipError(resp.body)) {
      this.model.createMetadata(resp.body.metadata!); // TODO fix !

      this.model.stopClipStoreLoaderAndStartMintLoader();

      await this.mintNFT(resp.body.mediadata, clipId, resp.body.signature);

    } else {
      this.snackbarClient.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  getMetadataFromIpfs = async (cid: string) => {
    return this.ipfsClient.getMetadata(cid);
  }

  getTokenMetadata = async (tokenId: string) => {
    try {
      const metadata = await this.fetchTokenMetadata(tokenId)
      this.model.createMetadata(metadata);
    } catch (error) {
      // TODO SENTRY
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  getCurrentSignerTokensMetadata = async (address: string) => {
    try {
      this.model.meta.setLoading(true);

      const events = await this.contractClient.getWalletsClipNFTs(address);

      const tokenIds: string[] = this.getTokenIdsFromEvents(events);
      console.log("tokenIds", tokenIds);

      const metadataCollection: Record<string, any> = {};
      for (const tokenId of tokenIds) {
        const metadata = await this.fetchTokenMetadata(tokenId)
        metadataCollection[tokenId] = metadata;
      }

      this.model.setMetadataCollection(metadataCollection);
    } catch (error) {
      // TODO SENTRY
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    } finally {
      this.model.meta.setLoading(false);
    }
  }

  private fetchTokenMetadata = async (tokenId: string) => {
    const uri = await this.contractClient.getMetadataUri(tokenId);
    const metadataCid = uri.replace("ipfs://", "").split("/")[0];

    return await this.getMetadataFromIpfs(metadataCid);
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

  // TODO fix any
  private getTokenIdsFromEvents = (transferOrApprovalEvents: any[]) => {
    return transferOrApprovalEvents?.map(event => event.args.tokenId.toString());
  }
}
