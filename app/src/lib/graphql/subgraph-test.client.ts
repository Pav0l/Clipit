import { clipPartialFragment } from "../../../tests/__fixtures__/clip-fragment";

import { AuctionPartialFragment, ClipPartialFragment, GetClipsQuery } from "./types";
import { ISubgraphClient, UserData } from "./subgraph.client";

export class SubgraphTestClient implements ISubgraphClient {
  fetchAuctionCached = (tokenId: string): Promise<AuctionPartialFragment | null> => {
    throw new Error("method not implemented");
  };
  fetchClipCached = async (_tokenId: string): Promise<ClipPartialFragment | null> => {
    return clipPartialFragment;
  };

  fetchClipByHashCached = async (_txHash: string): Promise<ClipPartialFragment | null> => {
    return clipPartialFragment;
  };

  fetchClips = async (skip?: number): Promise<GetClipsQuery | null> => {
    if (skip) {
      throw new Error("skip not implemented yet");
    }
    return {
      clips: [clipPartialFragment],
    };
  };

  fetchUserCached = async (_address: string): Promise<UserData | null> => {
    return {
      id: clipPartialFragment.id,
      currentBids: clipPartialFragment.currentBids,
      collection: [clipPartialFragment],
      reserveAuctionBids: [],
    };
  };
}
