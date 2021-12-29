export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Ask = {
  __typename?: 'Ask';
  /** The amount of Currency of the Ask */
  amount: Scalars['BigInt'];
  /** The Clip associated with the Ask */
  clip: Clip;
  /** The number of the block the Ask created in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the Ask was created in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The Currency of the Ask */
  currency: Currency;
  /** <tokenId>-<ownerAddress> */
  id: Scalars['ID'];
  /** The owner of the Ask */
  owner: User;
  /** Transaction hash the ask was created at */
  transactionHash: Scalars['String'];
};

export type Ask_Filter = {
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  clip?: InputMaybe<Scalars['String']>;
  clip_contains?: InputMaybe<Scalars['String']>;
  clip_ends_with?: InputMaybe<Scalars['String']>;
  clip_gt?: InputMaybe<Scalars['String']>;
  clip_gte?: InputMaybe<Scalars['String']>;
  clip_in?: InputMaybe<Array<Scalars['String']>>;
  clip_lt?: InputMaybe<Scalars['String']>;
  clip_lte?: InputMaybe<Scalars['String']>;
  clip_not?: InputMaybe<Scalars['String']>;
  clip_not_contains?: InputMaybe<Scalars['String']>;
  clip_not_ends_with?: InputMaybe<Scalars['String']>;
  clip_not_in?: InputMaybe<Array<Scalars['String']>>;
  clip_not_starts_with?: InputMaybe<Scalars['String']>;
  clip_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  owner?: InputMaybe<Scalars['String']>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
};

export enum Ask_OrderBy {
  Amount = 'amount',
  Clip = 'clip',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Currency = 'currency',
  Id = 'id',
  Owner = 'owner',
  TransactionHash = 'transactionHash'
}

export type Bid = {
  __typename?: 'Bid';
  /** The amount of Currency of the Bid */
  amount: Scalars['BigInt'];
  /** The bidder of the Bid */
  bidder: User;
  /** The Clip associated with the Bid */
  clip: Clip;
  /** The number of the block the Bid was created in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the Bid was created in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The Currency of the Bid */
  currency: Currency;
  /** <token-id>-<bidderAddress> */
  id: Scalars['ID'];
  /** The recipient of Clip if the Bid is accepted */
  recipient: User;
  /** The sellOnShare of the Bid */
  sellOnShare: Scalars['BigInt'];
  /** Transaction hash the bid was created at */
  transactionHash: Scalars['String'];
};

export type Bid_Filter = {
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bidder?: InputMaybe<Scalars['String']>;
  bidder_contains?: InputMaybe<Scalars['String']>;
  bidder_ends_with?: InputMaybe<Scalars['String']>;
  bidder_gt?: InputMaybe<Scalars['String']>;
  bidder_gte?: InputMaybe<Scalars['String']>;
  bidder_in?: InputMaybe<Array<Scalars['String']>>;
  bidder_lt?: InputMaybe<Scalars['String']>;
  bidder_lte?: InputMaybe<Scalars['String']>;
  bidder_not?: InputMaybe<Scalars['String']>;
  bidder_not_contains?: InputMaybe<Scalars['String']>;
  bidder_not_ends_with?: InputMaybe<Scalars['String']>;
  bidder_not_in?: InputMaybe<Array<Scalars['String']>>;
  bidder_not_starts_with?: InputMaybe<Scalars['String']>;
  bidder_starts_with?: InputMaybe<Scalars['String']>;
  clip?: InputMaybe<Scalars['String']>;
  clip_contains?: InputMaybe<Scalars['String']>;
  clip_ends_with?: InputMaybe<Scalars['String']>;
  clip_gt?: InputMaybe<Scalars['String']>;
  clip_gte?: InputMaybe<Scalars['String']>;
  clip_in?: InputMaybe<Array<Scalars['String']>>;
  clip_lt?: InputMaybe<Scalars['String']>;
  clip_lte?: InputMaybe<Scalars['String']>;
  clip_not?: InputMaybe<Scalars['String']>;
  clip_not_contains?: InputMaybe<Scalars['String']>;
  clip_not_ends_with?: InputMaybe<Scalars['String']>;
  clip_not_in?: InputMaybe<Array<Scalars['String']>>;
  clip_not_starts_with?: InputMaybe<Scalars['String']>;
  clip_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  recipient?: InputMaybe<Scalars['String']>;
  recipient_contains?: InputMaybe<Scalars['String']>;
  recipient_ends_with?: InputMaybe<Scalars['String']>;
  recipient_gt?: InputMaybe<Scalars['String']>;
  recipient_gte?: InputMaybe<Scalars['String']>;
  recipient_in?: InputMaybe<Array<Scalars['String']>>;
  recipient_lt?: InputMaybe<Scalars['String']>;
  recipient_lte?: InputMaybe<Scalars['String']>;
  recipient_not?: InputMaybe<Scalars['String']>;
  recipient_not_contains?: InputMaybe<Scalars['String']>;
  recipient_not_ends_with?: InputMaybe<Scalars['String']>;
  recipient_not_in?: InputMaybe<Array<Scalars['String']>>;
  recipient_not_starts_with?: InputMaybe<Scalars['String']>;
  recipient_starts_with?: InputMaybe<Scalars['String']>;
  sellOnShare?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_gt?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_gte?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sellOnShare_lt?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_lte?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_not?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
};

export enum Bid_OrderBy {
  Amount = 'amount',
  Bidder = 'bidder',
  Clip = 'clip',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Currency = 'currency',
  Id = 'id',
  Recipient = 'recipient',
  SellOnShare = 'sellOnShare',
  TransactionHash = 'transactionHash'
}

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Clip = {
  __typename?: 'Clip';
  /** The approved user of the Clip */
  approved?: Maybe<User>;
  /** The number of the block the Clip was burned in */
  burnedAtBlockNumber?: Maybe<Scalars['BigInt']>;
  /** The timestamp of the block the Clip was burned in */
  burnedAtTimeStamp?: Maybe<Scalars['BigInt']>;
  /** The sha256 hash of the clip's content */
  contentHash: Scalars['Bytes'];
  /** The uri of the content */
  contentURI: Scalars['String'];
  /** The number of the block the Clip was minted in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the Clip was minted in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The creator of the Clip */
  creator: User;
  /** The bid share for the creator of the Clip */
  creatorBidShare: Scalars['BigInt'];
  /** The current Ask of the Clip */
  currentAsk?: Maybe<Ask>;
  /** The current Bids on the Clip */
  currentBids?: Maybe<Array<Bid>>;
  /** The tokenId on the ClipIt Contract */
  id: Scalars['ID'];
  /** The InactiveAsks of the Clip */
  inactiveAsks?: Maybe<Array<InactiveAsk>>;
  /** The InactiveBids of the Clip */
  inactiveBids?: Maybe<Array<InactiveBid>>;
  /** The sha256 hash of the clip's metadata */
  metadataHash: Scalars['Bytes'];
  /** The uri of the metadata */
  metadataURI: Scalars['String'];
  /** The current owner of the Clip */
  owner: User;
  /** The bid share for the current owner of the Clip */
  ownerBidShare: Scalars['BigInt'];
  /** The previous owner of the ClipIt's Market */
  prevOwner: User;
  /** The bid share for the previous owner of the Clip's market */
  prevOwnerBidShare: Scalars['BigInt'];
  /** The transaction hash the clip was created at */
  transactionHash: Scalars['String'];
  /** The transfers of the Clip */
  transfers?: Maybe<Array<Transfer>>;
};


export type ClipCurrentBidsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Bid_Filter>;
};


export type ClipInactiveAsksArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveAsk_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InactiveAsk_Filter>;
};


export type ClipInactiveBidsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveBid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InactiveBid_Filter>;
};


export type ClipTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};

export type Clip_Filter = {
  approved?: InputMaybe<Scalars['String']>;
  approved_contains?: InputMaybe<Scalars['String']>;
  approved_ends_with?: InputMaybe<Scalars['String']>;
  approved_gt?: InputMaybe<Scalars['String']>;
  approved_gte?: InputMaybe<Scalars['String']>;
  approved_in?: InputMaybe<Array<Scalars['String']>>;
  approved_lt?: InputMaybe<Scalars['String']>;
  approved_lte?: InputMaybe<Scalars['String']>;
  approved_not?: InputMaybe<Scalars['String']>;
  approved_not_contains?: InputMaybe<Scalars['String']>;
  approved_not_ends_with?: InputMaybe<Scalars['String']>;
  approved_not_in?: InputMaybe<Array<Scalars['String']>>;
  approved_not_starts_with?: InputMaybe<Scalars['String']>;
  approved_starts_with?: InputMaybe<Scalars['String']>;
  burnedAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  burnedAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  burnedAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  burnedAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  burnedAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  burnedAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  burnedAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  burnedAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  burnedAtTimeStamp?: InputMaybe<Scalars['BigInt']>;
  burnedAtTimeStamp_gt?: InputMaybe<Scalars['BigInt']>;
  burnedAtTimeStamp_gte?: InputMaybe<Scalars['BigInt']>;
  burnedAtTimeStamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  burnedAtTimeStamp_lt?: InputMaybe<Scalars['BigInt']>;
  burnedAtTimeStamp_lte?: InputMaybe<Scalars['BigInt']>;
  burnedAtTimeStamp_not?: InputMaybe<Scalars['BigInt']>;
  burnedAtTimeStamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  contentHash?: InputMaybe<Scalars['Bytes']>;
  contentHash_contains?: InputMaybe<Scalars['Bytes']>;
  contentHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  contentHash_not?: InputMaybe<Scalars['Bytes']>;
  contentHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  contentHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  contentURI?: InputMaybe<Scalars['String']>;
  contentURI_contains?: InputMaybe<Scalars['String']>;
  contentURI_ends_with?: InputMaybe<Scalars['String']>;
  contentURI_gt?: InputMaybe<Scalars['String']>;
  contentURI_gte?: InputMaybe<Scalars['String']>;
  contentURI_in?: InputMaybe<Array<Scalars['String']>>;
  contentURI_lt?: InputMaybe<Scalars['String']>;
  contentURI_lte?: InputMaybe<Scalars['String']>;
  contentURI_not?: InputMaybe<Scalars['String']>;
  contentURI_not_contains?: InputMaybe<Scalars['String']>;
  contentURI_not_ends_with?: InputMaybe<Scalars['String']>;
  contentURI_not_in?: InputMaybe<Array<Scalars['String']>>;
  contentURI_not_starts_with?: InputMaybe<Scalars['String']>;
  contentURI_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creator?: InputMaybe<Scalars['String']>;
  creatorBidShare?: InputMaybe<Scalars['BigInt']>;
  creatorBidShare_gt?: InputMaybe<Scalars['BigInt']>;
  creatorBidShare_gte?: InputMaybe<Scalars['BigInt']>;
  creatorBidShare_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creatorBidShare_lt?: InputMaybe<Scalars['BigInt']>;
  creatorBidShare_lte?: InputMaybe<Scalars['BigInt']>;
  creatorBidShare_not?: InputMaybe<Scalars['BigInt']>;
  creatorBidShare_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creator_contains?: InputMaybe<Scalars['String']>;
  creator_ends_with?: InputMaybe<Scalars['String']>;
  creator_gt?: InputMaybe<Scalars['String']>;
  creator_gte?: InputMaybe<Scalars['String']>;
  creator_in?: InputMaybe<Array<Scalars['String']>>;
  creator_lt?: InputMaybe<Scalars['String']>;
  creator_lte?: InputMaybe<Scalars['String']>;
  creator_not?: InputMaybe<Scalars['String']>;
  creator_not_contains?: InputMaybe<Scalars['String']>;
  creator_not_ends_with?: InputMaybe<Scalars['String']>;
  creator_not_in?: InputMaybe<Array<Scalars['String']>>;
  creator_not_starts_with?: InputMaybe<Scalars['String']>;
  creator_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  metadataHash?: InputMaybe<Scalars['Bytes']>;
  metadataHash_contains?: InputMaybe<Scalars['Bytes']>;
  metadataHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  metadataHash_not?: InputMaybe<Scalars['Bytes']>;
  metadataHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  metadataHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  metadataURI?: InputMaybe<Scalars['String']>;
  metadataURI_contains?: InputMaybe<Scalars['String']>;
  metadataURI_ends_with?: InputMaybe<Scalars['String']>;
  metadataURI_gt?: InputMaybe<Scalars['String']>;
  metadataURI_gte?: InputMaybe<Scalars['String']>;
  metadataURI_in?: InputMaybe<Array<Scalars['String']>>;
  metadataURI_lt?: InputMaybe<Scalars['String']>;
  metadataURI_lte?: InputMaybe<Scalars['String']>;
  metadataURI_not?: InputMaybe<Scalars['String']>;
  metadataURI_not_contains?: InputMaybe<Scalars['String']>;
  metadataURI_not_ends_with?: InputMaybe<Scalars['String']>;
  metadataURI_not_in?: InputMaybe<Array<Scalars['String']>>;
  metadataURI_not_starts_with?: InputMaybe<Scalars['String']>;
  metadataURI_starts_with?: InputMaybe<Scalars['String']>;
  owner?: InputMaybe<Scalars['String']>;
  ownerBidShare?: InputMaybe<Scalars['BigInt']>;
  ownerBidShare_gt?: InputMaybe<Scalars['BigInt']>;
  ownerBidShare_gte?: InputMaybe<Scalars['BigInt']>;
  ownerBidShare_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ownerBidShare_lt?: InputMaybe<Scalars['BigInt']>;
  ownerBidShare_lte?: InputMaybe<Scalars['BigInt']>;
  ownerBidShare_not?: InputMaybe<Scalars['BigInt']>;
  ownerBidShare_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  prevOwner?: InputMaybe<Scalars['String']>;
  prevOwnerBidShare?: InputMaybe<Scalars['BigInt']>;
  prevOwnerBidShare_gt?: InputMaybe<Scalars['BigInt']>;
  prevOwnerBidShare_gte?: InputMaybe<Scalars['BigInt']>;
  prevOwnerBidShare_in?: InputMaybe<Array<Scalars['BigInt']>>;
  prevOwnerBidShare_lt?: InputMaybe<Scalars['BigInt']>;
  prevOwnerBidShare_lte?: InputMaybe<Scalars['BigInt']>;
  prevOwnerBidShare_not?: InputMaybe<Scalars['BigInt']>;
  prevOwnerBidShare_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  prevOwner_contains?: InputMaybe<Scalars['String']>;
  prevOwner_ends_with?: InputMaybe<Scalars['String']>;
  prevOwner_gt?: InputMaybe<Scalars['String']>;
  prevOwner_gte?: InputMaybe<Scalars['String']>;
  prevOwner_in?: InputMaybe<Array<Scalars['String']>>;
  prevOwner_lt?: InputMaybe<Scalars['String']>;
  prevOwner_lte?: InputMaybe<Scalars['String']>;
  prevOwner_not?: InputMaybe<Scalars['String']>;
  prevOwner_not_contains?: InputMaybe<Scalars['String']>;
  prevOwner_not_ends_with?: InputMaybe<Scalars['String']>;
  prevOwner_not_in?: InputMaybe<Array<Scalars['String']>>;
  prevOwner_not_starts_with?: InputMaybe<Scalars['String']>;
  prevOwner_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
};

export enum Clip_OrderBy {
  Approved = 'approved',
  BurnedAtBlockNumber = 'burnedAtBlockNumber',
  BurnedAtTimeStamp = 'burnedAtTimeStamp',
  ContentHash = 'contentHash',
  ContentUri = 'contentURI',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Creator = 'creator',
  CreatorBidShare = 'creatorBidShare',
  CurrentAsk = 'currentAsk',
  CurrentBids = 'currentBids',
  Id = 'id',
  InactiveAsks = 'inactiveAsks',
  InactiveBids = 'inactiveBids',
  MetadataHash = 'metadataHash',
  MetadataUri = 'metadataURI',
  Owner = 'owner',
  OwnerBidShare = 'ownerBidShare',
  PrevOwner = 'prevOwner',
  PrevOwnerBidShare = 'prevOwnerBidShare',
  TransactionHash = 'transactionHash',
  Transfers = 'transfers'
}

export type Currency = {
  __typename?: 'Currency';
  /** The active Asks denominated in the Currency */
  activeAsks?: Maybe<Array<Ask>>;
  /** The active Bids denominated in the Currency */
  activeBids?: Maybe<Array<Bid>>;
  /** The decimals of the Currency */
  decimals?: Maybe<Scalars['Int']>;
  /** The address of the Currency */
  id: Scalars['ID'];
  /** The InactiveAsks denominated in the Currency */
  inactiveAsks?: Maybe<Array<InactiveAsk>>;
  /** The InactiveBids denominated in the Currency */
  inactiveBids?: Maybe<Array<InactiveBid>>;
  /** Total Bid Liquidity of the Currency on all ClipIt */
  liquidity: Scalars['BigInt'];
  /** The name of the Currency */
  name: Scalars['String'];
  /** The symbol of the Currency */
  symbol: Scalars['String'];
};


export type CurrencyActiveAsksArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Ask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Ask_Filter>;
};


export type CurrencyActiveBidsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Bid_Filter>;
};


export type CurrencyInactiveAsksArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveAsk_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InactiveAsk_Filter>;
};


export type CurrencyInactiveBidsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveBid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<InactiveBid_Filter>;
};

export type Currency_Filter = {
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidity?: InputMaybe<Scalars['BigInt']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
};

export enum Currency_OrderBy {
  ActiveAsks = 'activeAsks',
  ActiveBids = 'activeBids',
  Decimals = 'decimals',
  Id = 'id',
  InactiveAsks = 'inactiveAsks',
  InactiveBids = 'inactiveBids',
  Liquidity = 'liquidity',
  Name = 'name',
  Symbol = 'symbol'
}

export type InactiveAsk = {
  __typename?: 'InactiveAsk';
  /** The amount of Currency of the InactiveAsk */
  amount: Scalars['BigInt'];
  /** The Clip associated with the InactiveAsk */
  clip: Clip;
  /** The number of the block the original Ask was created in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the original Ask was created in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The Currency of the InactiveAsk */
  currency: Currency;
  /** <tokenId>-<transactionHash>-<logIndex> */
  id: Scalars['ID'];
  /** The number of the block the original Ask was inactivated in */
  inactivatedAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the original Ask was inactivated in */
  inactivatedAtTimestamp: Scalars['BigInt'];
  /** The owner of the InactiveAsk */
  owner: User;
  /** Transaction hash the ask was created at */
  transactionHash: Scalars['String'];
  /** The why this Ask is Inactive */
  type: MarketEventType;
};

export type InactiveAsk_Filter = {
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  clip?: InputMaybe<Scalars['String']>;
  clip_contains?: InputMaybe<Scalars['String']>;
  clip_ends_with?: InputMaybe<Scalars['String']>;
  clip_gt?: InputMaybe<Scalars['String']>;
  clip_gte?: InputMaybe<Scalars['String']>;
  clip_in?: InputMaybe<Array<Scalars['String']>>;
  clip_lt?: InputMaybe<Scalars['String']>;
  clip_lte?: InputMaybe<Scalars['String']>;
  clip_not?: InputMaybe<Scalars['String']>;
  clip_not_contains?: InputMaybe<Scalars['String']>;
  clip_not_ends_with?: InputMaybe<Scalars['String']>;
  clip_not_in?: InputMaybe<Array<Scalars['String']>>;
  clip_not_starts_with?: InputMaybe<Scalars['String']>;
  clip_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  inactivatedAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  inactivatedAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  inactivatedAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  inactivatedAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  owner?: InputMaybe<Scalars['String']>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<MarketEventType>;
  type_in?: InputMaybe<Array<MarketEventType>>;
  type_not?: InputMaybe<MarketEventType>;
  type_not_in?: InputMaybe<Array<MarketEventType>>;
};

export enum InactiveAsk_OrderBy {
  Amount = 'amount',
  Clip = 'clip',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Currency = 'currency',
  Id = 'id',
  InactivatedAtBlockNumber = 'inactivatedAtBlockNumber',
  InactivatedAtTimestamp = 'inactivatedAtTimestamp',
  Owner = 'owner',
  TransactionHash = 'transactionHash',
  Type = 'type'
}

export type InactiveBid = {
  __typename?: 'InactiveBid';
  /** The amount of Currency of the InactiveBid */
  amount: Scalars['BigInt'];
  /** The bidder of the InactiveBid */
  bidder: User;
  /** The Clip associated with the InactiveBid */
  clip: Clip;
  /** The number of the block the original Bid was created in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the original Bid was created in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The Currency of the InactiveBid */
  currency: Currency;
  /** <tokenId>-<transactionHash>-<logIndex> */
  id: Scalars['ID'];
  /** The number of the block the original Bid was inactivated in */
  inactivatedAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the original Bid was inactivated in */
  inactivatedAtTimestamp: Scalars['BigInt'];
  /** The recipient of the InactiveBid */
  recipient: User;
  /** The sellOnShare of the InactiveBid */
  sellOnShare: Scalars['BigInt'];
  /** Transaction hash the bid was created at */
  transactionHash: Scalars['String'];
  /** The reason why this Bid is Inactive */
  type: MarketEventType;
};

export type InactiveBid_Filter = {
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bidder?: InputMaybe<Scalars['String']>;
  bidder_contains?: InputMaybe<Scalars['String']>;
  bidder_ends_with?: InputMaybe<Scalars['String']>;
  bidder_gt?: InputMaybe<Scalars['String']>;
  bidder_gte?: InputMaybe<Scalars['String']>;
  bidder_in?: InputMaybe<Array<Scalars['String']>>;
  bidder_lt?: InputMaybe<Scalars['String']>;
  bidder_lte?: InputMaybe<Scalars['String']>;
  bidder_not?: InputMaybe<Scalars['String']>;
  bidder_not_contains?: InputMaybe<Scalars['String']>;
  bidder_not_ends_with?: InputMaybe<Scalars['String']>;
  bidder_not_in?: InputMaybe<Array<Scalars['String']>>;
  bidder_not_starts_with?: InputMaybe<Scalars['String']>;
  bidder_starts_with?: InputMaybe<Scalars['String']>;
  clip?: InputMaybe<Scalars['String']>;
  clip_contains?: InputMaybe<Scalars['String']>;
  clip_ends_with?: InputMaybe<Scalars['String']>;
  clip_gt?: InputMaybe<Scalars['String']>;
  clip_gte?: InputMaybe<Scalars['String']>;
  clip_in?: InputMaybe<Array<Scalars['String']>>;
  clip_lt?: InputMaybe<Scalars['String']>;
  clip_lte?: InputMaybe<Scalars['String']>;
  clip_not?: InputMaybe<Scalars['String']>;
  clip_not_contains?: InputMaybe<Scalars['String']>;
  clip_not_ends_with?: InputMaybe<Scalars['String']>;
  clip_not_in?: InputMaybe<Array<Scalars['String']>>;
  clip_not_starts_with?: InputMaybe<Scalars['String']>;
  clip_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  inactivatedAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  inactivatedAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  inactivatedAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  inactivatedAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  inactivatedAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  recipient?: InputMaybe<Scalars['String']>;
  recipient_contains?: InputMaybe<Scalars['String']>;
  recipient_ends_with?: InputMaybe<Scalars['String']>;
  recipient_gt?: InputMaybe<Scalars['String']>;
  recipient_gte?: InputMaybe<Scalars['String']>;
  recipient_in?: InputMaybe<Array<Scalars['String']>>;
  recipient_lt?: InputMaybe<Scalars['String']>;
  recipient_lte?: InputMaybe<Scalars['String']>;
  recipient_not?: InputMaybe<Scalars['String']>;
  recipient_not_contains?: InputMaybe<Scalars['String']>;
  recipient_not_ends_with?: InputMaybe<Scalars['String']>;
  recipient_not_in?: InputMaybe<Array<Scalars['String']>>;
  recipient_not_starts_with?: InputMaybe<Scalars['String']>;
  recipient_starts_with?: InputMaybe<Scalars['String']>;
  sellOnShare?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_gt?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_gte?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sellOnShare_lt?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_lte?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_not?: InputMaybe<Scalars['BigInt']>;
  sellOnShare_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<MarketEventType>;
  type_in?: InputMaybe<Array<MarketEventType>>;
  type_not?: InputMaybe<MarketEventType>;
  type_not_in?: InputMaybe<Array<MarketEventType>>;
};

export enum InactiveBid_OrderBy {
  Amount = 'amount',
  Bidder = 'bidder',
  Clip = 'clip',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Currency = 'currency',
  Id = 'id',
  InactivatedAtBlockNumber = 'inactivatedAtBlockNumber',
  InactivatedAtTimestamp = 'inactivatedAtTimestamp',
  Recipient = 'recipient',
  SellOnShare = 'sellOnShare',
  TransactionHash = 'transactionHash',
  Type = 'type'
}

/** The Types for MarketEvents (Asks, Bids) */
export enum MarketEventType {
  Finalized = 'Finalized',
  Removed = 'Removed'
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  ask?: Maybe<Ask>;
  asks: Array<Ask>;
  bid?: Maybe<Bid>;
  bids: Array<Bid>;
  clip?: Maybe<Clip>;
  clips: Array<Clip>;
  currencies: Array<Currency>;
  currency?: Maybe<Currency>;
  inactiveAsk?: Maybe<InactiveAsk>;
  inactiveAsks: Array<InactiveAsk>;
  inactiveBid?: Maybe<InactiveBid>;
  inactiveBids: Array<InactiveBid>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  uriupdate?: Maybe<UriUpdate>;
  uriupdates: Array<UriUpdate>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAskArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAsksArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Ask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Ask_Filter>;
};


export type QueryBidArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBidsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bid_Filter>;
};


export type QueryClipArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryClipsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Clip_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Clip_Filter>;
};


export type QueryCurrenciesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Currency_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Currency_Filter>;
};


export type QueryCurrencyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryInactiveAskArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryInactiveAsksArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveAsk_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InactiveAsk_Filter>;
};


export type QueryInactiveBidArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryInactiveBidsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveBid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InactiveBid_Filter>;
};


export type QueryTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transfer_Filter>;
};


export type QueryUriupdateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUriupdatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UriUpdate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UriUpdate_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  ask?: Maybe<Ask>;
  asks: Array<Ask>;
  bid?: Maybe<Bid>;
  bids: Array<Bid>;
  clip?: Maybe<Clip>;
  clips: Array<Clip>;
  currencies: Array<Currency>;
  currency?: Maybe<Currency>;
  inactiveAsk?: Maybe<InactiveAsk>;
  inactiveAsks: Array<InactiveAsk>;
  inactiveBid?: Maybe<InactiveBid>;
  inactiveBids: Array<InactiveBid>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  uriupdate?: Maybe<UriUpdate>;
  uriupdates: Array<UriUpdate>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionAskArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAsksArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Ask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Ask_Filter>;
};


export type SubscriptionBidArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionBidsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bid_Filter>;
};


export type SubscriptionClipArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionClipsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Clip_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Clip_Filter>;
};


export type SubscriptionCurrenciesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Currency_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Currency_Filter>;
};


export type SubscriptionCurrencyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionInactiveAskArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionInactiveAsksArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveAsk_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InactiveAsk_Filter>;
};


export type SubscriptionInactiveBidArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionInactiveBidsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InactiveBid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InactiveBid_Filter>;
};


export type SubscriptionTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transfer_Filter>;
};


export type SubscriptionUriupdateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUriupdatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UriUpdate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UriUpdate_Filter>;
};


export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Transfer = {
  __typename?: 'Transfer';
  /** The Clip associated with the Transfer */
  clip: Clip;
  /** The number of the block the Transfer was created in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the Transfer was created in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The User transferring the Clip */
  from: User;
  /** <tokenId>-<transactionHash>-<logIndex> */
  id: Scalars['ID'];
  /** The User receiving the Clip */
  to: User;
  /** Transaction hash for the transfer */
  transactionHash: Scalars['String'];
};

export type Transfer_Filter = {
  clip?: InputMaybe<Scalars['String']>;
  clip_contains?: InputMaybe<Scalars['String']>;
  clip_ends_with?: InputMaybe<Scalars['String']>;
  clip_gt?: InputMaybe<Scalars['String']>;
  clip_gte?: InputMaybe<Scalars['String']>;
  clip_in?: InputMaybe<Array<Scalars['String']>>;
  clip_lt?: InputMaybe<Scalars['String']>;
  clip_lte?: InputMaybe<Scalars['String']>;
  clip_not?: InputMaybe<Scalars['String']>;
  clip_not_contains?: InputMaybe<Scalars['String']>;
  clip_not_ends_with?: InputMaybe<Scalars['String']>;
  clip_not_in?: InputMaybe<Array<Scalars['String']>>;
  clip_not_starts_with?: InputMaybe<Scalars['String']>;
  clip_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  from?: InputMaybe<Scalars['String']>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  to?: InputMaybe<Scalars['String']>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_gt?: InputMaybe<Scalars['String']>;
  to_gte?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<Scalars['String']>>;
  to_lt?: InputMaybe<Scalars['String']>;
  to_lte?: InputMaybe<Scalars['String']>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<Scalars['String']>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
};

export enum Transfer_OrderBy {
  Clip = 'clip',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  From = 'from',
  Id = 'id',
  To = 'to',
  TransactionHash = 'transactionHash'
}

export type UriUpdate = {
  __typename?: 'URIUpdate';
  /** The Clip associated with the URIUpdate */
  clip: Clip;
  /** The number of the block the URIUpdate was created in */
  createdAtBlockNumber: Scalars['BigInt'];
  /** The timestamp of the block the URIUpdate was created in */
  createdAtTimestamp: Scalars['BigInt'];
  /** The previous uri */
  from: Scalars['String'];
  /** <tokenId>-<transactionHash>-<logIndex> */
  id: Scalars['ID'];
  /** The owner of the Clip */
  owner: User;
  /** The new uri */
  to: Scalars['String'];
  /** The transaction has the uri update happened at */
  transactionHash: Scalars['String'];
  /** The Type of URIUpdate */
  type: UriUpdateType;
  /** The updater of the Clip's URI */
  updater: User;
};

/** The Types of URI Updates */
export enum UriUpdateType {
  Content = 'Content',
  Metadata = 'Metadata'
}

export type UriUpdate_Filter = {
  clip?: InputMaybe<Scalars['String']>;
  clip_contains?: InputMaybe<Scalars['String']>;
  clip_ends_with?: InputMaybe<Scalars['String']>;
  clip_gt?: InputMaybe<Scalars['String']>;
  clip_gte?: InputMaybe<Scalars['String']>;
  clip_in?: InputMaybe<Array<Scalars['String']>>;
  clip_lt?: InputMaybe<Scalars['String']>;
  clip_lte?: InputMaybe<Scalars['String']>;
  clip_not?: InputMaybe<Scalars['String']>;
  clip_not_contains?: InputMaybe<Scalars['String']>;
  clip_not_ends_with?: InputMaybe<Scalars['String']>;
  clip_not_in?: InputMaybe<Array<Scalars['String']>>;
  clip_not_starts_with?: InputMaybe<Scalars['String']>;
  clip_starts_with?: InputMaybe<Scalars['String']>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  from?: InputMaybe<Scalars['String']>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  owner?: InputMaybe<Scalars['String']>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  to?: InputMaybe<Scalars['String']>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_gt?: InputMaybe<Scalars['String']>;
  to_gte?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<Scalars['String']>>;
  to_lt?: InputMaybe<Scalars['String']>;
  to_lte?: InputMaybe<Scalars['String']>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<Scalars['String']>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<UriUpdateType>;
  type_in?: InputMaybe<Array<UriUpdateType>>;
  type_not?: InputMaybe<UriUpdateType>;
  type_not_in?: InputMaybe<Array<UriUpdateType>>;
  updater?: InputMaybe<Scalars['String']>;
  updater_contains?: InputMaybe<Scalars['String']>;
  updater_ends_with?: InputMaybe<Scalars['String']>;
  updater_gt?: InputMaybe<Scalars['String']>;
  updater_gte?: InputMaybe<Scalars['String']>;
  updater_in?: InputMaybe<Array<Scalars['String']>>;
  updater_lt?: InputMaybe<Scalars['String']>;
  updater_lte?: InputMaybe<Scalars['String']>;
  updater_not?: InputMaybe<Scalars['String']>;
  updater_not_contains?: InputMaybe<Scalars['String']>;
  updater_not_ends_with?: InputMaybe<Scalars['String']>;
  updater_not_in?: InputMaybe<Array<Scalars['String']>>;
  updater_not_starts_with?: InputMaybe<Scalars['String']>;
  updater_starts_with?: InputMaybe<Scalars['String']>;
};

export enum UriUpdate_OrderBy {
  Clip = 'clip',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  From = 'from',
  Id = 'id',
  Owner = 'owner',
  To = 'to',
  TransactionHash = 'transactionHash',
  Type = 'type',
  Updater = 'updater'
}

export type User = {
  __typename?: 'User';
  /** Users that have been granted `ApprovalForAll` Clip of the User's Collection */
  authorizedUsers?: Maybe<Array<User>>;
  /** The Clip the User owns */
  collection: Array<Clip>;
  /** The Clip the User created */
  creations: Array<Clip>;
  /** The active Bids made by the User */
  currentBids?: Maybe<Array<Bid>>;
  /** Ethereum Address */
  id: Scalars['ID'];
};


export type UserAuthorizedUsersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<User_Filter>;
};


export type UserCollectionArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Clip_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Clip_Filter>;
};


export type UserCreationsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Clip_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Clip_Filter>;
};


export type UserCurrentBidsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Bid_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Bid_Filter>;
};

export type User_Filter = {
  authorizedUsers?: InputMaybe<Array<Scalars['String']>>;
  authorizedUsers_contains?: InputMaybe<Array<Scalars['String']>>;
  authorizedUsers_not?: InputMaybe<Array<Scalars['String']>>;
  authorizedUsers_not_contains?: InputMaybe<Array<Scalars['String']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
};

export enum User_OrderBy {
  AuthorizedUsers = 'authorizedUsers',
  Collection = 'collection',
  Creations = 'creations',
  CurrentBids = 'currentBids',
  Id = 'id'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_1_Query = { __typename?: 'Query', clips: Array<{ __typename?: 'Clip', id: string, transactionHash: string, owner: { __typename?: 'User', id: string }, creator: { __typename?: 'User', id: string } }> };
