import { gql } from 'graphql-request';

const CLIP_PARTIALS = gql`
  fragment AskPartial on Ask {
    id
    currency {
      ...CurrencyPartial
    }
    amount
    createdAtTimestamp
  }

  fragment BidPartial on Bid {
    id
    clip {
      id
      contentURI
      metadataURI
    }
    amount
    currency {
      ...CurrencyPartial
    }
    bidder {
      id
    }
  }

  fragment ClipPartial on Clip {
    id
    metadataURI
    contentURI
    transactionHash
    currentAsk {
      ...AskPartial
    }
    currentBids {
      ...BidPartial
    }
    reserveAuctions {
      ...AuctionPartial
    }
    creatorBidShare
    ownerBidShare
    prevOwnerBidShare
    owner {
      id
    }
    creator {
      id
    }
    createdAtTimestamp
  }
`;

const AUCTION_PARTIALS = gql`
  fragment AuctionBidPartial on ReserveAuctionBid {
    id
    reserveAuction {
      id
    }
    amount
    bidder {
      id
    }
    bidType
    createdAtTimestamp
  }

  fragment AuctionPartial on ReserveAuction {
    id
    tokenId
    clip {
      id
    }
    approved
    duration
    expectedEndTimestamp
    firstBidTime
    approvedTimestamp
    reservePrice
    tokenOwner {
      id
    }
    auctionCurrency {
      ...CurrencyPartial
    }
    status
    currentBid {
      ...AuctionBidPartial
    }
  }

`;

const CURRENCY_PARTIAL = gql`
  fragment CurrencyPartial on Currency {
    id
    name
    symbol
    decimals
  }
`;

export const GET_USER_TOKENS_QUERY = gql`
  ${CURRENCY_PARTIAL}
  ${CLIP_PARTIALS}
  ${AUCTION_PARTIALS}

  query getUserData($ids: [ID!]) {
    users(
      where: { id_in: $ids }
    ) {
      id
      collection {
        ...ClipPartial
      }
      currentBids {
        ...BidPartial
      }
    }
  }
`;

export const GET_TOKENS_QUERY = gql`
  ${CURRENCY_PARTIAL}
  ${CLIP_PARTIALS}
  ${AUCTION_PARTIALS}

  query getClipData($ids: [ID!]) {
    clips(
      where: { id_in: $ids }
    ) {
      ...ClipPartial
    }
  }
`;

export const GET_TOKEN_BY_TX_HASH = gql`
  ${CURRENCY_PARTIAL}
  ${CLIP_PARTIALS}
  ${AUCTION_PARTIALS}

  query getTokenByTxHash($hashes: [String!]) {
    clips(
      where: { transactionHash_in: $hashes }
    ) {
      ...ClipPartial
    }
  }
`;

export const GET_CLIPS = gql`
  ${CURRENCY_PARTIAL}
  ${CLIP_PARTIALS}
  ${AUCTION_PARTIALS}

  query getClips($first: Int!, $skip: Int) {
    clips(first: $first, skip: $skip) {
      ...ClipPartial
    }
  }
`;

export const GET_AUCTION_QUERY = gql`
  ${CURRENCY_PARTIAL}
  ${CLIP_PARTIALS}
  ${AUCTION_PARTIALS}

  query getAuctionForToken($tokenIds: [BigInt!]) {
    reserveAuctions(
      where: { tokenId_in: $tokenIds }
    ) {
      ...AuctionPartial
    }
  }
`;
