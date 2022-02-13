import { BigNumber, BigNumberish, ContractTransaction, ethers } from "ethers";

import AuctionHouseAbi from "./AuctionHouse.json";
import { AuctionHouse } from "./AuctionHouse";
import { EthereumProvider } from "../../ethereum/ethereum.types";

export interface IAuctionContractClient {
  cancelAuction(auctionId: BigNumberish): Promise<ContractTransaction>;
  createAuction(
    tokenId: BigNumberish,
    tokenContract: string,
    duration: BigNumberish,
    reservePrice: BigNumberish,
    curator: string,
    curatorFeePercentage: BigNumberish,
    auctionCurrency: string
  ): Promise<ContractTransaction>;
  createBid(auctionId: BigNumberish, amount: BigNumber): Promise<ContractTransaction>;
  endAuction(auctionId: BigNumberish): Promise<ContractTransaction>;
  minBidIncrementPercentage(): Promise<number>;
  setAuctionApproval(auctionId: BigNumberish, approved: boolean): Promise<ContractTransaction>;
  setAuctionReservePrice(auctionId: BigNumberish, reservePrice: BigNumberish): Promise<ContractTransaction>;
}

class AuctionContractClient implements IAuctionContractClient {
  private contract: AuctionHouse;

  constructor(provider: EthereumProvider, address: string) {
    // this can throw
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const jsonRpcSigner = ethersProvider.getSigner();
    this.contract = new ethers.Contract(address, AuctionHouseAbi.abi, jsonRpcSigner) as AuctionHouse;
  }

  cancelAuction = async (auctionId: BigNumberish): Promise<ContractTransaction> => {
    return this.contract.cancelAuction(auctionId);
  };

  endAuction = async (auctionId: BigNumberish): Promise<ContractTransaction> => {
    return this.contract.endAuction(auctionId);
  };

  minBidIncrementPercentage = async (): Promise<number> => {
    return this.contract.minBidIncrementPercentage();
  };

  setAuctionApproval = async (auctionId: BigNumberish, approved: boolean): Promise<ContractTransaction> => {
    return this.contract.setAuctionApproval(auctionId, approved);
  };

  setAuctionReservePrice = async (
    auctionId: BigNumberish,
    reservePrice: BigNumberish
  ): Promise<ContractTransaction> => {
    return this.contract.setAuctionReservePrice(auctionId, reservePrice);
  };

  createAuction = async (
    tokenId: BigNumberish,
    tokenContract: string,
    duration: BigNumberish,
    reservePrice: BigNumberish,
    curator: string,
    curatorFeePercentage: BigNumberish,
    auctionCurrency: string
  ): Promise<ContractTransaction> => {
    return this.contract.createAuction(
      tokenId,
      tokenContract,
      duration,
      reservePrice,
      curator,
      curatorFeePercentage,
      auctionCurrency
    );
  };

  createBid = async (auctionId: BigNumberish, amount: BigNumber): Promise<ContractTransaction> => {
    return this.contract.createBid(auctionId, amount, { value: amount });
  };
}

export function AuctionContractCreator(provider: EthereumProvider, address: string): IAuctionContractClient {
  return new AuctionContractClient(provider, address);
}
