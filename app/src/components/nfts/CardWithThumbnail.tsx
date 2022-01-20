import {
  makeStyles,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography
} from "@material-ui/core";
import { ActiveBid } from "../../domains/nfts/nft.model";
import { CurrencyPartialFragment } from "../../lib/graphql/types";
import { useExpectedEndOfAuction } from "../../lib/hooks/useExpectedEndOfAuction";

interface Props {
  title: string;
  description: string;
  thumbnailUrl: string;
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

export function CardWithThumbnail(props: Props) {
  const classes = useStyles();
  const [expectedEndCountdown] = useExpectedEndOfAuction(props.auction);

  // display auction bid OR basic bid OR nothing
  const bid = figureOutWhichBidToDisplay(props);

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Card with thumbnail"
          src={props.thumbnailUrl}
        />
        <CardContent className={classes.content}>
          <div>
            <Typography
              variant="subtitle1"
              component="h6"
              noWrap
              className={classes.title}
            >
              {props.title}
            </Typography>
            <Typography
              variant="subtitle2"
              component="p"
              color="textSecondary"
              noWrap
            >
              {props.description}
            </Typography>
          </div>
          {bid ? (
            <div>
              <Typography variant="subtitle2" component="p">
                Current Bid
              </Typography>
              <Typography
                variant="subtitle2"
                component="p"
                className={`${classes.title} ${classes.glow}`}
              >
                {`${bid.displayAmount} ${bid.symbol}`}
              </Typography>
            </div>
          ) : null}
        </CardContent>
        <div className={`${classes.content} ${classes.fixedHeight}`}>
          <div className={`${classes.auctionEnds}`}>
            {props.auction ? "Auction ends in:" : ""}
          </div>
          <div className={`${classes.auctionEnds} ${classes.glow}`}>
            {props.auction ? expectedEndCountdown : ""}
          </div>
        </div>
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    width: "25vw",
    maxWidth: "480px"
  },
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
  auctionEnds: {
    margin: "0 1rem 0.5rem",
    fontWeight: 600
  },
  fixedHeight: {
    minHeight: "24px"
  }
}));
