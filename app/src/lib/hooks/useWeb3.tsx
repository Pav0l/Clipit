import { useState } from "react";
import { BigNumberish } from "@ethersproject/bignumber";
import detectEthereumProvider from "@metamask/detect-provider";

import { NftModel } from "../../domains/nfts/nft.model";
import EthereumClient from "../ethereum/ethereum.client";
import ContractClient from "../contract/contract.client";
import { EthereumProvider } from "../ethereum/ethereum.types";
import { NftErrors } from "../../domains/nfts/nft.errors";

export function useWeb3(nftModel: NftModel) {
  const [{ ethereum, contract }, setWeb3] = useState<{
    contract: ContractClient | null;
    ethereum: EthereumClient | null;
  }>({
    contract: null,
    ethereum: null
  });

  async function initializeWeb3() {
    nftModel.meta.setLoading(true);

    const metamaskProvider =
      (await detectEthereumProvider()) as EthereumProvider | null;

    if (metamaskProvider === null) {
      nftModel.meta.setError(NftErrors.INSTALL_METAMASK);
      return;
    }
    // TODO remove log
    console.log("creating new ethereum & contract client");
    const ethereum = new EthereumClient(metamaskProvider, {
      handleAccountsChange: nftModel.setAccounts,
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
          `[APPROVAL](useWeb3) from ${owner} to ${approved} for ${tokenId}`
        );
      },
      handleApprovalAll: (
        owner?: string | null,
        operator?: string | null,
        approved?: any
      ) => {
        console.log(
          `[APPROVAL_ALL](useWeb3) from ${owner} to ${operator} approval status: ${approved}`
        );
      },
      handleTransfer: (
        from?: string | null,
        to?: string | null,
        tokenId?: BigNumberish | null
      ) => {
        console.log(`[TRANSFER](useWeb3) from ${from} to ${to} for ${tokenId}`);
        if (tokenId) {
          nftModel.setTokenId(tokenId.toString());
        }
      }
    });

    setWeb3({ ethereum, contract });
    nftModel.meta.setLoading(false);
  }

  return { ethereum, contract, initializeWeb3 };
}
