import { BigNumber, BytesLike } from "ethers";

import { IClipItContractClient } from "../../lib/contracts/ClipIt/clipit-contract.client";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { ChainId, EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { Web3Model, Web3Errors } from "./web3.model";
import { ISubgraphClient } from "../../lib/graphql/subgraph.client";
import { OffChainStorage } from "../../lib/off-chain-storage/off-chain-storage.client";
import { Decimal } from "../../lib/decimal/decimal";
import { ClipItContractErrors, isEthersJsonRpcError } from "../../lib/contracts/ClipIt/clipit-contract.errors";
import { isRpcError, RpcErrors } from "../../lib/ethereum/rpc.errors";
import EthereumClient from "../../lib/ethereum/ethereum.client";

interface Signature {
  v: number;
  r: string;
  s: string
}

export interface IWeb3Controller {
  // silently try to get ethAccounts
  connectMetaMaskIfNecessaryForConnectBtn: () => Promise<void>;
  // mint token
  requestConnectAndMint: (clipId: string, creatorShare: string, clipTitle: string, clipDescription?: string) => Promise<void>;
  // open MM and call requestAccounts
  requestConnect: (andThenCallThisWithSignerAddress?: (addr: string) => Promise<void>) => Promise<void>;
  // get current users balance
  getBalance: (address: string) => Promise<void>;
}


export class Web3Controller implements IWeb3Controller {
  constructor(
    private model: Web3Model,
    private offChainStorage: OffChainStorage,
    private subgraph: ISubgraphClient,
    private snackbar: SnackbarClient,
    private clipitContractCreator: (provider: EthereumProvider) => IClipItContractClient
  ) { }

  async connectMetaMaskIfNecessaryForConnectBtn() {
    if (!this.model.isMetaMaskInstalled()) {
      // TODO maybe the button text handling should live somewhere here
      // so this controller does not have to rely on the button logic
      // if MM is not installed, do nothing. the button will prompt for installation
      return;
    }

    // MM connected already -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    await this.ethAccounts();
  }

  async requestConnect(andThenCallThisWithSignerAddress?: (addr: string) => Promise<void>) {
    // can't display this page if MM not installed
    if (!this.model.isMetaMaskInstalled()) {
      this.model.meta.setError(Web3Errors.INSTALL_METAMASK);
      return;
    }

    // MM connected already -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    this.model.meta.setLoading(true);

    await this.requestAccounts();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      this.model.meta.setError(Web3Errors.CONNECT_METAMASK);
      return;
    }

    if (andThenCallThisWithSignerAddress) {
      await andThenCallThisWithSignerAddress(signerAddress)
    }

    this.model.meta.setLoading(false);
  }

  async requestConnectAndMint(clipId: string, creatorShare: string, clipTitle: string, clipDescription?: string) {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (!this.model.isProviderConnected()) {
      await this.requestAccounts();
    }
    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.prepareMetadataAndMintClip(
      clipId,
      signerAddress,
      creatorShare,
      clipTitle,
      clipDescription
    );
  }

  getBalance = async (address: string) => {
    try {
      const balance = await this.initEthClient().getBalance(address);
      this.model.setEthBalance(BigNumber.from(balance));
    } catch (error) {
      // TODO sentry
    }
  }


  private prepareMetadataAndMintClip = async (clipId: string, address: string, creatorShare: string, clipTitle: string, clipDescription?: string) => {
    if (!clipId || !address || !clipTitle) {
      // TODO sentry this should not happen
      this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
      return;
    }

    this.model.startClipStoreLoader();

    const resp = await this.offChainStorage.saveClipAndCreateMetadata(clipId, { address, clipTitle, clipDescription });

    if (resp.statusOk && !this.offChainStorage.isStoreClipError(resp.body)) {
      this.model.stopClipStoreLoaderAndStartMintLoader();

      const txHash = await this.mintNFT(resp.body.mediadata, clipId, resp.body.signature, creatorShare);
      if (!txHash) {
        return;
      }

      const clip = await this.subgraph.fetchClipByHashCached(txHash);
      console.log('[LOG]:clip', clip);
      if (!clip) {
        // TODO sentry this should not happen    
        this.model.meta.setError(Web3Errors.FAILED_TO_FETCH_SUBGRAPH_DATA);
        return;
      }

      const tokenId = clip.id;
      // TODO ideally we do not want to reload the app here and just update state
      location.assign(location.origin + `/nfts/${tokenId}`);
    } else {
      // TODO improve errors from clipit-api
      this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
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
      const contract = this.clipitContractCreator(window.ethereum as EthereumProvider);
      const tx = await contract.mint(data, defaultBidshares, signature);
      console.log("[LOG]:minting NFT in tx", tx.hash);

      this.model.setWaitForTransaction();

      const receipt = await tx.wait();
      console.log("[LOG]:mint:done! gas used to mint:", receipt.gasUsed.toString());

      return tx.hash;
    } catch (error) {
      // TODO sentry
      console.log("[LOG]:mint:error", error);

      if (isEthersJsonRpcError(error)) {
        // take out Rpc error from Ethers error
        error = error.error;
      }

      if (isRpcError(error)) {
        switch (error.code) {
          case RpcErrors.USER_REJECTED_REQUEST:
            this.snackbar.sendInfo(Web3Errors.MINT_REJECTED);
            break;
          case RpcErrors.INTERNAL_ERROR:
            // contract reverts
            if (error.message.includes(ClipItContractErrors.ERC721_TOKEN_MINTED) || error.message.includes(ClipItContractErrors.CLIPIT_TOKEN_EXIST)) {
              this.snackbar.sendError(ClipItContractErrors.TOKEN_ALREADY_MINTED);
            } else if (error.message.includes(ClipItContractErrors.CLIPIT_INVALID_ADDRESS)) {
              this.snackbar.sendError(ClipItContractErrors.ADDRESS_NOT_ALLOWED);
            }
            break;
          default:
            // SENTRY
            this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
            break;
        }
      } else {
        // SENTRY
        // unknown error
        this.model.meta.setError(Web3Errors.FAILED_TO_MINT);
      }

      return null;
    } finally {
      // clean the loading screen
      this.model.stopMintLoader();
    }
  }

  private requestAccounts = async () => {
    try {
      const accounts = await this.initEthClient().requestAccounts();
      console.log('[ethereum.controller]:requestAccounts:accounts', accounts);

      this.model.setAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:requestAccounts:error", error);

      if (!isRpcError(error)) {
        this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
        return;
      }

      switch (error.code) {
        case RpcErrors.REQUEST_ALREADY_PENDING:
          this.snackbar.sendError(Web3Errors.REQUEST_ALREADY_PENDING);
          break;
        case RpcErrors.USER_REJECTED_REQUEST:
          this.snackbar.sendInfo(Web3Errors.CONNECT_MM_WARNING);
          break;
        default:
          this.snackbar.sendError(Web3Errors.CONNECT_METAMASK);
          break;
      }
    }
  }

  private ethAccounts = async () => {
    try {
      const accounts = await this.initEthClient().ethAccounts();
      console.log('[ethereum.controller]:ethAccounts:accounts', accounts);

      this.model.setAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:ethAccounts:error", error);
      this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
    }
  }

  private initEthClient = () => {
    const client = new EthereumClient(window.ethereum as EthereumProvider);
    client.registerEventHandler("chainChanged", this.handleChainChanged);
    client.registerEventHandler("accountsChanged", this.handleAccountsChange);
    return client;
  };

  private handleAccountsChange = (accounts: string[]) => {
    console.log('[web3.controller]:handleAccountsChange', accounts);
    this.model.setAccounts(accounts);
    this.model.resetEthBalance();
  }

  private handleChainChanged(chainId: ChainId) {
    console.log("[web3.controller]::chainChanged", chainId)
    window.location.reload();
  }
}
