import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import { Metadata, NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { BidForm } from "../bidForm/BidForm";
import { OwnerNftDetails } from "./OwnerNftDetails";

interface Props {
  tokenId: string;
  metadata: Metadata;

  operations: {
    nft: NftController;
    web3: Web3Controller;
  };
  model: {
    web3: Web3Model;
    nft: NftModel;
  };
}

export const NftDetails = observer(function NftDetails({
  tokenId,
  metadata,
  model,
  operations
}: Props) {
  const userAddress = model.web3.getAccount();

  let isUserOwner;
  if (!metadata.auction) {
    // token not in auction, just check owner
    isUserOwner = metadata.owner === userAddress;
  } else {
    // token is in auction
    isUserOwner = metadata.auction.tokenOwnerId === userAddress;
  }

  if (isUserOwner) {
    // handle token owner auction screens
    return (
      <OwnerNftDetails
        tokenId={tokenId}
        auction={metadata.auction}
        ownerAddress={metadata.owner}
        operations={operations}
        model={model}
      />
    );
  }

  // TODO consider what to display to "highest bidder"
  return (
    <BidForm
      metadata={metadata}
      operations={operations}
      model={{ web3: model.web3 }}
    />
  );
});
