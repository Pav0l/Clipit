import { BytesLike, ethers } from "ethers";

import ContractClient from "../../lib/contract/contract.client";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import EthereumController from "../../lib/ethereum/ethereum.controller";
import { EthereumModel, MetaMaskErrors } from "../../lib/ethereum/ethereum.model";
import { NftErrors } from "../nfts/nft.errors";
import { NftModel } from "../nfts/nft.model";
import { SubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { Decimal } from "../../lib/decimal/decimal";
import { ContractErrors, isRpcError, RpcErrors } from "./web3.errors";

// TODO clean up
export interface Signature {
  v: number;
  r: string;
  s: string
}


export interface IWeb3Controller {
  // silently try to get ethAccounts
  connectMetaMaskIfNecessaryForConnectBtn: () => Promise<void>;
  // open MM and call requestAccounts
  requestConnect: (andThenCallThisWithSignerAddress?: (addr: string) => Promise<void>) => Promise<void>;
  // mint token
  requestConnectAndMint: (clipId: string, creatorShare: string, clipTitle: string, clipDescription?: string) => Promise<void>;
}


export class Web3Controller implements IWeb3Controller {
  private eth?: EthereumController;
  private contract?: ContractClient;

  constructor(
    private model: EthereumModel,
    private snackbar: SnackbarClient,
    private offChainStorage: OffChainStorage,
    private subgraph: SubgraphClient
  ) { }

  async connectMetaMaskIfNecessaryForConnectBtn() {
    if (!this.model.isMetaMaskInstalled()) {
      // if MM is not installed, do nothing. the button will prompt for installation
      return;
    }

    // MM connected -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    try {
      this.initEthereumCtrlIfNotExist(this.model, this.snackbar);
      if (!this.eth) {
        throw new Error("Failed to init Etheruem Controller");
      }
      await this.eth.ethAccounts();
    } catch (error) {
      // TODO Sentry - this should not happen
      console.log('[app.controller]:connectMetaMaskIfNecessaryForConnectBtn:error', error);
      this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }

  }

  async requestConnect(andThenCallThisWithSignerAddress?: (addr: string) => Promise<void>) {
    this.model.meta.setLoading(true);

    await this.requestAccounts();

    const signer = this.model.getAccount();
    if (!signer) {
      this.model.meta.setError(MetaMaskErrors.CONNECT_METAMASK);
      return;
    }

    if (andThenCallThisWithSignerAddress) {
      await andThenCallThisWithSignerAddress(signer)
    }

    this.model.meta.setLoading(false);
  }

  async requestConnectAndMint(clipId: string, creatorShare: string, clipTitle: string, clipDescription?: string) {
    try {
      if (!this.model.isMetaMaskInstalled()) {
        this.snackbar.sendInfo(MetaMaskErrors.INSTALL_METAMASK);
        return;
      }

      if (!this.model.isProviderConnected()) {
        this.initEthereumCtrlIfNotExist(this.model, this.snackbar);
        if (!this.eth) {
          throw new Error("Failed to init Etheruem Controller");
        }
        await this.eth.requestAccounts();
      }

      this.initContractIfNotExist(this.model.signer);
      if (!this.contract) {
        throw new Error("Failed to init Contract");
      }

      const signer = this.model.getAccount();
      if (!signer) {
        throw new Error("Provider not connected???");
      }

      await this.prepareMetadataAndMintClip(
        clipId,
        signer,
        creatorShare,
        clipTitle,
        clipDescription
      );
    } catch (error) {
      console.log('[LOG]:requestConnectAndMint:err', error);
      // TODO sentry
      // invalid provider
      // init contract
      // prepareMetadataAndMintClip
      //  - storeClip error
      this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }


  private prepareMetadataAndMintClip = async (clipId: string, address: string, creatorShare: string, clipTitle: string, clipDescription?: string) => {
    if (!address || !clipTitle) {
      // TODO sentry this should not happen
      this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
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

        // TODO ideally we do not want to reload the app here and just update state
        location.replace(location.origin + `/nfts/${tokenId}`);
      } else {
        // TODO sentry this should not happen    
        this.model.meta.setError(NftErrors.FAILED_TO_FETCH_SUBGRAPH_DATA);
        return;
      }

    } else {
      this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
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
      const tx = await this.contract!.mint(data, defaultBidshares, signature);
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
            this.snackbar.sendError(NftErrors.MINT_REJECTED);
            // redirect to Clip, since we have the clip metadata, we'd otherwise display the IPFS Clip
            // TODO this can definitely be improved
            location.replace(`${location.origin}/clips/${clipId}`);

            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract errors / reverts
            if (error.message.includes("token already minted") || error.message.includes("token has already been created with this content hash")) {
              this.snackbar.sendError(ContractErrors.TOKEN_ALREADY_MINTED);
            } else if ((error.data?.message as string).includes("not allowed to mint")) {
              this.snackbar.sendError(ContractErrors.ADDRESS_NOT_ALLOWED);
            }
            break;
          default:
            // SENTRY
            this.snackbar.sendError(NftErrors.SOMETHING_WENT_WRONG);
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

  private async requestAccounts() {
    // can't display this page if MM not installed
    if (!this.model.isMetaMaskInstalled()) {
      this.model.meta.setError(MetaMaskErrors.INSTALL_METAMASK);
      return;
    }

    // MM connected -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    try {
      this.initEthereumCtrlIfNotExist(this.model, this.snackbar);
      if (!this.eth) {
        throw new Error("Failed to init Etheruem Controller");
      }
      await this.eth.requestAccounts();
    } catch (error) {
      // TODO track in sentry, this should not happen
      this.snackbar.sendError(MetaMaskErrors.SOMETHING_WENT_WRONG);
      return;
    }

    if (!this.model.signer) {
      // TODO sentry this should not happen
      this.model.meta.setError(MetaMaskErrors.SOMETHING_WENT_WRONG);
      return;
    }

    this.initContractIfNotExist(this.model.signer);
    if (!this.contract) {
      // TODO sentry this should not happen
      this.model.meta.setError(MetaMaskErrors.SOMETHING_WENT_WRONG);
      return;
    }
  }

  private initEthereumCtrlIfNotExist(model: EthereumModel, snackbar: SnackbarClient) {
    if (!this.eth) {
      // TODO EthController maybe should be just client and not need model and snackbar 
      // (those could be web3Controller dependencies)
      this.eth = new EthereumController(model, window.ethereum as EthereumProvider, snackbar);
    }
  }

  private initContractIfNotExist(signer?: ethers.providers.JsonRpcSigner) {
    if (this.contract) {
      return;
    }

    if (!signer) {
      return;
    }

    try {
      this.contract = new ContractClient(signer);
    } catch (error) {
      // TODO sentry - probably invalid signer
      this.snackbar.sendError(MetaMaskErrors.SOMETHING_WENT_WRONG);
    }
  }
}
