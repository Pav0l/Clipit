import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, BigNumberish } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

import { clipItApiClient, StoreClipResp } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from '../../lib/contract/contract.client';
import ClipItError, { ErrorCodes } from '../../lib/errors/errors';
import EthereumClient from '../../lib/ethereum/ethereum.client';
import { ConnectInfo, EthereumProvider, ProviderMessage, ProviderRpcError } from '../../lib/ethereum/ethereum.types';
import { NftStore } from "../../store/nft.store";
import { clearClipToMetadataPair, storeClipToMetadataPair } from "./nft.utils";


export class NftService {

  constructor(private nftStore: NftStore) { }

  /**
   * This method is UX heavy. It handles the MetaMask / Ethereum stuff (install metamask / connect metamask / approve transaction)
   * @param clipId 
   * @dev 
   */
  prepareMetadataAndMintClip = async (clipId: string) => {
    const ethereumClient = await this.initializeEthereumClient();

    if (!ethereumClient) {
      this.nftStore.meta.setError("Failed to initialize MetaMask.") //TODO better error msg (link to extension)
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
    }

    this.nftStore.meta.setLoading(false);
  }

  requestAccounts = async (ethereumClient: EthereumClient) => {
    console.log('fetching accounts', ethereumClient)
    // ask user to connect wallet to app
    try {
      // this should be called everytime we need to have users account setup properly
      const requestAccounts = await ethereumClient.requestAccounts();
      console.log('eth_requestAccounts', requestAccounts);
      this.nftStore.setAccounts(requestAccounts);
    } catch (error) {
      // TODO: this can throw https://eips.ethereum.org/EIPS/eip-1193#provider-errors
      // handle 4001 user rejected request to connect and others (general error)
      // maybe utilize the metamask library https://github.com/MetaMask/eth-rpc-errors
      console.log("eth_requestAccounts err", error);
      this.nftStore.meta.setError("You need to connect your MetaMask Wallet to be able to mint the clip into NFT");
    }
  }

  initializeEthereumClient = async (): Promise<EthereumClient | null> => {
    const metamaskProvider = await this.getMetamaskProviderIfInstalled();
    const onboarding = new MetaMaskOnboarding();
    console.log('init client')
    if (metamaskProvider === null) {
      this.nftStore.meta.setError("Please install Metamask extension and generate your Ethereum Wallet in it");
      onboarding.startOnboarding();
      return null;
    }

    let ethereumClient: EthereumClient;
    try {
      console.log('registering handlers')
      ethereumClient = new EthereumClient(metamaskProvider, {
        handleConnect: this.handleConnect,
        handleDisconnect: this.handleDisconnect,
        handleAccountsChange: this.handleAccountsChange,
        handleMessage: this.handleMessage
      });
    } catch (error) {
      console.log('ethereumClient construc err', error);

      // TODO handle EthereumClient constructor error
      return null;
    }

    return ethereumClient;
  }

  getMetamaskProviderIfInstalled = async (): Promise<EthereumProvider | null> => {
    return detectEthereumProvider() as Promise<EthereumProvider | null>;
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
        console.log("minting NFT in tx", tx.hash);


        // TODO - this does not display the state change properly
        this.nftStore.setPendingTx();

        const receipt = await tx.wait();
        console.log("done! gas used to mint:", receipt.gasUsed.toString());
        clearClipToMetadataPair(clipId);

        this.nftStore.setSuccessTx();
      } catch (error) {
        // SENTRY
        // TODO handle specific errors (4001, ...)
        console.log("[LOG]:mint:error", error);
        this.nftStore.meta.setError("Failed to generate the NFT");
      }

    } else {
      console.log("Missing metadataCid when minting")
    }
  }

  private waitForBlockConfirmations = async (txBlockNum: number, clipId: string, metadataData: StoreClipResp, eC: EthereumClient) => {
    const REQUIRED_NUM_OF_CONFIRMATIONS = 3;

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

    throw new ClipItError('It seems we were disconnected. Please check your internet connection', ErrorCodes.RPC_DISCONNECT, { error })
  }

  handleAccountsChange = (accounts: string[]) => {
    console.log("[LOG]:accountsChange:data", accounts);
    this.nftStore.setAccounts(accounts);
  }

  private handleMessage = (message: ProviderMessage) => {
    console.log("[LOG]:message:", message);
  }

}
