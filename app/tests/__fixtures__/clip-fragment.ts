import { signerAddress } from "./ethereum";
import { clipCid, metadataCid } from "./metadata";

export const clipPartialFragment = {
  contentURI: `ipfs://${clipCid}`,
  contentHash: "86a4520fbba63d788b85fb6e3fbb5ffc182edf974f5a0e34ac695caacf3f3081",
  createdAtTimestamp: "1641363676",
  creator: {
    id: signerAddress,
  },
  creatorBidShare: "5000000000000000000",
  currentAsk: null,
  currentBids: [
    {
      amount: "1000000000000000000",
      clip: {
        contentURI: `ipfs://${clipCid}`,
        id: "1",
        metadataURI: `ipfs://${metadataCid}`,
      },
      currency: {
        decimals: 18,
        id: "0xd914521c063141139fce010982780140aa0cd5ab",
        name: "Wrapped Ether",
        symbol: "WETH",
      },
      id: "1-0xbidderbidderbidderbidderbidderbidder0000",
      bidder: {
        id: "0xbidderbidderbidderbidderbidderbidder0000",
      },
    },
  ],
  id: "1",
  metadataURI: `ipfs://${metadataCid}`,
  owner: {
    id: signerAddress,
  },
  ownerBidShare: "95000000000000000000",
  transactionHash: "0xb51c9eac95b3f4cb287dc59e046719e564ef07951bc4664a8fd2f8d866ca272b",
};
