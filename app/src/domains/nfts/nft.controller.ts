import type { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import type { NftModel, Signature } from "./nft.model";
import type ContractClient from '../../lib/contract/contract.client';
import type EthereumClient from '../../lib/ethereum/ethereum.client';
import type { IpfsClient } from '../../lib/ipfs/ipfs.client';
import type { SnackbarClient } from '../../lib/snackbar/snackbar.client';

import { isStoreClipError } from "../../lib/clipit-api/clipit-api.client";
import { ContractErrors, isRpcError, NftErrors, RpcErrors } from './nft.errors';



export class NftController {

  constructor(
    private model: NftModel,
    private snackbarClient: SnackbarClient,
    private clipitApi: ClipItApiClient,
    private ipfsClient: IpfsClient,
    private ethereumClient: EthereumClient,
    private contractClient: ContractClient
  ) { }

  prepareMetadataAndMintClip = async (clipId: string) => {
    await this.requestAccounts();

    this.model.startClipStoreLoader();

    const userAddress = await this.ethereumClient.signer.getAddress();

    const resp = await this.clipitApi.storeClip(clipId, userAddress);

    if (resp.statusOk && !isStoreClipError(resp.body)) {

      this.model.createMetadata(resp.body.metadata!); // TODO fix !

      this.model.stopClipStoreLoaderAndStartMintLoader();

      await this.mintNFT(resp.body.metadataCid, clipId, userAddress, resp.body.signature);

      this.model.stopMintLoader();

    } else if (isStoreClipError(resp.body) && resp.body.error === "wallet does not have enough funds to mint clip") {
      this.snackbarClient.sendError(resp.body.error)
    } else {
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    }

    this.model.meta.setLoading(false);
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
      this.model.meta.setError(NftErrors.INSTALL_METAMASK);
    }
  }

  getCurrentSignerTokensMetadata = async () => {
    try {
      this.model.meta.setLoading(true);
      const currentWalletAddress = await this.ethereumClient.signer.getAddress();

      const events = await this.contractClient.getWalletsClipNFTs(
        currentWalletAddress
      );

      const tokenIds: string[] = this.getTokenIdsFromEvents(events);
      console.log("tokenIds", tokenIds);

      const metadataCollection: Record<string, any> = {};
      for (const tokenId of tokenIds) {
        const metadata = await this.fetchTokenMetadata(tokenId)
        metadataCollection[tokenId] = metadata;
      }

      this.model.setMetadataCollection(metadataCollection);
      this.model.meta.setLoading(false);
    } catch (error) {
      // TODO SENTRY
      this.model.meta.setError(NftErrors.INSTALL_METAMASK);
    }
  }

  /**
   * requestAccounts opens MetaMask and asks user to connect wallet to app
   * @returns an array of connected account addresses
   */
  requestAccounts = async () => {
    try {
      // this should be called everytime we need to have users account setup properly
      const requestAccounts = await this.ethereumClient.requestAccounts();
      console.log('[nft.controller]: requestAccounts', requestAccounts);

      this.model.setAccounts(requestAccounts);
    } catch (error) {
      console.log("[LOG]:requestAccounts:error", error);

      if (isRpcError(error)) {
        switch (error.code) {
          case RpcErrors.REQUEST_ALREADY_PENDING:
            this.snackbarClient.sendError(NftErrors.REQUEST_ALREADY_PENDING)
            return;

          default:
            this.snackbarClient.sendError(NftErrors.CONNECT_METAMASK);
            return;
        }
      }
      this.snackbarClient.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * getAccounts tries to get providers accounts
   * @returns an array of connected account addresses or empty array if no account is connected to app
   */
  getAccounts = async () => {
    try {
      const accounts = await this.ethereumClient.ethAccounts();
      console.log('[nft.controller]: ethAccounts', accounts);

      this.model.setAccounts(accounts);
    } catch (error) {
      console.log("[LOG]:ethAccounts:error", error);
    }
  }

  private fetchTokenMetadata = async (tokenId: string) => {
    const uri = await this.contractClient.getMetadataTokenUri(tokenId);
    const metadataCid = uri.replace("ipfs://", "").split("/")[0];

    return await this.getMetadataFromIpfs(metadataCid);
  }

  private mintNFT = async (metadataCid: string, clipId: string, walletAddress: string, signature: Signature) => {
    if (metadataCid && clipId) {

      try {
        const tx = await this.contractClient.mint(walletAddress, metadataCid, signature.v, signature.r, signature.s);
        console.log("[LOG]:minting NFT in tx", tx.hash);

        const receipt = await tx.wait();
        console.log("[LOG]:mint:done! gas used to mint:", receipt.gasUsed.toString());
      } catch (error) {
        console.log("[LOG]:mint:error", error);

        if (isRpcError(error)) {
          switch (error.code) {
            case RpcErrors.USER_REJECTED_REQUEST:
              this.snackbarClient.sendError(NftErrors.MINT_REJECTED);
              // redirect to Clip, since we have the clip metadata, we'd otherwise display the IPFS Clip
              // TODO this can definitely be improved
              location.replace(`${location.origin}/clips/${clipId}`);

              break;
            case RpcErrors.INTERNAL_ERROR:
              // contract errors / reverts
              if ((error.data?.message as string).includes("token already minted")) {
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
    } else {
      console.log("[LOG]:mint:missing metadataCid when minting", metadataCid, clipId);
      this.model.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  // TODO fix any
  private getTokenIdsFromEvents = (transferOrApprovalEvents: any[]) => {
    return transferOrApprovalEvents?.map(event => event.args.tokenId.toString());
  }
}
