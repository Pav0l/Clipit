import DataLoader from "dataloader";
import { GraphQLClient } from "graphql-request";
import { GET_USER_TOKENS_QUERY } from "./queries";
import { BidPartialFragment, ClipPartialFragment, GetUserDataQuery } from "./types";


export class SubgraphClient {
  private userLoader: DataLoader<string, UserData>

  constructor(private client: GraphQLClient) {
    this.userLoader = new DataLoader((keys) => this.getUser(keys));
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

interface UserData {
  currentBids?: BidPartialFragment[];
  id: string;
  collection: ClipPartialFragment[]
}
