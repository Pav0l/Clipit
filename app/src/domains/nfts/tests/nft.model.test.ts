import { ReserveAuctionBidType, ReserveAuctionStatus } from "../../../lib/graphql/types";
import { MetaModel } from "../../meta/meta.model";
import { Bid, Auction, DisplayAuctionStatus, DisplayAuctionStatusTitle, Metadata, NftModel } from "../nft.model";

describe("nft model", () => {
  describe("bids", () => {
    it("sets proper bid attributes", () => {
      const bid = new Bid({
        bidder: "0x123",
        bidType: ReserveAuctionBidType.Active,
        symbol: "WETH",
        amount: "1000000000000000000",
      });
      expect(bid.symbol).toEqual("WETH");
      expect(bid.amount).toEqual("1000000000000000000");
      expect(bid.displayAmount).toEqual("1.0");
      expect(bid.bidderAddress).toEqual("0x123");
    });

    it("displayAmount is max 4 decimal digits", () => {
      const bid = new Bid({
        bidder: "0x123",
        bidType: ReserveAuctionBidType.Active,
        symbol: "WETH",
        amount: "123451234567890",
        decimals: 10,
      });
      expect(bid.displayAmount).toEqual("12345.1234");
    });

    it("numbers higher than 6 digits do not have nums after the decimal dot", () => {
      const bid = new Bid({
        bidder: "0x123",
        bidType: ReserveAuctionBidType.Active,
        symbol: "WETH",
        amount: "123451234567890",
        decimals: 3,
      });
      expect(bid.displayAmount).toEqual("123451234567");
    });

    it("values without decimal are returned in full length", () => {
      const bid = new Bid({
        bidder: "0x123",
        bidType: ReserveAuctionBidType.Active,
        symbol: "WETH",
        amount: "123451234567890",
        decimals: 0,
      });
      expect(bid.displayAmount).toEqual("123451234567890");
    });
  });

  describe("metadata", () => {
    it("throws on invalid data", () => {
      expect(() => {
        new Metadata({} as any);
      }).toThrow();
    });

    it("adds proper Metadata properties", () => {
      const metadata = new Metadata(
        {
          clipCid: "clipCid",
          name: "name",
          description: "description",
          metadataCid: "metadataCid",
          tokenId: "tokenId",
          contentHash: "hash",
          thumbnailUri: "thumbnailUri",
          owner: "owner",
          currentBids: null,
        },
        "gateway.foo.com"
      );

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
        contentHash: "hash",
        thumbnailUri: "thumbnailUri",
        owner: "owner",
        reserveAuction: [
          {
            id: "id",
            tokenId: "tokenId",
            status: ReserveAuctionStatus.Pending,
            approved: false,
            duration: "3600",
            reservePrice: "0",
            tokenOwner: { id: "owner" },
            auctionCurrency: {
              id: "id",
              name: "money",
              symbol: "M",
            },
            transactionHash: "hash",
          },
        ],
      });

      expect(model.metadataForMarketplace.length).toEqual(0);
    });
  });

  describe("displayAuctionStatus", () => {
    const nowMinusTwoHours = (Math.floor(Date.now() / 1000) - 7200).toString();
    const nowMinusOneHour = (Math.floor(Date.now() / 1000) - 3600).toString();

    it("pending", () => {
      const displayAuctionStatus = new DisplayAuctionStatus({
        firstBidTime: "0",
        expectedEndTimestamp: null,
        previousHighestBid: {
          displayAmount: "",
          symbol: "ETH",
        },
        status: ReserveAuctionStatus.Pending,
      } as Auction);
      expect(displayAuctionStatus).toEqual({
        title: DisplayAuctionStatusTitle.NOT_APPROVED,
        value: "",
      });
    });

    it("active but no bids yet", () => {
      const displayAuctionStatus = new DisplayAuctionStatus({
        firstBidTime: "0",
        expectedEndTimestamp: null,
        previousHighestBid: {
          displayAmount: "",
          symbol: "ETH",
        },
        status: ReserveAuctionStatus.Active,
      } as Auction);
      expect(displayAuctionStatus).toEqual({
        title: DisplayAuctionStatusTitle.READY,
        value: "",
      });
    });

    it("active but not ended in contract. just time run out", () => {
      const displayAuctionStatus = new DisplayAuctionStatus({
        firstBidTime: nowMinusTwoHours,
        expectedEndTimestamp: nowMinusOneHour, // ended an hour ago
        previousHighestBid: {
          displayAmount: "1",
          symbol: "ETH",
        },
        status: ReserveAuctionStatus.Active,
      } as Auction);
      expect(displayAuctionStatus).toEqual({
        title: DisplayAuctionStatusTitle.ENDED,
        value: "",
      });
    });

    it("active with remaining time", () => {
      const nowMinusTwoHours = (Math.floor(Date.now() / 1000) - 7200).toString();
      const nowPlusOneHour = (Math.floor(Date.now() / 1000) + 3600).toString();

      const displayAuctionStatus = new DisplayAuctionStatus({
        firstBidTime: nowMinusTwoHours,
        expectedEndTimestamp: nowPlusOneHour, // ends in hour
        previousHighestBid: {
          displayAmount: "1",
          symbol: "ETH",
        },
        status: ReserveAuctionStatus.Active,
      } as Auction);
      expect(displayAuctionStatus).toEqual({
        title: DisplayAuctionStatusTitle.ENDS_IN,
        value: "0d 01h 00m 00s",
      });
    });

    it("canceled", () => {
      const displayAuctionStatus = new DisplayAuctionStatus({
        firstBidTime: "0",
        expectedEndTimestamp: null,
        previousHighestBid: {
          displayAmount: "",
          symbol: "ETH",
        },
        status: ReserveAuctionStatus.Canceled,
      } as Auction);
      expect(displayAuctionStatus).toEqual({
        title: DisplayAuctionStatusTitle.EMPTY,
        value: "",
      });
    });

    it("finished", () => {
      const displayAuctionStatus = new DisplayAuctionStatus({
        firstBidTime: nowMinusTwoHours,
        expectedEndTimestamp: nowMinusOneHour,
        previousHighestBid: {
          displayAmount: "1",
          symbol: "ETH",
        },
        status: ReserveAuctionStatus.Finished,
      } as Auction);
      expect(displayAuctionStatus).toEqual({
        title: DisplayAuctionStatusTitle.SOLD,
        value: "1 ETH",
      });
    });
  });
});
