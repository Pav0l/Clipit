import { Button, makeStyles, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import { NftErrors } from "../../domains/nfts/nft.errors";
import { Auction, NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { useExpectedEndOfAuction } from "../../lib/hooks/useExpectedEndOfAuction";
import ErrorWithRetry from "../error/Error";
import FullPageLoader from "../loader/FullPageLoader";
import LinearLoader from "../loader/LinearLoader";

interface Props {
  userAddress: string;
  auction: Auction;
  tokenId: string;

  operations: {
    web3: Web3Controller;
    nft: NftController;
  };
  model: {
    web3: Web3Model;
    nft: NftModel;
  };
}

export const AuctionDetails = observer(function AuctionDetails({
  auction,
  tokenId,
  userAddress,
  operations,
  model
}: Props) {
  const [endOfAuction] = useExpectedEndOfAuction(auction);

  const classes = useStyles();

  if (!auction) {
    return (
      <ErrorWithRetry text={NftErrors.SOMETHING_WENT_WRONG} withRetry={true} />
    );
  }

  const handleCancelButton = async () => {
    // cancel auction
    await operations.web3.requestConnectAndCancelAuction(auction.id);
    await operations.nft.getAuctionForToken(tokenId);
  };

  const handleEndButton = async () => {
    // end auction
    await operations.web3.requestConnectAndEndAuction(auction.id);
    await operations.nft.getAuctionForToken(tokenId);
  };

  if (model.web3.auctionCancelLoadStatus) {
    return <LinearLoader text={model.web3.auctionCancelLoadStatus} />;
  }

  if (model.web3.auctionEndLoadStatus) {
    return <LinearLoader text={model.web3.auctionEndLoadStatus} />;
  }

  if (model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className={classes.container}>
      <Typography component="h5" variant="h5">
        {auction.highestBid?.displayAmount
          ? `Highest bid: ${auction.highestBid?.displayAmount} ${auction.auctionCurrency?.symbol}`
          : `Reserve price: ${auction.displayReservePrice} ${auction.auctionCurrency?.symbol}`}
      </Typography>
      <Typography>Owner: {auction.tokenOwnerId}</Typography>
      {auction.highestBid ? (
        <>
          <Typography>
            by:{" "}
            {auction.highestBid?.bidderAddress === userAddress
              ? "you"
              : auction.highestBid?.bidderAddress}
          </Typography>
          {endOfAuction === "ENDED" ? (
            <Button
              onClick={handleEndButton}
              size="medium"
              color="primary"
              variant="contained"
              className={classes.button}
            >
              End auction
            </Button>
          ) : (
            <Typography className={classes.timer}>
              Auction ends in: {endOfAuction}
            </Typography>
          )}
        </>
      ) : (
        <Button
          onClick={handleCancelButton}
          size="medium"
          color="primary"
          variant="contained"
          className={classes.button}
        >
          Cancel auction
        </Button>
      )}
    </div>
  );
});

const useStyles = makeStyles(() => ({
  container: {
    margin: "1rem",
    maxWidth: "50vw"
  },
  timer: {
    fontWeight: "bolder"
  },
  button: {
    width: "50%",
    margin: "0.5rem auto"
  }
}));
