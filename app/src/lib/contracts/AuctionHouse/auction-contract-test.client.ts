import { metadataCid } from "../../../../tests/__fixtures__/metadata";
import { chainId, signerAddress, txHash } from "../../../../tests/__fixtures__/ethereum";
import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";

import { BigNumber, BigNumberish, ContractReceipt, ContractTransaction } from "ethers";
import { EthereumProvider } from "../../ethereum/ethereum.types";
import { IAuctionContractClient } from "./auction-contract.client";

class AuctionContractTestClient implements IAuctionContractClient {
  private get contractTx() {
    return {
      chainId: BigNumber.from(chainId).toNumber(),
      confirmations: 1,
      from: CONFIG.auctionAddress,
      data: "",
      gasLimit: BigNumber.from("100000"),
      hash: txHash,
      nonce: 1,
      value: BigNumber.from(0),
      wait: (confirmations?: number): Promise<ContractReceipt> => {
        return new Promise((res) =>
          res({
            to: signerAddress,
            from: CONFIG.auctionAddress,
            contractAddress: CONFIG.auctionAddress,
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

  async createAuction(
    _tokenId: BigNumberish,
    _tokenContract: string,
    _duration: BigNumberish,
    _reservePrice: BigNumberish,
    _curator: string,
    _curatorFeePercentage: BigNumberish,
    _auctionCurrency: string
  ): Promise<ContractTransaction> {
    return this.contractTx;
  }

  async cancelAuction(_auctionId: BigNumberish): Promise<ContractTransaction> {
    return this.contractTx;
  }
  async createBid(_auctionId: BigNumberish, _amount: BigNumberish): Promise<ContractTransaction> {
    return this.contractTx;
  }
  async endAuction(_auctionId: BigNumberish): Promise<ContractTransaction> {
    return this.contractTx;
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
