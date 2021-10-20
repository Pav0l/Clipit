import type { ClipItApiClient, StoreClipResp } from "../../lib/clipit-api/clipit-api.client";
import type { NftModel, Signature } from "./nft.model";
import type ContractClient from '../../lib/contract/contract.client';
import type EthereumClient from '../../lib/ethereum/ethereum.client';
import type { IpfsClient } from '../../lib/ipfs/ipfs.client';
import type { SnackbarClient } from '../../lib/snackbar/snackbar.client';

import { isStoreClipError } from "../../lib/clipit-api/clipit-api.client";
import { clearClipToMetadataPair, isClipMetadataCreated, storeClipToMetadataPair } from "./nft.local-storage";
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

  /**
   * This method is UX heavy. It handles the MetaMask / Ethereum stuff (install metamask / connect metamask / approve transaction)
   * @param clipId 
   * @dev 
   */
  prepareMetadataAndMintClip = async (clipId: string) => {
    await this.requestAccounts();

    // TODO - this loader will take about 45-60 seconds, so there needs to be something better tha just loader
    // "Preparing your Clip to be minted to NFT"
    // "Generating your signature"
    this.model.meta.setLoading(true);

    const userAddress = await this.ethereumClient.signer.getAddress();

    const resp = await this.clipitApi.storeClip(clipId, userAddress);

    if (resp.statusOk && !isStoreClipError(resp.body)) {

      this.model.doneConfirmations(clipId);
      this.model.createMetadata(resp.body.metadata!); // TODO fix !
      this.model.setMetadataCid(resp.body.metadataCid);

      // "Clip ready to be turned into an NFT. Please confirm the transaction"

      await this.mintNFT(resp.body.metadataCid!, clipId, userAddress, resp.body.signature); // TODO: fix !

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

  requestAccounts = async () => {
    // ask user to connect wallet to app
    try {
      // this should be called everytime we need to have users account setup properly
      const requestAccounts = await this.ethereumClient.requestAccounts();
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

        // TODO - this does not display the state change properly
        this.model.setPendingTx();

        const receipt = await tx.wait();
        console.log("[LOG]:mint:done! gas used to mint:", receipt.gasUsed.toString());
        clearClipToMetadataPair(clipId);

        this.model.setSuccessTx();
      } catch (error) {
        console.log("[LOG]:mint:error", error);

        if (isRpcError(error)) {
          switch (error.code) {
            case RpcErrors.USER_REJECTED_REQUEST:
              this.snackbarClient.sendError(NftErrors.MINT_REJECTED);
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

  private waitForBlockConfirmations = async (txBlockNum: number, clipId: string, metadataData: StoreClipResp) => {
    const REQUIRED_NUM_OF_CONFIRMATIONS = 0; // TODO back to 3

    let currentBlockNum = await this.ethereumClient.ethersProvider.getBlockNumber();
    const diff = currentBlockNum - txBlockNum;
    const percentageProgress = Math.floor((diff * 100) / REQUIRED_NUM_OF_CONFIRMATIONS);

    this.model.setConfirmationProgress(percentageProgress)
    console.log(`Waiting for block confirmations.\nCurrent block number:${currentBlockNum}\nTransaction block number:${txBlockNum}\nProgress:${percentageProgress}%`);

    if (diff >= REQUIRED_NUM_OF_CONFIRMATIONS) {
      this.model.doneConfirmations(clipId);
      this.model.createMetadata(metadataData.metadata!);
      this.model.setMetadataCid(metadataData.metadataCid)

      const walletAddress = await this.ethereumClient.signer.getAddress();

      // await this.mintNFT(this.model.metadataCid!, clipId, walletAddress); // TODO: fix !
      return; // end condition for the recursive call
    }
    setTimeout(() => {
      this.waitForBlockConfirmations(txBlockNum, clipId, metadataData);
    }, 6500); // The avg block time is around 12 seconds, but we don't want to wait that long
  }

  // TODO fix any
  private getTokenIdsFromEvents = (transferOrApprovalEvents: any[]) => {
    return transferOrApprovalEvents?.map(event => event.args.tokenId.toString());
  }
}
