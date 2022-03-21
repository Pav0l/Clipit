/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initTestSync } from "../../../../tests/init-tests";
import { txHash } from "../../../../tests/__fixtures__/ethereum";
import { twitchClip } from "../../../../tests/__fixtures__/twitch-api-data";
import { ClipItApiTestClient } from "../../../lib/clipit-api/clipit-api-test.client";
import { ClipItApiErrors } from "../../../lib/clipit-api/clipit-api.client";
import { AppModel } from "../../app/app.model";
import { TwitchClip } from "../../twitch-clips/clip.model";
import { MintController } from "../mint.controller";
import { MintErrors } from "../mint.model";

describe("mint controller", function () {
  let model: AppModel;
  let mint: MintController;
  let clip: TwitchClip;
  let clipitApi: ClipItApiTestClient;

  beforeEach(async () => {
    const init = initTestSync(CONFIG);
    model = init.model;
    mint = init.operations.mint;
    clipitApi = init.clipitApi;

    const clipId = twitchClip.id;
    await init.operations.clip.getClip(clipId);
    clip = init.model.clip.getClip(clipId)!;
  });

  // TODO
  // handles failed mint request (declined by user, contract errors, unknown errors, ...)
  // loaders

  it("prepares metadata and clip and emits the mint transaction", async () => {
    await mint.prepareMetadataAndMintClip(clip.id, {
      address: "address",
      creatorShare: "10",
      clipTitle: "nft title",
      clipDescription: "desc",
    });
    expect(model.mint.mintTxHash).toEqual(txHash);
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
});
