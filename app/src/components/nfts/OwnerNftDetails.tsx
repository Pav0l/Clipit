import { utils } from "ethers";
import { observer } from "mobx-react-lite";
import { AuctionModel } from "../../domains/auction/auction.model";
import { Auction, NftModel } from "../../domains/nfts/nft.model";
import { AuctionCreateForm } from "../../domains/auction/components/auctions/AuctionCreateForm";
import { AuctionDetails } from "../../domains/auction/components/auctions/AuctionDetails";
import { UiController } from "../../app/ui.controller";

interface Props {
  tokenId: string;
  auction: Auction | null;
  ownerAddress: string;

  operations: {
    ui: UiController;
  };
  model: {
    nft: NftModel;
    auction: AuctionModel;
  };
}

export const OwnerNftDetails = observer(function OwnerNftDetails({
  tokenId,
  ownerAddress,
  auction,
  model,
  operations,
}: Props) {
  const handleCreateAuction = async (tokenId: string, duration: string, reservePrice: string) => {
    await operations.ui.createAuction(
      tokenId,
      Number(duration) * 86400, // 1 day in seconds
      utils.parseEther(reservePrice)
    );
  };

  const handleCancelAuction = async (tokenId: string, auctionId: string) => {
    await operations.ui.cancelAuction(auctionId, tokenId);
  };

  const handleEndAuction = async (tokenId: string, auctionId: string) => {
    await operations.ui.endAuction(auctionId, tokenId);
  };

  if (!auction || auction.isCanceled || auction.isFinished) {
    return <AuctionCreateForm tokenId={tokenId} model={model} handleCreateAuction={handleCreateAuction} />;
  }

  if (auction.isActive) {
    // owner sees auction details for active/finished auction
    return (
      <AuctionDetails
        auction={auction}
        userAddress={ownerAddress}
        tokenId={tokenId}
        model={model}
        handleCancelAuction={handleCancelAuction}
        handleEndAuction={handleEndAuction}
      />
    );
  }

  // not owner of token and also no auction active
  return null;
});
