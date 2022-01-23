import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import { Auction, NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { AuctionCreateForm } from "../auctions/AuctionCreateForm";
import { AuctionDetails } from "../auctions/AuctionDetails";

interface Props {
  tokenId: string;
  auction: Auction | null;
  ownerAddress: string;

  operations: {
    nft: NftController;
    web3: Web3Controller;
  };
  model: {
    web3: Web3Model;
    nft: NftModel;
  };
}

export const OwnerNftDetails = observer(function OwnerNftDetails({
  tokenId,
  ownerAddress,
  auction,
  model,
  operations
}: Props) {
  /**
   * Owner details auction states
   *  - [x] not existing auction => create auction
   *  - [ ] auction pending => approve (check if user is curator)
   *  - [x] auction active =>
   *      [x] show details
   *      [x] end auction (if no bids)
   *  - [x] auction canceled => create auction
   *  - [x] auction finished => create auction (as new owner)
   *  - [x] auction active & no bids => cancel auction
   */

  if (!auction || auction.isCanceled || auction.isFinished) {
    return (
      <AuctionCreateForm
        tokenId={tokenId}
        operations={operations}
        model={model}
      />
    );
  }

  // if (auction.isPending && !auction.approved) {
  //   // TODO check if currator
  //   // pending auction
  //   return <div>TODO Approve auction</div>;
  // }

  if (auction.isActive) {
    // owner sees auction details for active/finished auction
    return (
      <AuctionDetails
        auction={auction}
        userAddress={ownerAddress}
        tokenId={tokenId}
        operations={operations}
        model={model}
      />
    );
  }

  // not owner of token and also no auction active
  return null;
});
