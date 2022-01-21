
export enum AuctionContractErrors {
  INVALID_CURATOR_FEE_USER_ERR = "Curator fee must be less than 100%",
  AUCTION_NOT_STARTED = "Auction has not started yet",
  BID_NOT_HIGH_ENOUGH = "Bid is not high enough",

  // revert messages from contracts
  INVALID_CURATOR_FEE = "curatorFeePercentage must be less than 100",
  AUCTION_DOES_NOT_EXIST = "Auction doesn't exist",

  // create bid errors
  AUCTION_NOT_APPROVED = "Auction must be approved by curator",
  AUCTION_EXPIRED = "Auction expired",
  AUCTION_BID_LOWER_THAN_RESERVE_PRICE = "Must send at least reservePrice",
  AUCTION_BID_LOWER_THAN_PREVIOUS_BID = "Must send more than last bid by minBidIncrementPercentage amount",
  AUCTION_BID_INVALID_FOR_SHARE_SPLITTING = "Bid invalid for share splitting"
}
