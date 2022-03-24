/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initTestSync } from "../../../../tests/init-tests";
import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";
import { txHash } from "../../../../tests/__fixtures__/ethereum";
import { twitchClip } from "../../../../tests/__fixtures__/twitch-api-data";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { RpcErrors, RpcErrorForTests } from "../../../lib/ethereum/rpc.errors";
import { ClipController } from "../../twitch-clips/clip.controller";
import { TwitchClipsErrors } from "../../twitch-clips/clip.errors";
import { GameController } from "../../twitch-games/game.controller";
import { UserController } from "../../twitch-user/user.controller";
import { Web3Controller } from "../../web3/web3.controller";
import { Web3Errors } from "../../web3/web3.model";
import { AppModel } from "../app.model";
import { UiController } from "../ui.controller";

describe("ui-controller", function () {
  let model: AppModel;
  let ui: UiController;
  let user: UserController;
  let clip: ClipController;
  let game: GameController;
  let web3: Web3Controller;

  const clipId = twitchClip.id;

  beforeEach(async () => {
    // eth provider installed
    window.ethereum = new EthereumTestProvider();

    const app = initTestSync(CONFIG);
    model = app.model;
    ui = app.operations.ui;
    user = app.operations.user;
    game = app.operations.game;
    clip = app.operations.clip;
    web3 = app.operations.web3;
  });

  afterEach(() => {
    window.ethereum = undefined;
  });

  describe("minting clip", function () {
    beforeEach(async () => {
      // first we need to have user, clip & game
      await user.getUser();
      await clip.getClip(clipId);
      await game.getGames(twitchClip.game_id);
    });

    it("mints clip into NFT", async () => {
      await ui.mint(model.clip.getClip(clipId)!, "10", "clip title", "clip description");

      // transaction was created
      expect(model.mint.mintTxHash).toEqual(txHash);
      // route redirected to nft/:id
      expect(model.navigation.activeRoute).toEqual(`/nfts/${clipPartialFragment.id}`);
    });

    it("mint displays snackbar info if no provider installed", () => {
      // eth provider does not exist
      window.ethereum = undefined;

      expect(ui.mint(model.clip.getClip(clipId)!, "10", "clip title", "clip description")).resolves;
      expect(model.mint.mintTxHash).toEqual(undefined);
      expect(model.web3.meta.error).toEqual(undefined);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.INSTALL_METAMASK);
      expect(model.snackbar.message?.severity).toEqual("info");
    });

    it("displays error if user is not clip broadcaster", () => {
      const clip = model.clip.getClip(clipId)!;
      clip.broadcasterId = "other_broadcaster";
      expect(ui.mint(clip, "10", "clip title", "clip description")).resolves;
      expect(model.mint.mintTxHash).toEqual(undefined);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(TwitchClipsErrors.CLIP_DOES_NOT_BELONG_TO_USER);
      expect(model.snackbar.message?.severity).toEqual("error");
    });

    it("displays error if user does not connect wallet", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ethProvider = web3.ethereum;
      const requestAccountsMock = jest.spyOn(ethProvider, "requestAccounts").mockImplementation(() => {
        throw new RpcErrorForTests("", RpcErrors.USER_REJECTED_REQUEST);
      });

      expect(model.web3.accounts).toEqual([]);

      expect(ui.mint(model.clip.getClip(clipId)!, "10", "clip title", "clip description")).resolves;
      expect(model.mint.mintTxHash).toEqual(undefined);
      expect(model.web3.meta.error).toEqual(undefined);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.REQUEST_REJECTED);
      expect(model.snackbar.message?.severity).toEqual("info");

      requestAccountsMock.mockRestore();
    });

    it.skip("failed NFT data fetch for clipId", () => {
      /* TODO */
    });
  });
});
