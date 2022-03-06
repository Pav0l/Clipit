import { clipPartialFragment } from "../../../tests/__fixtures__/clip-fragment";
import { auctionPartialFragment } from "../../../tests/__fixtures__/auction-fragment";

import { AuctionPartialFragment, ClipPartialFragment, GetClipsQuery } from "./types";
import { ISubgraphClient, UserData } from "./subgraph.client";

export class SubgraphTestClient implements ISubgraphClient {
  fetchAuctionByHashCached = async (_txHash: string): Promise<{ id: string } | null> => {
    return { id: auctionPartialFragment.id };
  };

  fetchAuctionCached = async (_tokenId: string): Promise<AuctionPartialFragment | null> => {
    return auctionPartialFragment;
  };

  fetchClipCached = async (_tokenId: string): Promise<ClipPartialFragment | null> => {
    return clipPartialFragment;
  };

  fetchClipByContentHashCached = async (_contentHash: string) => {
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
