import { observer } from "mobx-react-lite";
import { AuctionModel } from "../../domains/auction/auction.model";
import { DisplayAuctionStatusTitle, Metadata, NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { BidForm } from "../../domains/auction/components/bid/BidForm";
import { OwnerNftDetails } from "./OwnerNftDetails";
import { UiController } from "../../app/ui.controller";

interface Props {
  tokenId: string;
  metadata: Metadata;

  operations: {
    ui: UiController;
    web3: Web3Controller;
  };
  model: {
    web3: Web3Model;
    nft: NftModel;
    auction: AuctionModel;
  };
}

export const NftDetails = observer(function NftDetails({ tokenId, metadata, model, operations }: Props) {
  const userAddress = model.web3.getAccount();
  const auction = metadata.auction;

  let isUserOwner;
  if (!auction) {
    // token not in auction, just check owner
    isUserOwner = metadata.owner === userAddress;
  } else {
    // token is in auction
    isUserOwner = auction.tokenOwnerId === userAddress;
  }

  if (isUserOwner) {
    // handle token owner auction screens
    return (
      <OwnerNftDetails
        tokenId={tokenId}
        auction={auction}
        ownerAddress={metadata.owner}
        operations={operations}
        model={model}
      />
    );
  }

  // user is not owner of NFT

  // auction status:
  // active:
  if (auction && auction.isActive) {
    // FYI: if user is highest bidder, we show BidForm again

    // -> either running auction or active auction with no bids yet
    if (auction.displayAuctionStatus.title === DisplayAuctionStatusTitle.ENDS_IN || auction.firstBidTime === "0") {
      return (
        <BidForm metadata={metadata} operations={operations} model={{ web3: model.web3, auction: model.auction }} />
      );
    }
  }

  // finished -> null (details are on NftCard)
  // non-existent auction -> null
  // pending auction -> null
  // canceled auction -> null
  return null;
});
