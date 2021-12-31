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

    creatorBidShare
    ownerBidShare
    owner {
      id
    }
    creator {
      id
    }
    createdAtTimestamp
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

  query getTokenByTxHash($hashes: [String!]) {
    clips(
      where: { transactionHash_in: $hashes }
    ) {
      ...ClipPartial
    }
  }
`;
