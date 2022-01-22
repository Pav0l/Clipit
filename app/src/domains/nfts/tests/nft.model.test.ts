import { ReserveAuctionStatus } from "../../../lib/graphql/types";
import { MetaModel } from "../../app/meta.model";
import { ActiveBid, Metadata, NftModel } from "../nft.model";

describe("nft model", () => {
  describe("active bids", () => {
    it("sets proper bid attributes", () => {
      const bid = new ActiveBid({ bidder: "0x123", symbol: "WETH", amount: "1000000000000000000" });
      expect(bid.symbol).toEqual("WETH");
      expect(bid.amount).toEqual("1000000000000000000");
      expect(bid.displayAmount).toEqual("1.0");
      expect(bid.bidderAddress).toEqual("0x123");
    });

    it("displayAmount is max 4 decimal digits", () => {
      const bid = new ActiveBid({ bidder: "0x123", symbol: "WETH", amount: "123451234567890", decimals: 10 });
      expect(bid.displayAmount).toEqual("12345.1234");
    });

    it("numbers higher than 6 digits do not have nums after the decimal dot", () => {
      const bid = new ActiveBid({ bidder: "0x123", symbol: "WETH", amount: "123451234567890", decimals: 3 });
      expect(bid.displayAmount).toEqual("123451234567");
    });

    it("values without decimal are returned in full length", () => {
      const bid = new ActiveBid({ bidder: "0x123", symbol: "WETH", amount: "123451234567890", decimals: 0 });
      expect(bid.displayAmount).toEqual("123451234567890");
    });
  });

  describe("metadata", () => {
    it("throws on invalid data", () => {
      expect(() => {
        new Metadata({} as any)
      }).toThrow();
    });

    it("adds proper Metadata properties", () => {
      const metadata = new Metadata({
        clipCid: "clipCid",
        name: "name",
        description: "description",
        metadataCid: "metadataCid",
        tokenId: "tokenId",
        thumbnailUri: "thumbnailUri",
        owner: "owner",
        currentBids: null
      }, 'gateway.foo.com');

      expect(metadata.clipCid).toEqual("clipCid");
      expect(metadata.clipTitle).toEqual("name");
      expect(metadata.description).toEqual("description");
      expect(metadata.metadataCid).toEqual("metadataCid");
      expect(metadata.tokenId).toEqual("tokenId");
      expect(metadata.thumbnailUri).toEqual("thumbnailUri");
      expect(metadata.owner).toEqual("owner");
      expect(metadata.clipIpfsUri).toEqual("gateway.foo.com/clipCid");
    });

    it("marketplace metadata", () => {
      const model = new NftModel(new MetaModel());
      model.addMetadata({
        clipCid: "clipCid",
        name: "name",
        description: "description",
        metadataCid: "metadataCid",
        tokenId: "tokenId",
        thumbnailUri: "thumbnailUri",
        owner: "owner",
        reserveAuction: [{
          id: 'id',
          tokenId: 'tokenId',
          status: ReserveAuctionStatus.Pending,
          approved: false,
          duration: '3600',
          reservePrice: '0',
          tokenOwner: { id: 'owner' },
          auctionCurrency: {
            id: 'id',
            name: 'money',
            symbol: 'M'
          }
        }]
      });

      expect(model.metadataForMarketplace.length).toEqual(0);
    });
  });
});
