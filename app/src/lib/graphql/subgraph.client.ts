import DataLoader from "dataloader";
import { GraphQLClient } from "graphql-request";
import { GET_TOKENS_QUERY, GET_TOKEN_BY_TX_HASH, GET_USER_TOKENS_QUERY } from "./queries";
import { BidPartialFragment, ClipPartialFragment, GetClipDataQuery, GetUserDataQuery, GetTokenByTxHashQuery } from "./types";


export class SubgraphClient {
  private userLoader: DataLoader<string, UserData>;
  private clipLoader: DataLoader<string, ClipPartialFragment>;
  private clipHashLoader: DataLoader<string, ClipPartialFragment>;

  constructor(private client: GraphQLClient) {
    this.userLoader = new DataLoader((keys) => this.getUser(keys));
    this.clipLoader = new DataLoader((keys) => this.getClip(keys));
    this.clipHashLoader = new DataLoader((keys) => this.getClipByTxHash(keys));
  }

  fetchClipCached = async (tokenId: string) => {
    const clip = await this.clipLoader.load(tokenId);
    if (!clip) {
      throw new Error("Unable to find clip");
    }
    return clip;
  }

  fetchClipByHashCached = async (txHash: string) => {
    const clip = await this.clipHashLoader.load(txHash);
    if (!clip) {
      throw new Error("Unable to find clip");
    }
    return clip;
  }

  fetchUserCached = async (address: string) => {
    const user = await this.userLoader.load(address);
    if (!user) {
      throw new Error("Unable to find user");
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
}

function transformUserData(data: GetUserDataQuery, key: string): UserData {
  const user = data.users.find((user) => user.id === key);
  if (!user) {
    throw new Error("No valid user in response from Graph");
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

function transformClipData(data: GetClipDataQuery, key: string): ClipPartialFragment {
  const clip = data.clips.find((clip) => clip.id === key);
  if (!clip) {
    throw new Error("No valid clip in response from Graph");
  }

  return clip;
}

function transformClipDataFromHash(data: GetTokenByTxHashQuery, key: string): ClipPartialFragment {
  const clip = data.clips.find((clip) => clip.transactionHash === key);
  if (!clip) {
    throw new Error("No valid clip in response from Graph");
  }

  return clip;
}


interface UserData {
  currentBids?: BidPartialFragment[];
  id: string;
  collection: ClipPartialFragment[]
}
