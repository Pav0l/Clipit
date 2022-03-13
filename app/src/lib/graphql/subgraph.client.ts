import DataLoader from "dataloader";
import { GraphQLClient } from "graphql-request";
import {
  GET_CLIPS,
  GET_TOKENS_QUERY,
  GET_TOKEN_BY_TX_HASH,
  GET_USER_TOKENS_QUERY,
  GET_AUCTION_BY_TX_HASH_QUERY,
  GET_CLIPS_BY_CONTENT_HASH,
} from "./queries";
import {
  BidPartialFragment,
  ClipPartialFragment,
  GetClipDataQuery,
  GetUserDataQuery,
  GetTokenByTxHashQuery,
  GetClipsQuery,
  GetAuctionByTxHashQuery,
  GetClipsByContentHashQuery,
} from "./types";
import { CLIPS_PAGINATION_SKIP_VALUE } from "../constants";

export interface ISubgraphClient {
  fetchClipCached: (
    tokenId: string,
    options?: { clearCache: boolean }
  ) => Promise<ClipPartialFragment | null | SubgraphError>;
  fetchClipByContentHashCached: (contentHash: string) => Promise<ClipPartialFragment | null | SubgraphError>;
  fetchClipByHashCached: (txHash: string) => Promise<{ id: string } | null | SubgraphError>;
  fetchClips: (skip?: number) => Promise<GetClipsQuery | null | SubgraphError>;
  fetchUserCached: (address: string) => Promise<UserData | null | SubgraphError>;
  fetchAuctionByHashCached: (txHash: string) => Promise<{ id: string } | null | SubgraphError>;
}

interface SubgraphError {
  errors: { message: string }[];
}

export function isSubgraphError(value: unknown | null | SubgraphError): value is SubgraphError {
  return (value as SubgraphError)?.errors !== undefined;
}

export class SubgraphClient implements ISubgraphClient {
  private userLoader: DataLoader<string, UserData | null>;
  private clipLoader: DataLoader<string, ClipPartialFragment | null>;
  private clipTxHashLoader: DataLoader<string, { id: string } | null>;
  private clipContentHashLoader: DataLoader<string, ClipPartialFragment | null>;
  private auctionHashLoader: DataLoader<string, { id: string } | null>;

  constructor(private client: GraphQLClient) {
    this.userLoader = new DataLoader((keys) => this.getUser(keys));
    this.clipLoader = new DataLoader((keys) => this.getClip(keys));
    this.clipTxHashLoader = new DataLoader((keys) => this.getClipByTxHash(keys));
    this.clipContentHashLoader = new DataLoader((keys) => this.getClipByContentHash(keys));
    this.auctionHashLoader = new DataLoader((keys) => this.getAuctionForTxHash(keys));
  }

  /**
   * fetchClipCached fetches Clip (NFT) data from the subgraph based on its id
   */
  fetchClipCached = async (tokenId: string, options: { clearCache: boolean } = { clearCache: false }) => {
    if (options.clearCache) {
      this.clipLoader.clear(tokenId);
    }

    const clip = await this.clipLoader.load(tokenId);
    if (!clip) {
      return null;
    }
    return clip;
  };

  fetchClipByHashCached = async (txHash: string) => {
    const clip = this.retryFetch<string, { id: string }>(this.clipTxHashLoader, txHash, 3, 5000);
    if (!clip) {
      return null;
    }

    return clip;
  };

  fetchClipByContentHashCached = async (contentHash: string) => {
    const clip = await this.clipContentHashLoader.load(contentHash);
    if (!clip) {
      return null;
    }
    return clip;
  };

  /**
   * Fetches first CLIPS_PAGINATION_SKIP_VALUE Clips (NFTs) from the subgraph
   * @param skip Used to paginate next CLIPS_PAGINATION_SKIP_VALUE results.
   */
  fetchClips = async (skip?: number) =>
    this.client.request<GetClipsQuery>(GET_CLIPS, {
      first: CLIPS_PAGINATION_SKIP_VALUE,
      skip,
    });

  fetchUserCached = async (address: string) => {
    const user = await this.userLoader.load(address);
    if (!user) {
      return null;
    }
    return user;
  };

  fetchAuctionByHashCached = async (txHash: string) => {
    const auction = this.retryFetch<string, { id: string }>(this.auctionHashLoader, txHash, 3, 3000);
    if (!auction) {
      return null;
    }

    return auction;
  };

  private getUser = async (addresses: readonly string[]) => {
    const resp = await this.client.request<GetUserDataQuery>(GET_USER_TOKENS_QUERY, {
      ids: addresses,
      userIds: addresses,
    });

    return addresses.map((addr) => transformUserData(resp, addr));
  };

  private getClip = async (clipIds: readonly string[]) => {
    const resp = await this.client.request<GetClipDataQuery>(GET_TOKENS_QUERY, {
      ids: clipIds,
    });

    return clipIds.map((clipId) => transformClipData(resp, clipId));
  };

  private getClipByTxHash = async (txHashes: readonly string[]) => {
    const resp = await this.client.request<GetTokenByTxHashQuery>(GET_TOKEN_BY_TX_HASH, {
      hashes: txHashes,
    });

    return txHashes.map((hash) => transformClipDataFromTxHash(resp, hash));
  };

  private getClipByContentHash = async (contentHashes: readonly string[]) => {
    const resp = await this.client.request<GetClipsByContentHashQuery>(GET_CLIPS_BY_CONTENT_HASH, {
      hashes: contentHashes,
    });

    return contentHashes.map((hash) => transformClipDataFromContentHash(resp, hash));
  };

  private getAuctionForTxHash = async (txHashes: readonly string[]) => {
    const resp = await this.client.request<GetAuctionByTxHashQuery>(GET_AUCTION_BY_TX_HASH_QUERY, {
      txHashes: txHashes,
    });

    return txHashes.map((hash) => {
      const auction = resp.reserveAuctions.find((a) => a.transactionHash === hash);
      return auction ? { id: auction.id } : null;
    });
  };

  private retryFetch = async <K, V>(
    loader: DataLoader<K, V | null>,
    key: K,
    retryCount: number,
    retryDelay: number
  ) => {
    let delay = retryDelay;
    for (let i = 0; i < retryCount; i++) {
      const value = await loader.load(key);
      if (value) {
        return value;
      }

      console.log(`[LOG]:attempt to fetch data: ${i}. missing value for ${key}. retrying in ${delay}`);

      // no value yet. clear cached `undefined` value an try again after delay
      loader.clear(key);
      await sleep(delay);

      // keep increasing the delay between unsuccessfull calls
      delay *= 2;
    }
    console.log(`[LOG]:unable to get value from graph after ${retryCount} retries`);
    return null;
  };
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function transformUserData(data: GetUserDataQuery, key: string): UserData | null {
  const user = data.users.find((user) => user.id === key);
  if (!user) {
    return null;
  }
  const clipsOnAuction: ClipPartialFragment[] = [];
  data.reserveAuctions.forEach((auction) => {
    if (auction.tokenOwner.id === key && auction.clip != null) {
      clipsOnAuction.push(auction.clip);
    }
  });

  const reserveAuctionBids: ClipPartialFragment[] = [];
  data.reserveAuctionBids.forEach((bid) => {
    if (bid.reserveAuction.clip) {
      reserveAuctionBids.push(bid.reserveAuction.clip);
    }
  });

  return {
    id: user.id,
    currentBids: user.currentBids?.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      clip: {
        id: bid.clip.id,
        contentURI: bid.clip.contentURI,
        metadataURI: bid.clip.metadataURI,
      },
      currency: {
        id: bid.currency.id,
        name: bid.currency.name,
        symbol: bid.currency.symbol,
        decimals: bid.currency.decimals,
      },
      bidder: {
        id: bid.bidder.id,
      },
    })),
    collection: [...user.collection, ...clipsOnAuction],
    reserveAuctionBids: reserveAuctionBids,
  };
}

function transformClipData(data: GetClipDataQuery, key: string): ClipPartialFragment | null {
  const clip = data.clips.find((clip) => clip.id === key);
  if (!clip) {
    return null;
  }

  return clip;
}

function transformClipDataFromTxHash(data: GetTokenByTxHashQuery, key: string): { id: string } | null {
  const clip = data.clips.find((clip) => clip.transactionHash === key);
  if (!clip) {
    return null;
  }

  return clip;
}

function transformClipDataFromContentHash(data: GetClipsByContentHashQuery, key: string): ClipPartialFragment | null {
  const clip = data.clips.find((clip) => clip.contentHash === key);
  if (!clip) {
    return null;
  }

  return clip;
}

export interface UserData {
  currentBids?: BidPartialFragment[];
  id: string;
  collection: ClipPartialFragment[];
  reserveAuctionBids: ClipPartialFragment[];
}
