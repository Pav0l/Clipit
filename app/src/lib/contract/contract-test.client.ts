import { metadataCid } from "../../../tests/__fixtures__/metadata";
import { chainId, signerAddress } from "../../../tests/__fixtures__/ethereum";

import { EthereumProvider } from "../ethereum/ethereum.types";
import { BidShares, IContractClient, MediaData, Signature } from "./contract.client";
import { BigNumber, ContractReceipt, ethers } from "ethers";
import { contractAddress } from "../constants";



class ContractTestClient implements IContractClient {
  async mint(_data: MediaData, _bidShares: BidShares, _signature: Signature): Promise<ethers.ContractTransaction> {
    return {
      chainId: BigNumber.from(chainId).toNumber(),
      confirmations: 1,
      from: contractAddress,
      data: '',
      gasLimit: BigNumber.from('100000'),
      hash: 'hash',
      nonce: 1,
      value: BigNumber.from(0),
      wait: (confirmations?: number): Promise<ContractReceipt> => {
        return new Promise(res => res({
          to: signerAddress,
          from: contractAddress,
          contractAddress: contractAddress,
          transactionIndex: 1,
          gasUsed: BigNumber.from('500'),
          logsBloom: 'logsBloom',
          blockHash: 'blockHash',
          transactionHash: 'transactionHash',
          logs: [{
            blockNumber: 1,
            transactionIndex: 1,
            logIndex: 1,
            removed: false,
            blockHash: 'blockHash',
            address: 'address',
            data: 'data',
            transactionHash: 'transactionHash',
            topics: ['topics'],
          }],
          blockNumber: 1,
          confirmations: 1,
          cumulativeGasUsed: BigNumber.from('100000'),
          effectiveGasPrice: BigNumber.from('100'),
          byzantium: true,
          type: 1
        }));
      }
    };
  }

  async getTokenMetadataURI(_tokenId: string): Promise<string> {
    return `ipfs://${metadataCid}`;
  }

  async getTokenOwner(_tokenId: string): Promise<string> {
    return signerAddress;
  }
}

export function ClipItTestContractCreator(_provider: EthereumProvider): IContractClient {
  return new ContractTestClient();
}
