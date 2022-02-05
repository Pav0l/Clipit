import { Button, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { NftController } from "../../domains/nfts/nft.controller";
import { NftErrors } from "../../domains/nfts/nft.errors";
import { Auction, DisplayAuctionStatusTitle, NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { useAuctionStatus } from "../../lib/hooks/useAuctionStatus";
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
  model,
}: Props) {
  const [status] = useAuctionStatus(auction);
  const classes = useStyles();
  const bid = auction.displayBid;

  if (!auction) {
    return <ErrorWithRetry text={NftErrors.SOMETHING_WENT_WRONG} withRetry={true} />;
  }

  const handleCancelButton = async () => {
    await operations.web3.requestConnectAndCancelAuction(auction.id);
    await operations.nft.getAuctionForToken(tokenId, { clearCache: true });
  };

  const handleEndButton = async () => {
    await operations.web3.requestConnectAndEndAuction(auction.id);
    await operations.nft.getAuctionForToken(tokenId, { clearCache: true });
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
        {bid.onlyDisplayReservePrice ? "Reserve price:" : "Highest bid:"} {`${bid.displayAmount} ${bid.symbol}`}
      </Typography>
      <Typography>Owner: {auction.tokenOwnerId}</Typography>
      {auction.highestBid ? (
        <>
          <Typography>
            by: {auction.highestBid?.bidderAddress === userAddress ? "you" : auction.highestBid?.bidderAddress}
          </Typography>
          {status.title === DisplayAuctionStatusTitle.ENDED ? (
            <>
              <Typography className={classes.topSpacer}>
                Auction has ended. Click the button to receive the highest bid
              </Typography>

              <Button
                onClick={handleEndButton}
                size="medium"
                color="primary"
                variant="contained"
                className={classes.button}
              >
                End auction
              </Button>
            </>
          ) : (
            <Typography className={classes.timer}>{`${status.title} ${status.value}`}</Typography>
          )}
        </>
      ) : (
        <>
          <Typography className={classes.topSpacer}>Auction does not have any bids yet.</Typography>

          <Tooltip title="Cancel auction to retrieve the NFT back to your wallet" arrow>
            <Button
              onClick={handleCancelButton}
              size="medium"
              color="primary"
              variant="contained"
              className={classes.button}
            >
              Cancel auction
            </Button>
          </Tooltip>
        </>
      )}
    </div>
  );
});

const useStyles = makeStyles(() => ({
  container: {
    margin: "1rem",
    maxWidth: "50vw",
  },
  timer: {
    fontWeight: "bolder",
  },
  button: {
    width: "50%",
    margin: "0.5rem auto",
  },
  topSpacer: {
    marginTop: "1rem",
  },
}));
