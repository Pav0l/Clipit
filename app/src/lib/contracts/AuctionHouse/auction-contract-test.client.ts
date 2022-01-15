import { BigNumberish, ContractTransaction } from "ethers";
import { EthereumProvider } from "../../ethereum/ethereum.types";
import { IAuctionContractClient } from "./auction-contract.client";

class AuctionContractTestClient implements IAuctionContractClient {
  // TODO
  cancelAuction(auctionId: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  createAuction(tokenId: BigNumberish, tokenContract: string, duration: BigNumberish, reservePrice: BigNumberish, curator: string, curatorFeePercentage: BigNumberish, auctionCurrency: string): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  createBid(auctionId: BigNumberish, amount: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  endAuction(auctionId: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  minBidIncrementPercentage(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  setAuctionApproval(auctionId: BigNumberish, approved: boolean): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  setAuctionReservePrice(auctionId: BigNumberish, reservePrice: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
}

export function AuctionContractCreator(_provider: EthereumProvider): IAuctionContractClient {
  return new AuctionContractTestClient();
}
