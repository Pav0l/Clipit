import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import {
  DisplayAuctionStatusTitle,
  Metadata,
  NftModel
} from "../../domains/nfts/nft.model";
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
    // -> either running auction or active auction with no bids yet
    if (
      auction.displayAuctionStatus.title ===
        DisplayAuctionStatusTitle.ENDS_IN ||
      auction.firstBidTime === "0"
    ) {
      return (
        <BidForm
          metadata={metadata}
          operations={operations}
          model={{ web3: model.web3 }}
        />
      );
    }

    // -> expired (but not ended yet) -> end it
    // if (
    //   auction.displayAuctionStatus.title === DisplayAuctionStatusTitle.ENDED &&
    //   auction.firstBidTime !== "0"
    // ) {
    //   // consider if TODO, or we let ending auction only to owner
    //   return <div>Auction Details for bidder (end auction) </div>;
    // }
  }

  // finished -> null (details are on NftCard)
  // non-existent auction -> null
  // pending auction -> null
  // canceled auction -> null
  return null;
});
