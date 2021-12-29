import { gql } from 'graphql-request';

export const GET_TOKEN_QUERY = gql`{
  clips(first: 25) {
    id
    contentURI
    metadataURI
    owner {
      id
    }
    creator {
      id
    }
  }
}`;
