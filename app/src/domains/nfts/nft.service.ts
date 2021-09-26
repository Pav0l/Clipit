import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, BigNumberish } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

import { clipItApiClient, StoreClipResp } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from '../../lib/contract/contract.client';
import EthereumClient from '../../lib/ethereum/ethereum.client';
import { ConnectInfo, EthereumProvider, ProviderMessage, ProviderRpcError } from '../../lib/ethereum/ethereum.types';
import { NftStore } from "../../store/nft.store";
import { clearClipToMetadataPair, storeClipToMetadataPair } from "./nft.utils";
import { snackbarClient } from '../../modules/snackbar/snackbar.client';
import { isRpcError, NftErrors, RpcErrors } from './nft.errors';


export class NftService {

  constructor(private nftStore: NftStore) { }

  /**
   * This method is UX heavy. It handles the MetaMask / Ethereum stuff (install metamask / connect metamask / approve transaction)
   * @param clipId 
   * @dev 
   */
  prepareMetadataAndMintClip = async (clipId: string) => {
    const provider = await this.getProvider();
    if (!provider) {
      // Just return, user was notified & started onboarding flow
      return;
    }
    const ethereumClient = this.initializeEthereumClient(provider);

    if (!ethereumClient) {
      // Just return, user was notified in initializeEthereumClient via snackbar message
      return;
    }
    await this.requestAccounts(ethereumClient);

    // TODO - this loader will take about 45-60 seconds, so there needs to be something better tha just loader
    this.nftStore.meta.setLoading(true);

    const userWalletAddress = await ethereumClient.signer.getAddress();

    const resp = await clipItApiClient.storeClip(clipId, userWalletAddress);

    if (resp.statusOk) {
      storeClipToMetadataPair(clipId, resp.body.metadataCid!); // TODO fix !
      const txHash = resp.body.transactionHash!; // TODO fix !

      const transaction = await ethereumClient.ethersProvider.getTransaction(txHash);

      await this.waitForBlockConfirmations(transaction.blockNumber!, clipId, resp.body, ethereumClient);
    } else {
      // TODO - handle failed storage / approval of clip
    }

    this.nftStore.meta.setLoading(false);
  }

  requestAccounts = async (ethereumClient: EthereumClient) => {
    console.log("[LOG]:requestAccounts", ethereumClient)
    // ask user to connect wallet to app
    try {
      // this should be called everytime we need to have users account setup properly
      const requestAccounts = await ethereumClient.requestAccounts();
      console.log("[LOG]:requestAccounts:success", requestAccounts);
      this.nftStore.setAccounts(requestAccounts);
    } catch (error) {
      console.log("[LOG]:requestAccounts:error", error);

      if (isRpcError(error)) {
        switch (error.code) {
          case RpcErrors.REQUEST_ALREADY_PENDING:
            snackbarClient.sendError(NftErrors.REQUEST_ALREADY_PENDING)
            return;

          default:
            snackbarClient.sendError(NftErrors.CONNECT_METAMASK);
            return;
        }
      }
      snackbarClient.sendError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  initializeEthereumClient = (provider: EthereumProvider): EthereumClient | null => {
    let ethereumClient: EthereumClient;
    try {
      console.log('[LOG]:registering handlers')
      ethereumClient = new EthereumClient(provider, {
        handleConnect: this.handleConnect,
        handleDisconnect: this.handleDisconnect,
        handleAccountsChange: this.handleAccountsChange,
        handleMessage: this.handleMessage
      });
    } catch (error) {
      console.log('[LOG]:EthereumClient constructor error', error);
      snackbarClient.sendError(NftErrors.INSTALL_METAMASK);
      return null;
    }

    return ethereumClient;
  }

  private async getProvider(): Promise<EthereumProvider | null> {
    const metamaskProvider = await detectEthereumProvider() as Promise<EthereumProvider | null>;
    const onboarding = new MetaMaskOnboarding();

    if (metamaskProvider === null) {
      // TODO consider importing this via constructor with other clients
      snackbarClient.sendError(NftErrors.INSTALL_METAMASK);
      onboarding.startOnboarding();
      return null;
    }
    return metamaskProvider;
  }

  private mintNFT = async (signer: ethers.providers.JsonRpcSigner, data: { metadataCid: string, clipId: string, walletAddress: string }) => {
    const { metadataCid, clipId, walletAddress } = data;
    if (metadataCid && clipId) {
      // TODO handle the wait time in UI
      this.nftStore.setConfirmTx();

      const contractClient = new ContractClient(signer, {
        handleApproval: this.handlerAPPROVAL,
        handleApprovalAll: this.handlerAPPROVAL_ALL,
        handleTransfer: this.handlerTRANSFER
      })

      try {
        const tx = await contractClient.mint(walletAddress, metadataCid);
        console.log("[LOG]:minting NFT in tx", tx.hash);


        // TODO - this does not display the state change properly
        this.nftStore.setPendingTx();

        const receipt = await tx.wait();
        console.log("[LOG]:mint:done! gas used to mint:", receipt.gasUsed.toString());
        clearClipToMetadataPair(clipId);

        this.nftStore.setSuccessTx();
      } catch (error) {
        console.log("[LOG]:mint:error", error);

        if (isRpcError(error)) {
          if (error.code === RpcErrors.USER_REJECTED_REQUEST) {
            snackbarClient.sendError(NftErrors.MINT_REJECTED);
          } else {
            // SENTRY
          }
          return;
        } else {
          // SENTRY
          // unknown error
          this.nftStore.meta.setError(NftErrors.FAILED_TO_MINT);
        }
      }
    } else {
      console.log("[LOG]:mint:missing metadataCid when minting", metadataCid, clipId);
      this.nftStore.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
    }
  }

  private waitForBlockConfirmations = async (txBlockNum: number, clipId: string, metadataData: StoreClipResp, eC: EthereumClient) => {
    const REQUIRED_NUM_OF_CONFIRMATIONS = 0; // TODO back to 3

    let currentBlockNum = await eC.ethersProvider.getBlockNumber();
    const diff = currentBlockNum - txBlockNum;
    const percentageProgress = Math.floor((diff * 100) / REQUIRED_NUM_OF_CONFIRMATIONS);

    this.nftStore.setConfirmationProgress(percentageProgress)
    console.log(`Waiting for block confirmations.\nCurrent block number:${currentBlockNum}\nTransaction block number:${txBlockNum}\nProgress:${percentageProgress}%`);

    if (diff >= REQUIRED_NUM_OF_CONFIRMATIONS) {
      this.nftStore.doneConfirmations(clipId);
      this.nftStore.createMetadata(metadataData);

      const walletAddress = await eC.signer.getAddress();

      await this.mintNFT(eC.signer, {
        metadataCid: this.nftStore.metadata?.metadataCid!,
        clipId, walletAddress
      }); // TODO: fix !
      return; // end condition for the recursive call
    }
    setTimeout(() => {
      this.waitForBlockConfirmations(txBlockNum, clipId, metadataData, eC);
    }, 6500); // The avg block time is around 12 seconds, but we don't want to wait that long
  }

  private handlerAPPROVAL = (owner?: string | null, approved?: string | null, tokenId?: BigNumberish | null) => {
    console.log(`[APPROVAL] from ${owner} to ${approved} for ${tokenId}`)
  };

  private handlerAPPROVAL_ALL = (owner?: string | null, operator?: string | null, approved?: any) => {
    console.log(`[APPROVAL_ALL] from ${owner} to ${operator} approval status: ${approved}`)
  };

  private handlerTRANSFER = (from?: string | null, to?: string | null, tokenId?: BigNumberish | null) => {
    console.log(`[TRANSFER] from ${from} to ${to} for ${tokenId}`)
  };

  private handleConnect = (data: ConnectInfo) => {
    console.log("[LOG]:connect:data", data);
  }

  private handleDisconnect = (error: ProviderRpcError) => {
    // TODO - how do we handle this error?
    console.log("[LOG]:disconnect:error", error);

    snackbarClient.sendError(NftErrors.DISCONNECTED)
  }

  private handleAccountsChange = (accounts: string[]) => {
    console.log("[LOG]:accountsChange:data", accounts);
    this.nftStore.setAccounts(accounts);
  }

  private handleMessage = (message: ProviderMessage) => {
    console.log("[LOG]:message:", message);
  }

}
