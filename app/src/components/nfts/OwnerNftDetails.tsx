import { utils } from "ethers";
import { observer } from "mobx-react-lite";
import { AuctionModel } from "../../domains/auction/auction.model";
import { NftController } from "../../domains/nfts/nft.controller";
import { Auction, NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { AuctionCreateForm } from "../../domains/auction/components/auctions/AuctionCreateForm";
import { AuctionDetails } from "../../domains/auction/components/auctions/AuctionDetails";

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
    await operations.web3.requestConnectAndCreateAuction(
      tokenId,
      Number(duration) * 86400, // 1 day in seconds
      utils.parseEther(reservePrice)
    );

    await operations.nft.getAuctionForToken(tokenId, { clearCache: true });
  };

  const handleCancelAuction = async (tokenId: string, auctionId: string) => {
    await operations.web3.requestConnectAndCancelAuction(auctionId);
    await operations.nft.getAuctionForToken(tokenId, { clearCache: true });
  };

  const handleEndAuction = async (tokenId: string, auctionId: string) => {
    await operations.web3.requestConnectAndEndAuction(auctionId);
    await operations.nft.getAuctionForToken(tokenId, { clearCache: true });
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
