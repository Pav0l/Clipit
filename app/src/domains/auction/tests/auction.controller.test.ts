/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { utils } from "ethers";
import { initSynchronousWithTestClients } from "../../../../tests/init-tests";
import { auctionPartialFragment } from "../../../../tests/__fixtures__/auction-fragment";
import { txHash } from "../../../../tests/__fixtures__/ethereum";
import { AuctionContractErrors } from "../../../lib/contracts/AuctionHouse/auction-contract.errors";
import { RpcErrors, RpcErrorForTests } from "../../../lib/ethereum/rpc.errors";
import { AppModel } from "../../app/app.model";
import { AuctionController } from "../auction.controller";
import { AuctionBidLoadStatus, AuctionCancelLoadStatus, AuctionEndLoadStatus, AuctionErrors } from "../auction.model";

describe("aution controller", function () {
  let model: AppModel;
  let auction: AuctionController;
  let createAuctionMock: jest.SpyInstance;
  let endAuctionMock: jest.SpyInstance;
  let cancelAuctionMock: jest.SpyInstance;
  let bidOnAuctionMock: jest.SpyInstance;

  const ONE_ETHER = utils.parseEther("1");
  const ONE_DAY = 86400; //in seconds

  beforeEach(async () => {
    const init = initSynchronousWithTestClients(CONFIG);
    model = init.model;
    auction = init.operations.auction;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const auctionContract = auction.auctionContract;
    createAuctionMock = jest.spyOn(auctionContract, "createAuction");
    endAuctionMock = jest.spyOn(auctionContract, "endAuction");
    cancelAuctionMock = jest.spyOn(auctionContract, "cancelAuction");
    bidOnAuctionMock = jest.spyOn(auctionContract, "createBid");
  });

  afterEach(() => {
    createAuctionMock.mockRestore();
    endAuctionMock.mockRestore();
    cancelAuctionMock.mockRestore();
    bidOnAuctionMock.mockRestore();
  });

  it("createAuction: creates auction transaction", async () => {
    await auction.createAuction(auctionPartialFragment.tokenId, ONE_DAY, ONE_ETHER);

    expect(model.auction.createAuctionTxHash).toEqual(txHash);
    expect(model.auction.auctionLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
  });

  it("createAuction: user rejects tx", async () => {
    createAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", RpcErrors.USER_REJECTED_REQUEST);
    });

    await auction.createAuction(auctionPartialFragment.tokenId, ONE_DAY, ONE_ETHER);

    expect(model.auction.createAuctionTxHash).toEqual(undefined);
    expect(model.auction.auctionLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_CREATE_REJECTED);
    expect(model.snackbar.message?.severity).toEqual("info");
  });

  it("createAuction: invalid curator fee", async () => {
    createAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.INVALID_CURATOR_FEE, RpcErrors.INTERNAL_ERROR);
    });

    await auction.createAuction(auctionPartialFragment.tokenId, ONE_DAY, ONE_ETHER);

    expect(model.auction.createAuctionTxHash).toEqual(undefined);
    expect(model.auction.auctionLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.INVALID_CURATOR_FEE_USER_ERR);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("createAuction: user not allowed to create auction", async () => {
    createAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.NOT_ALLOWED_TO_CREATE_AUCTION, RpcErrors.INTERNAL_ERROR);
    });

    await auction.createAuction(auctionPartialFragment.tokenId, ONE_DAY, ONE_ETHER);

    expect(model.auction.createAuctionTxHash).toEqual(undefined);
    expect(model.auction.auctionLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.NOT_APPROVED_TO_AUCTION);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("createAuction: generic rpc eror", async () => {
    createAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", 999);
    });

    await auction.createAuction(auctionPartialFragment.tokenId, ONE_DAY, ONE_ETHER);

    expect(model.auction.createAuctionTxHash).toEqual(undefined);
    expect(model.auction.auctionLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_CREATE_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("createAuction: unknown tx error", async () => {
    createAuctionMock.mockImplementation(() => {
      throw new Error("wat?");
    });

    await auction.createAuction(auctionPartialFragment.tokenId, ONE_DAY, ONE_ETHER);

    expect(model.auction.createAuctionTxHash).toEqual(undefined);
    expect(model.auction.auctionLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error?.message).toEqual(AuctionErrors.AUCTION_CREATE_FAILED);
    expect(model.snackbar.open).toEqual(false);
  });

  it("endAuction: ends auction", async () => {
    await auction.endAuction(auctionPartialFragment.id);

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionEndLoadStatus.AUCTION_END_SUCCESS);
    expect(model.snackbar.message?.severity).toEqual("success");
  });

  it("endAuction: user rejects tx", async () => {
    endAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", RpcErrors.USER_REJECTED_REQUEST);
    });

    await auction.endAuction(auctionPartialFragment.id);

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_END_REJECTED);
    expect(model.snackbar.message?.severity).toEqual("info");
  });

  it("endAuction: auction does not exist", async () => {
    endAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_DOES_NOT_EXIST, RpcErrors.INTERNAL_ERROR);
    });

    await auction.endAuction("xxx");

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_DOES_NOT_EXIST);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("endAuction: auction has not started", async () => {
    endAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_END_HAS_NOT_STARTED, RpcErrors.INTERNAL_ERROR);
    });

    await auction.endAuction(auctionPartialFragment.id);

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_END_HAS_NOT_STARTED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("endAuction: auction has not completed yet", async () => {
    endAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_END_HAS_NOT_COMPLETED, RpcErrors.INTERNAL_ERROR);
    });

    await auction.endAuction(auctionPartialFragment.id);

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_END_HAS_NOT_COMPLETED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("endAuction: generic rpc eror", async () => {
    endAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", 999);
    });

    await auction.endAuction(auctionPartialFragment.id);

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_END_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("endAuction: unknown tx error", async () => {
    endAuctionMock.mockImplementation(() => {
      throw new Error("wat?");
    });

    await auction.endAuction(auctionPartialFragment.id);

    expect(model.auction.auctionEndLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_END_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("cancelAuction: cancels auction", async () => {
    await auction.cancelAuction(auctionPartialFragment.id);

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionCancelLoadStatus.AUCTION_CANCEL_SUCCESS);
    expect(model.snackbar.message?.severity).toEqual("success");
  });

  it("cancelAuction: user rejects tx", async () => {
    cancelAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", RpcErrors.USER_REJECTED_REQUEST);
    });

    await auction.cancelAuction(auctionPartialFragment.id);

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_CANCEL_REJECTED);
    expect(model.snackbar.message?.severity).toEqual("info");
  });

  it("cancelAuction: auction does not exist", async () => {
    cancelAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_DOES_NOT_EXIST, RpcErrors.INTERNAL_ERROR);
    });

    await auction.cancelAuction("xxx");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_DOES_NOT_EXIST);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("cancelAuction: caller is not auction owner/curator", async () => {
    cancelAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_CANCEL_INVALID_CALLER, RpcErrors.INTERNAL_ERROR);
    });

    await auction.cancelAuction(auctionPartialFragment.id);

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_CANCEL_INVALID_CALLER);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("cancelAuction: can not cancel active auction", async () => {
    cancelAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_CANCEL_RUNNING, RpcErrors.INTERNAL_ERROR);
    });

    await auction.cancelAuction(auctionPartialFragment.id);

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_CANCEL_RUNNING);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("cancelAuction: generic rpc eror", async () => {
    cancelAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", 999);
    });

    await auction.cancelAuction(auctionPartialFragment.id);

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_CANCEL_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("cancelAuction: unknown tx error", async () => {
    cancelAuctionMock.mockImplementation(() => {
      throw new Error("wat?");
    });

    await auction.cancelAuction(auctionPartialFragment.id);

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_CANCEL_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: creates a bid on auction", async () => {
    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionBidLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionBidLoadStatus.AUCTION_BID_SUCCESS);
    expect(model.snackbar.message?.severity).toEqual("success");
  });

  it("bidOnAuction: user rejects tx", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", RpcErrors.USER_REJECTED_REQUEST);
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_BID_REJECTED);
    expect(model.snackbar.message?.severity).toEqual("info");
  });

  it("bidOnAuction: auction does not exist", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_DOES_NOT_EXIST, RpcErrors.INTERNAL_ERROR);
    });

    await auction.bidOnAuction("xxx", "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_DOES_NOT_EXIST);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: auction is not active yet", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_NOT_APPROVED, RpcErrors.INTERNAL_ERROR);
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_NOT_STARTED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: auction expired", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_EXPIRED, RpcErrors.INTERNAL_ERROR);
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.AUCTION_EXPIRED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: too low bid - reserve price not met", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_BID_LOWER_THAN_RESERVE_PRICE, RpcErrors.INTERNAL_ERROR);
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.BID_NOT_HIGH_ENOUGH);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: too low bid - not sufficient increase compared to last bid", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests(AuctionContractErrors.AUCTION_BID_LOWER_THAN_PREVIOUS_BID, RpcErrors.INTERNAL_ERROR);
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionContractErrors.BID_NOT_HIGH_ENOUGH);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: generic rpc eror", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new RpcErrorForTests("", 999);
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_BID_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("bidOnAuction: unknown tx error", async () => {
    bidOnAuctionMock.mockImplementation(() => {
      throw new Error("wat?");
    });

    await auction.bidOnAuction(auctionPartialFragment.id, "1");

    expect(model.auction.auctionCancelLoadStatus).toEqual(undefined);
    expect(model.auction.meta.isLoading).toEqual(false);
    expect(model.auction.meta.error).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(AuctionErrors.AUCTION_BID_FAILED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });
});
