/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initTestSync } from "../../../../tests/init-tests";
import { twitchClip } from "../../../../tests/__fixtures__/twitch-api-data";
import { AppModel } from "../../app/app.model";
import { TwitchClip } from "../../twitch-clips/clip.model";
import { MintController } from "../mint.controller";
import { MintErrors } from "../mint.model";

describe("mint controller", function () {
  let model: AppModel;
  let mint: MintController;
  let clip: TwitchClip;

  beforeEach(async () => {
    const init = initTestSync(CONFIG);
    model = init.model;
    mint = init.operations.mint;

    const clipId = twitchClip.id;
    await init.operations.clip.getClip(clipId);
    clip = init.model.clip.getClip(clipId)!;
  });

  // TODO
  // handles failed clipit API resp
  // handles failed mint request (declined by user, contract errors, unknown errors, ...)
  // loaders

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
});
