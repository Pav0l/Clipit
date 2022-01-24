import { makeStyles, CardContent, Typography } from "@material-ui/core";
import { Auction } from "../../domains/nfts/nft.model";
import { useAuctionStatus } from "../../lib/hooks/useAuctionStatus";

interface Props {
  title: string;
  description: string;
  auction: Auction | null;
}

export function NftCardContent(props: Props) {
  const classes = useStyles();
  const auction = props.auction;
  // display auction bid OR basic bid OR nothing
  const bid = auction ? auction.displayBid : null;
  const hasBidInActiveAuction = bid && auction?.isActive;

  const [status] = useAuctionStatus(auction);

  return (
    <div>
      <CardContent>
        <div className={classes.content}>
          <Typography
            variant="subtitle1"
            component="h6"
            noWrap
            className={classes.title}
          >
            {props.title}
          </Typography>

          {hasBidInActiveAuction ? (
            <Typography
              variant="subtitle1"
              component="h6"
              className={`${classes.bidTitle} ${classes.alignRight}`}
            >
              {bid.onlyDisplayReservePrice ? "Reserve price:" : "Current Bid:"}
            </Typography>
          ) : null}
        </div>
        <div className={classes.content}>
          <Typography component="p" color="textSecondary" noWrap>
            {props.description}
          </Typography>
          {hasBidInActiveAuction ? (
            <Typography
              component="p"
              noWrap
              className={`${classes.title} ${classes.glow} ${classes.alignRight} ${classes.bidValue}`}
            >
              {`${bid.displayAmount} ${bid.symbol}`}
            </Typography>
          ) : null}
        </div>
      </CardContent>
      <div className={`${classes.content} ${classes.fixedHeight}`}>
        <div className={`${classes.auctionEnds} ${classes.noWrap}`}>
          {status.title}
        </div>
        <div
          className={`${classes.auctionEnds} ${classes.glow} ${classes.auctionCountdownValue} ${classes.alignRight}`}
        >
          {status.value}
        </div>
      </div>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 600,
    color: "#31393C",
    fontSize: "1rem"
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  glow: {
    color: "#2176FF"
  },
  alignRight: {
    textAlign: "right"
  },
  auctionEnds: {
    margin: "0 1rem 0.5rem",
    fontWeight: 600
  },
  noWrap: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
  },
  fixedHeight: {
    minHeight: "24px"
  },
  bidTitle: {
    minWidth: "106px"
  },
  bidValue: {
    minWidth: "80px"
  },
  auctionCountdownValue: {
    minWidth: "106px"
  }
}));
