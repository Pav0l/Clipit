import { EthereumProvider } from "../../ethereum/ethereum.types";
import { IAuctionContractClient } from "./auction-contract.client";

class AuctionContractTestClient implements IAuctionContractClient {
  // TODO
}

export function AuctionContractCreator(_provider: EthereumProvider): IAuctionContractClient {
  return new AuctionContractTestClient();
}
