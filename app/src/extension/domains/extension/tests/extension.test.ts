/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initExtensionTestSync } from "../../../../../tests/init-tests";
import { auctionPartialFragment } from "../../../../../tests/__fixtures__/auction-fragment";
import { clipPartialFragment } from "../../../../../tests/__fixtures__/clip-fragment";
import { twitchClip } from "../../../../../tests/__fixtures__/twitch-api-data";
import { EthereumTestProvider } from "../../../../lib/ethereum/ethereum-test-provider";
import { TwitchExtensionTestClient } from "../../../../lib/twitch-extension/twitch-extension-test.client";
import { initExtAsync } from "../../../init";
import { StreamerUiController } from "../../streamer/streamer-ui.controller";
import { ExtensionModel } from "../extension.model";

describe("extension", function () {
  describe("streamer flow", function () {
    let model: ExtensionModel;
    let twitch: TwitchExtensionTestClient;
    let streamerUiCtrl: StreamerUiController;

    beforeEach(async () => {
      const init = initExtensionTestSync("STREAMER", CONFIG);

      twitch = init.twitch;
      model = init.model;
      streamerUiCtrl = init.operations.streamerUi;

      await initExtAsync({
        model: model,
        web3: init.operations.web3,
        user: init.operations.user,
        streamerUi: init.operations.streamerUi,
        configUi: init.operations.configUi,
        logger: init.logger,
        storage: init.storage,
        twitch: init.twitch,
      });

      twitch.sendAuthorized({
        channelId: twitchClip.broadcaster_id,
        clientId: "extension_clientId",
        token: "token",
        helixToken: "helixToken",
        userId: `U${twitchClip.broadcaster_id}`,
      });
    });

    afterEach(() => {
      window.ethereum = undefined;
    });

    it("happy path of extension works", async () => {
      // at start, we need to install MM
      expect(model.web3.isMetaMaskInstalled()).toEqual(false);
      expect(model.streamerUi.page).toEqual("MISSING_PROVIDER");

      // eth provider installed
      window.ethereum = new EthereumTestProvider();
      expect(model.web3.isMetaMaskInstalled()).toEqual(true);

      // we're still on INSTALL_PROVIDER screen
      expect(model.streamerUi.page).toEqual("MISSING_PROVIDER");

      // and connect it
      await streamerUiCtrl.connectMetamask();
      expect(model.web3.isProviderConnected()).toEqual(true);

      // now we can enter clip URL
      expect(model.streamerUi.page).toEqual("INPUT");
      await streamerUiCtrl.prepareClip(twitchClip.url);

      // we got the clip & game data and moved to Clip page
      expect(model.streamerUi.page).toEqual("CLIP");
      expect(model.streamerUi.clipId).toEqual(twitchClip.id);

      // now we fill out the NFT form and click Mint
      await streamerUiCtrl.mint(model.clip.getClip(twitchClip.id)!, "10", twitchClip.title, "woah");

      // we should be on NFT page
      expect(model.streamerUi.page).toEqual("NFT");
      expect(model.streamerUi.tokenId).toEqual(clipPartialFragment.id);

      // fill out the auction form and submit
      await streamerUiCtrl.createAuction(model.streamerUi.tokenId!, "1", "10");

      // we should be on AUCTION page
      expect(model.streamerUi.page).toEqual("AUCTION");
      expect(model.streamerUi.auctionId).toEqual(auctionPartialFragment.id);
    });

    it("does not leaks window.ethereum across tests", async () => {
      // at start, there should be no MM installed
      expect(model.web3.isMetaMaskInstalled()).toEqual(false);
    });
  });
});
