/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initTestSync } from "../../../../tests/init-tests";
import { txHash } from "../../../../tests/__fixtures__/ethereum";
import { twitchClip } from "../../../../tests/__fixtures__/twitch-api-data";
import { ClipItApiTestClient } from "../../../lib/clipit-api/clipit-api-test.client";
import { ClipItApiErrors } from "../../../lib/clipit-api/clipit-api.client";
import { IClipItContractClient } from "../../../lib/contracts/ClipIt/clipit-contract.client";
import { ClipItContractErrors } from "../../../lib/contracts/ClipIt/clipit-contract.errors";
import { RpcErrors, TEST_RpcErrorGenerator } from "../../../lib/ethereum/rpc.errors";
import { AppModel } from "../../app/app.model";
import { TwitchClip } from "../../twitch-clips/clip.model";
import { MintController } from "../mint.controller";
import { MintErrors } from "../mint.model";

describe("mint controller", function () {
  let model: AppModel;
  let mint: MintController;
  let clip: TwitchClip;
  let clipitApi: ClipItApiTestClient;
  let clipitContract: IClipItContractClient;
  let contractMintMock: jest.SpyInstance;

  beforeEach(async () => {
    const init = initTestSync(CONFIG);
    model = init.model;
    mint = init.operations.mint;
    clipitApi = init.clipitApi;

    const clipId = twitchClip.id;
    await init.operations.clip.getClip(clipId);
    clip = init.model.clip.getClip(clipId)!;

    // @ts-ignore `contract` is private property of mint object -> TS no like
    clipitContract = mint.contract;
    contractMintMock = jest.spyOn(clipitContract, "mint");
  });

  afterEach(() => {
    contractMintMock.mockRestore();
  });

  it("prepares metadata and clip and emits the mint transaction", async () => {
    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "nft title",
      clipDescription: "desc",
    });
    expect(model.mint.mintTxHash).toEqual(txHash);
    expect(model.mint.mintStatus).toEqual(undefined);
    expect(model.mint.meta.isLoading).toEqual(false);
  });

  it("invalid clipId => shows snackbar error", async () => {
    await mint.prepareMetadataAndMintClip("", {
      address: "address",
      creatorShare: "10",
      clipTitle: "title",
      clipDescription: "desc",
    });
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.SOMETHING_WENT_WRONG);
    expect(model.snackbar.message?.severity).toEqual("error");
    expect(model.mint.mintStatus).toEqual(undefined);
    expect(model.mint.meta.isLoading).toEqual(false);
  });

  it("invalid clipTitle => shows snackbar error", async () => {
    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "",
      clipDescription: "desc",
    });
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.SOMETHING_WENT_WRONG);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("invalid address => shows snackbar error", async () => {
    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.SOMETHING_WENT_WRONG);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("403 - not broadcaster error shows snackbar notif", async () => {
    clipitApi.mockResponse(false, () => ({
      statusCode: 403,
      statusOk: false,
      body: {
        error: ClipItApiErrors.NOT_BROADCASTER,
      },
    }));

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(ClipItApiErrors.DISPLAY_NOT_BROADCASTER);
    expect(model.snackbar.message?.severity).toEqual("error");
    expect(model.mint.mintStatus).toEqual(undefined);
    expect(model.mint.meta.isLoading).toEqual(false);
  });

  it("generic response from clipit API shows snackbar notif", async () => {
    clipitApi.mockResponse(false);

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.SOMETHING_WENT_WRONG);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("generic error shows snackbar notif", async () => {
    clipitApi.mockResponse(false, () => ({
      statusCode: 500,
    }));

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.SOMETHING_WENT_WRONG);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("rpc error: token already minted", async () => {
    contractMintMock.mockImplementation(() => {
      throw new TEST_RpcErrorGenerator(ClipItContractErrors.CLIPIT_TOKEN_EXIST, RpcErrors.INTERNAL_ERROR);
    });

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });

    expect(contractMintMock).toHaveBeenCalledTimes(1);
    expect(model.mint.mintTxHash).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(ClipItContractErrors.TOKEN_ALREADY_MINTED);
    expect(model.snackbar.message?.severity).toEqual("error");
    expect(model.mint.mintStatus).toEqual(undefined);
    expect(model.mint.meta.isLoading).toEqual(false);
  });

  it("rpc error: invalid address trying to mint", async () => {
    contractMintMock.mockImplementation(() => {
      throw new TEST_RpcErrorGenerator(ClipItContractErrors.CLIPIT_INVALID_ADDRESS, RpcErrors.INTERNAL_ERROR);
    });

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });

    expect(contractMintMock).toHaveBeenCalledTimes(1);
    expect(model.mint.mintTxHash).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(ClipItContractErrors.ADDRESS_NOT_ALLOWED);
    expect(model.snackbar.message?.severity).toEqual("error");
  });

  it("rpc error: user rejected mint", async () => {
    contractMintMock.mockImplementation(() => {
      throw new TEST_RpcErrorGenerator("", RpcErrors.USER_REJECTED_REQUEST);
    });

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });

    expect(contractMintMock).toHaveBeenCalledTimes(1);
    expect(model.mint.mintTxHash).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.MINT_REJECTED);
    expect(model.snackbar.message?.severity).toEqual("info");
  });

  it("rpc error: unknown rpc error", async () => {
    contractMintMock.mockImplementation(() => {
      throw new TEST_RpcErrorGenerator("", 123456);
    });

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });

    expect(contractMintMock).toHaveBeenCalledTimes(1);
    expect(model.mint.mintTxHash).toEqual(undefined);
    expect(model.snackbar.open).toEqual(true);
    expect(model.snackbar.message?.text).toEqual(MintErrors.SOMETHING_WENT_WRONG);
    expect(model.snackbar.message?.severity).toEqual("error");
    expect(model.mint.mintStatus).toEqual(undefined);
    expect(model.mint.meta.isLoading).toEqual(false);
  });

  it("unknown mint error", async () => {
    contractMintMock.mockImplementation(() => {
      throw new Error("some random error");
    });

    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "hello",
      clipDescription: "desc",
    });

    expect(contractMintMock).toHaveBeenCalledTimes(1);
    expect(model.mint.mintTxHash).toEqual(undefined);
    expect(model.snackbar.open).toEqual(false);
    expect(model.mint.meta.error?.message).toEqual(MintErrors.FAILED_TO_MINT);
    expect(model.mint.mintStatus).toEqual(undefined);
    expect(model.mint.meta.isLoading).toEqual(false);
  });
});
