import DataLoader from "dataloader";
import { GraphQLClient } from "graphql-request";
import { GET_CLIPS, GET_TOKENS_QUERY, GET_TOKEN_BY_TX_HASH, GET_USER_TOKENS_QUERY } from "./queries";
import { BidPartialFragment, ClipPartialFragment, GetClipDataQuery, GetUserDataQuery, GetTokenByTxHashQuery, GetClipsQuery } from "./types";


export class SubgraphClient {
  private userLoader: DataLoader<string, UserData | null>;
  private clipLoader: DataLoader<string, ClipPartialFragment | null>;
  private clipHashLoader: DataLoader<string, ClipPartialFragment | null>;

  constructor(private client: GraphQLClient) {
    this.userLoader = new DataLoader((keys) => this.getUser(keys));
    this.clipLoader = new DataLoader((keys) => this.getClip(keys));
    this.clipHashLoader = new DataLoader((keys) => this.getClipByTxHash(keys));
  }

  /**
   * fetchClipCached fetches Clip (NFT) data from the subgraph based on its id
   */
  fetchClipCached = async (tokenId: string) => {
    const clip = await this.clipLoader.load(tokenId);
    if (!clip) {
      return null;
    }
    return clip;
  }

  fetchClipByHashCached = async (txHash: string) => {
    const clip = this.retryFetch<string, ClipPartialFragment>(this.clipHashLoader, txHash, 3, 5000);
    if (!clip) {
      return null;
    }

    return clip;
  }

  /**
   * Fetches first 20 Clips (NFTs) from the subgraph
   * @param skip Used to paginate next 20 results.
   */
  fetchClips = async (skip?: number) => this.client.request<GetClipsQuery>(GET_CLIPS, { skip });

  fetchUserCached = async (address: string) => {
    const user = await this.userLoader.load(address);
    if (!user) {
      return null;
    }
    return user;
  }

  private getUser = async (addresses: readonly string[]) => {
    const resp = await this.client.request<GetUserDataQuery>(GET_USER_TOKENS_QUERY, {
      ids: addresses
    });

    return addresses.map((addr) => transformUserData(resp, addr));
  }

  private getClip = async (clipIds: readonly string[]) => {
    const resp = await this.client.request<GetClipDataQuery>(GET_TOKENS_QUERY, {
      ids: clipIds
    });

    return clipIds.map((clipId) => transformClipData(resp, clipId));
  }

  private getClipByTxHash = async (txHashes: readonly string[]) => {
    const resp = await this.client.request<GetTokenByTxHashQuery>(GET_TOKEN_BY_TX_HASH, {
      hashes: txHashes
    });

    return txHashes.map((hash) => transformClipDataFromHash(resp, hash));
  }

  private retryFetch = async <K, V>(loader: DataLoader<K, V | null>, key: K, retryCount: number, retryDelay: number) => {
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
  }
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function transformUserData(data: GetUserDataQuery, key: string): UserData | null {
  const user = data.users.find((user) => user.id === key);
  if (!user) {
    return null;
  }

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
    })),
    collection: user.collection
  }
}

function transformClipData(data: GetClipDataQuery, key: string): ClipPartialFragment | null {
  const clip = data.clips.find((clip) => clip.id === key);
  if (!clip) {
    return null;
  }

  return clip;
}

function transformClipDataFromHash(data: GetTokenByTxHashQuery, key: string): ClipPartialFragment | null {
  const clip = data.clips.find((clip) => clip.transactionHash === key);
  if (!clip) {
    return null;
  }

  return clip;
}


interface UserData {
  currentBids?: BidPartialFragment[];
  id: string;
  collection: ClipPartialFragment[]
}
