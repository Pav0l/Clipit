import { makeStyles, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { NftErrors } from "../../domains/nfts/nft.errors";
import { Metadata } from "../../domains/nfts/nft.model";
import { formatTimestampToCountdown } from "../../lib/time/time";
import ErrorWithRetry from "../error/Error";

interface Props {
  metadata: Metadata;
}

export const AuctionDetails = observer(function AuctionDetails({
  metadata
}: Props) {
  const [endOfAuction, setEnd] = useState<number>(0);

  const classes = useStyles();
  const auction = metadata.auction;

  useEffect(() => {
    const id = setInterval(() => {
      calcExpectedEndOfAuction(
        auction?.approvedTimestamp,
        auction?.duration,
        auction?.expectedEndTimestamp
      );
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  if (!auction) {
    return (
      <ErrorWithRetry text={NftErrors.SOMETHING_WENT_WRONG} withRetry={true} />
    );
  }

  // TODO test this
  function calcExpectedEndOfAuction(
    start?: string,
    duration?: string,
    expectedEnd?: string | null
  ) {
    const now = Math.floor(Date.now() / 1000);
    if (expectedEnd) {
      setEnd(Number(expectedEnd) - now);
    } else {
      const end = Number(start) + Number(duration);
      setEnd(end - now);
    }
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
        Auction ends in: {formatTimestampToCountdown(endOfAuction)}
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
