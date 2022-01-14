import { ethers } from "ethers";

import AuctionHouseAbi from "./AuctionHouse.json";
import { AuctionHouse } from "./AuctionHouse";
import { auctionContractAddress } from "../../constants";
import { EthereumProvider } from "../../ethereum/ethereum.types";


export interface IAuctionContractClient {
  // 
}

class AuctionContractClient implements IAuctionContractClient {
  private contract: AuctionHouse;

  constructor(provider: EthereumProvider) {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const jsonRpcSigner = ethersProvider.getSigner();
      this.contract = (new ethers.Contract(auctionContractAddress, AuctionHouseAbi.abi, jsonRpcSigner)) as AuctionHouse;
    } catch (error) {
      // TODO sentry
      console.log("[auction.contract.client]:construct:error", error);
      throw new Error('Invalid ethereum provider');
    }
  }


}

export function AuctionContractCreator(provider: EthereumProvider): IAuctionContractClient {
  return new AuctionContractClient(provider);
}
