import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import {
  Metadata,
  NftModel,
  CustomAuctionStatus
} from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { AuctionCreateForm } from "../auctions/AuctionCreateForm";
import { AuctionDetails } from "../auctions/AuctionDetails";
import { BidForm } from "../bidForm/BidForm";

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

  // TODO how does this work on cancelled/finished auctions? it seems the auction.tokenOwnerId does not change
  let isUserOwner;
  if (!metadata.auction) {
    // token not in auction, just check owner
    isUserOwner = metadata.owner === userAddress;
  } else {
    // token is in auction
    isUserOwner = metadata.auction.tokenOwnerId === userAddress;
  }

  const isHighestBidder =
    userAddress === metadata.auction?.highestBid?.bidderAddress;
  const hasActiveAuction = metadata.auction?.isActive;

  if (hasActiveAuction && (isUserOwner || isHighestBidder)) {
    // tokenOwner OR highest bidder and active auction - SEE DETAILS!
    return (
      <AuctionDetails metadata={metadata} userAddress={userAddress ?? ""} />
    );
  }

  if (isUserOwner && metadata.auction?.status === CustomAuctionStatus.Timeout) {
    // TODO owner with expired auction -> cancel / prolong duration
    return (
      <div>
        <div>{metadata.clipTitle}</div>
        <div>Auction expired. Cancel or increase duration of the auction</div>
      </div>
    );
  }

  if (!isUserOwner && hasActiveAuction) {
    // not owner and running active auction - BID!
    return (
      <BidForm
        metadata={metadata}
        operations={operations}
        model={{ web3: model.web3 }}
      />
    );
  }

  if (isUserOwner && !hasActiveAuction) {
    // owner without auction - CREATE AUCTION
    return (
      <AuctionCreateForm
        tokenId={tokenId}
        operations={operations}
        model={model}
      />
    );
  }

  // not owner of token and also no auction active
  return null;
});
