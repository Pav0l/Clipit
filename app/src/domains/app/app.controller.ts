import { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from "../../lib/contract/contract.client";
import EthereumClient from "../../lib/ethereum/ethereum.client";
import { IpfsClient } from "../../lib/ipfs/ipfs.client";
import { SnackbarClient } from "../snackbar/snackbar.client";
import { IStore } from "../../store/root.store";
import { NftController } from "../nfts/nft.controller";
import { ClipController } from "../twitch-clips/clip.controller";
import { TwitchApiClient } from "../../lib/twitch-api/twitch-api.client";
import { GameController } from "../twitch-games/game.controller";
import { UserController } from "../twitch-user/user.controller";


export interface IAppController {
  nft?: NftController;
  clip: ClipController;
  game: GameController;
  user: UserController;

  createNftCtrl: (ethereum: EthereumClient, contract: ContractClient) => void;
}


export class AppController implements IAppController {
  nft?: NftController;
  clip: ClipController;
  game: GameController;
  user: UserController;

  constructor(
    private model: IStore,
    private snackbarClient: SnackbarClient,
    private clipitApi: ClipItApiClient,
    private twitchApi: TwitchApiClient,
    private ipfsApi: IpfsClient
  ) {
    this.clip = new ClipController(model.clipsStore, this.snackbarClient, this.twitchApi);
    this.game = new GameController(model.gameStore, this.twitchApi);
    this.user = new UserController(model.userStore, this.twitchApi);
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
        this.model.nftStore,
        this.snackbarClient,
        this.clipitApi,
        this.ipfsApi,
        ethereum,
        contract
      )
    }
  }
}
