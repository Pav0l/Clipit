import detectEthereumProvider from "@metamask/detect-provider";
import { BigNumberish } from "@ethersproject/bignumber";

import type { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from "../../lib/contract/contract.client";
import EthereumClient from "../../lib/ethereum/ethereum.client";
import { IpfsClient } from "../../lib/ipfs/ipfs.client";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { AppModel } from "./app.model";
import { NftController } from "../nfts/nft.controller";
import { ClipController } from "../twitch-clips/clip.controller";
import { GameController } from "../twitch-games/game.controller";
import { UserController } from "../twitch-user/user.controller";


export interface IAppController {
  nft?: NftController;
  clip: ClipController;
  game: GameController;
  user: UserController;

  createNftCtrl: (ethereum: EthereumClient, contract: ContractClient) => void;
  initializeWeb3Clients: () => Promise<{ ethereum: EthereumClient; contract: ContractClient }>;
}


export class AppController implements IAppController {
  nft?: NftController;
  clip: ClipController;
  game: GameController;
  user: UserController;

  constructor(
    private model: AppModel,
    private snackbarClient: SnackbarClient,
    private clipitApi: ClipItApiClient,
    private twitchApi: TwitchApiClient,
    private ipfsApi: IpfsClient
  ) {
    this.clip = new ClipController(model.clip, this.snackbarClient, this.twitchApi);
    this.game = new GameController(model.game, this.twitchApi);
    this.user = new UserController(model.user, this.twitchApi);
  }

  async initializeWeb3Clients() {
    const metamaskProvider =
      (await detectEthereumProvider()) as EthereumProvider | null;

    if (metamaskProvider === null) {
      // TODO insert clickable link for snackbar
      throw new Error("Please install MetaMask to view or create your NFTs.");
    }
    // TODO remove log
    console.log("creating new ethereum & contract client");
    const ethereum = new EthereumClient(metamaskProvider, {
      handleAccountsChange: this.model.nft.setAccounts,
      handleConnect: (data) => console.log("handleConnect", data),
      handleDisconnect: (data) => console.log("handleDisconnect", data),
      handleMessage: (data) => console.log("handleMessage", data)
    });

    const contract = new ContractClient(ethereum.signer, {
      handleApproval: (
        owner?: string | null,
        approved?: string | null,
        tokenId?: BigNumberish | null
      ) => {
        console.log(
          `[APPROVAL](initW3clients) from ${owner} to ${approved} for ${tokenId}`
        );
      },
      handleApprovalAll: (
        owner?: string | null,
        operator?: string | null,
        approved?: any
      ) => {
        console.log(
          `[APPROVAL_ALL](initW3clients) from ${owner} to ${operator} approval status: ${approved}`
        );
      },
      handleTransfer: (
        from?: string | null,
        to?: string | null,
        tokenId?: BigNumberish | null
      ) => {
        console.log(`[TRANSFER](initW3clients) from ${from} to ${to} for ${tokenId}`);
        if (tokenId) {
          this.model.nft.setTokenId(tokenId.toString());
        }
      }
    });

    return { ethereum, contract };
  }

  /**
   * createNftCtrl creates NftController instance. 
   * This will require MetaMask to be installed from the user,
   * that's why we're instantiating it only just when we need it
   */
  createNftCtrl(ethereum: EthereumClient, contract: ContractClient) {
    // TODO remove log
    console.log('creating new nft controller:', Boolean(!this.nft));
    if (!this.nft) {
      this.nft = new NftController(
        this.model.nft,
        this.snackbarClient,
        this.clipitApi,
        this.ipfsApi,
        ethereum,
        contract
      )
    }
  }
}
