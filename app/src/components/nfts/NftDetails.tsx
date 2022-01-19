import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import { Metadata, NftModel } from "../../domains/nfts/nft.model";
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
  const isNftOwn = metadata.owner === userAddress;
  const isNftOwnerWithAuction = metadata.auction?.tokenOwnerId === userAddress;

  const nftNotOwn = !isNftOwn && !isNftOwnerWithAuction;

  const minBid =
    metadata.currentBids.length > 0
      ? Number(metadata.currentBids[0].displayAmount) * 1.05
      : "0";

  return (
    <>
      {nftNotOwn ? (
        <BidForm
          minimalBid={minBid.toString()}
          operations={{ web3: operations.web3 }}
          model={{ web3: model.web3 }}
        />
      ) : isNftOwnerWithAuction ? (
        <AuctionDetails metadata={metadata} />
      ) : (
        <AuctionCreateForm
          tokenId={tokenId}
          operations={operations}
          model={model}
        />
      )}
    </>
  );
});
