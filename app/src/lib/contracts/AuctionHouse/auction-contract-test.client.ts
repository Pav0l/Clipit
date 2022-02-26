import { metadataCid } from "../../../../tests/__fixtures__/metadata";
import { chainId, signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";

import { BigNumber, BigNumberish, ContractReceipt, ContractTransaction } from "ethers";
import { EthereumProvider } from "../../ethereum/ethereum.types";
import { IAuctionContractClient } from "./auction-contract.client";

class AuctionContractTestClient implements IAuctionContractClient {
  // TODO
  async cancelAuction(auctionId: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  async createAuction(
    _tokenId: BigNumberish,
    _tokenContract: string,
    _duration: BigNumberish,
    _reservePrice: BigNumberish,
    _curator: string,
    _curatorFeePercentage: BigNumberish,
    _auctionCurrency: string
  ): Promise<ContractTransaction> {
    return {
      // copied from `mint` test client method - some data are invalid for this method
      chainId: BigNumber.from(chainId).toNumber(),
      confirmations: 1,
      from: CONFIG.tokenAddress,
      data: "",
      gasLimit: BigNumber.from("100000"),
      hash: "hash",
      nonce: 1,
      value: BigNumber.from(0),
      wait: (confirmations?: number): Promise<ContractReceipt> => {
        return new Promise((res) =>
          res({
            to: signerAddress,
            from: CONFIG.tokenAddress,
            contractAddress: CONFIG.tokenAddress,
            transactionIndex: 1,
            gasUsed: BigNumber.from("500"),
            logsBloom: "logsBloom",
            blockHash: "blockHash",
            transactionHash: "transactionHash",
            logs: [
              {
                blockNumber: 1,
                transactionIndex: 1,
                logIndex: 1,
                removed: false,
                blockHash: "blockHash",
                address: "address",
                data: "data",
                transactionHash: "transactionHash",
                topics: ["topics"],
              },
            ],
            blockNumber: 1,
            confirmations: 1,
            cumulativeGasUsed: BigNumber.from("100000"),
            effectiveGasPrice: BigNumber.from("100"),
            byzantium: true,
            type: 1,
          })
        );
      },
    };
  }
  async createBid(auctionId: BigNumberish, amount: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  async endAuction(auctionId: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  async minBidIncrementPercentage(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  async setAuctionApproval(auctionId: BigNumberish, approved: boolean): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
  async setAuctionReservePrice(auctionId: BigNumberish, reservePrice: BigNumberish): Promise<ContractTransaction> {
    throw new Error("Method not implemented.");
  }
}

export function AuctionTestContractCreator(_provider: EthereumProvider): IAuctionContractClient {
  return new AuctionContractTestClient();
}
