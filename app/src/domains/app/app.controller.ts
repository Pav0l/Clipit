import { ClipItApiClient } from "../../lib/clipit-api/clipit-api.client";
import ContractClient from "../../lib/contract/contract.client";
import EthereumClient from "../../lib/ethereum/ethereum.client";
import { IpfsClient } from "../../lib/ipfs/ipfs.client";
import { IStore } from "../../store/root.store";
import { NftController } from "../nfts/nft.controller";


export interface IAppController {
  nft?: NftController;
}


export class AppController implements IAppController {
  nft?: NftController;

  constructor(
    private model: IStore,
    private clipitApi: ClipItApiClient,
    private ipfsApi: IpfsClient
  ) {
  }

  createNftCtrl(ethereum: EthereumClient, contract: ContractClient) {
    // TODO remove log
    console.log('creating new nft controller:', Boolean(!this.nft));
    if (!this.nft) {
      this.nft = new NftController(
        this.model.nftStore,
        this.clipitApi,
        this.ipfsApi,
        ethereum,
        contract
      )
    }
  }
}
