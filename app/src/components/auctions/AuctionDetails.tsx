import { makeStyles, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { NftErrors } from "../../domains/nfts/nft.errors";
import { Metadata } from "../../domains/nfts/nft.model";
import { useExpectedEndOfAuction } from "../../lib/hooks/useExpectedEndOfAuction";
import ErrorWithRetry from "../error/Error";

interface Props {
  metadata: Metadata;
}

export const AuctionDetails = observer(function AuctionDetails({
  metadata
}: Props) {
  const auction = metadata.auction;
  const [endOfAuction] = useExpectedEndOfAuction(auction);

  const classes = useStyles();

  if (!auction) {
    return (
      <ErrorWithRetry text={NftErrors.SOMETHING_WENT_WRONG} withRetry={true} />
    );
  }

  return (
    <div className={classes.container}>
      <Typography component="h5" variant="h5">
        Highest bid:{" "}
        {auction.highestBid?.displayAmount ?? auction.displayReservePrice}{" "}
        {auction.auctionCurrency?.symbol}
      </Typography>
      {auction.highestBid ? (
        <Typography>by: {auction.highestBid?.bidderAddress}</Typography>
      ) : (
        <></>
      )}
      <Typography className={classes.timer}>
        Auction ends in: {endOfAuction}
      </Typography>
      <Typography>Owner: {auction.tokenOwnerId}</Typography>
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
  }
}));
