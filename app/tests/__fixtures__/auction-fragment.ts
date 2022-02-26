import { ReserveAuctionStatus } from "../../src/lib/graphql/types";
import { clipPartialFragment } from "./clip-fragment";

export const auctionPartialFragment = {
  id: "0",
  tokenId: clipPartialFragment.id,
  clip: {
    id: clipPartialFragment.id,
  },
  approved: true,
  duration: "604800",
  expectedEndTimestamp: null,
  firstBidTime: "0",
  approvedTimestamp: "1642882668",
  reservePrice: "950000000000000000",
  tokenOwner: {
    id: clipPartialFragment.owner.id,
  },
  auctionCurrency: {
    id: "0x0000000000000000000000000000000000000000",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  status: ReserveAuctionStatus.Canceled,
  currentBid: null,
  previousBids: [],
  transactionHash: "0x0b92d30025e0b09ad3421fef4ef6ba193c7a089ac970cee528239740bbd54439",
};
