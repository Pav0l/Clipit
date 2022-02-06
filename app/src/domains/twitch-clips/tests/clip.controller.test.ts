import { TwitchApiTestClient } from "../../../lib/twitch-api/twitch-api-test.client";
import { MetaModel } from "../../app/meta.model";
import { SnackbarController } from "../../snackbar/snackbar.controller";
import { SnackbarModel } from "../../snackbar/snackbar.model";
import { ClipController } from "../clip.controller";
import { ClipModel } from "../clip.model";

describe("clip controller", () => {
  let ctrl: ClipController;
  let model: ClipModel;

  beforeEach(() => {
    model = new ClipModel(new MetaModel());
    ctrl = new ClipController(model, new SnackbarController(new SnackbarModel()), new TwitchApiTestClient());
  });

  it("really dumb test just to make a POC on TwitchApiTestClient", async () => {
    await ctrl.getBroadcasterClips("some-id");
    // dummy clips are on state
    expect(model.clips.length).toBeGreaterThan(0);
  });

  it("validates clip url", () => {
    expect(
      ctrl.validateClipUrl("https://www.twitch.tv/streamer/clip/GeorgeousPineappleCautiousVoteYes-Xact8iTQtX3F9VCW")
    ).toEqual("GeorgeousPineappleCautiousVoteYes-Xact8iTQtX3F9VCW");

    expect(ctrl.validateClipUrl("https://clips.twitch.tv/GeorgeousPineappleCautiousVoteYes-Xact8iTQtX3F9VCW")).toEqual(
      "GeorgeousPineappleCautiousVoteYes-Xact8iTQtX3F9VCW"
    );

    expect(ctrl.validateClipUrl("https://foo.tv/GeorgeousPineappleCautiousVoteYes-Xact8iTQtX3F9VCW")).toEqual("");
  });

  it("validates creator share to be an integer between 0-99", () => {
    expect(ctrl.validateCreatorShare("1.0")).toEqual(false);
    expect(ctrl.validateCreatorShare("1,0")).toEqual(false);
    expect(ctrl.validateCreatorShare("0.1")).toEqual(false);
    expect(ctrl.validateCreatorShare("00000.00001")).toEqual(false);
    expect(ctrl.validateCreatorShare("-1")).toEqual(false);
    expect(ctrl.validateCreatorShare("abc")).toEqual(false);
    expect(ctrl.validateCreatorShare("100")).toEqual(false);

    expect(ctrl.validateCreatorShare("")).toEqual(true);
    expect(ctrl.validateCreatorShare("00001")).toEqual(true);
    for (let index = 0; index < 100; index++) {
      expect(ctrl.validateCreatorShare(index.toString())).toEqual(true);
    }
  });
});
