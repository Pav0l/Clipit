import { makeStyles, CardContent, Typography } from "@material-ui/core";
import { ActiveBid } from "../../domains/nfts/nft.model";
import { CurrencyPartialFragment } from "../../lib/graphql/types";
import { useExpectedEndOfAuction } from "../../lib/hooks/useExpectedEndOfAuction";

interface Props {
  title: string;
  description: string;
  // TODO this needs to change so it doesnt show DONE auction or 0.0 ETH bid
  bid?: {
    symbol: string;
    displayAmount: string;
  };
  auction: {
    approvedTimestamp?: string;
    duration?: string;
    expectedEndTimestamp?: string | null;
    highestBid: ActiveBid | null;
    displayReservePrice?: string;
    auctionCurrency?: CurrencyPartialFragment;
  } | null;
}

function figureOutWhichBidToDisplay({ bid, auction }: Props): {
  symbol: string;
  displayAmount: string;
} | null {
  // Bid display priority: active auction bid > active auction reserve price > basic bid > nothing
  if (auction) {
    if (auction.highestBid) {
      return auction.highestBid;
    } else if (auction.displayReservePrice) {
      return {
        symbol: auction.auctionCurrency?.symbol ?? "",
        displayAmount: auction.displayReservePrice
      };
    }
  }

  if (bid) {
    return bid;
  }

  return null;
}

export function NftCardContent(props: Props) {
  const classes = useStyles();
  const [expectedEndCountdown] = useExpectedEndOfAuction(props.auction);

  // display auction bid OR basic bid OR nothing
  const bid = figureOutWhichBidToDisplay(props);

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

          {bid ? (
            <Typography
              variant="subtitle1"
              component="h6"
              className={classes.bidTitle}
            >
              Current Bid
            </Typography>
          ) : null}
        </div>
        <div className={classes.content}>
          <Typography component="p" color="textSecondary" noWrap>
            {props.description}
          </Typography>
          {bid ? (
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
          {props.auction ? "Auction ends in:" : ""}
        </div>
        <div
          className={`${classes.auctionEnds} ${classes.glow} ${classes.auctionCountdownValue} ${classes.alignRight}`}
        >
          {props.auction ? expectedEndCountdown : ""}
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
    minWidth: "83px"
  },
  bidValue: {
    minWidth: "80px"
  },
  auctionCountdownValue: {
    minWidth: "106px"
  }
}));
