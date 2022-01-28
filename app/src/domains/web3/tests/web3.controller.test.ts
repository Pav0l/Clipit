/* eslint-disable @typescript-eslint/ban-ts-comment */
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { twitchClip } from "../../../../tests/__fixtures__/twitch-api-data";
import { ClipItApiTestClient } from "../../../lib/clipit-api/clipit-api-test.client";
import { AuctionTestContractCreator } from "../../../lib/contracts/AuctionHouse/auction-contract-test.client";
import { ClipItTestContractCreator } from "../../../lib/contracts/ClipIt/clipit-contract-test.client";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { SubgraphTestClient } from "../../../lib/graphql/subgraph-test.client";
import { IpfsTestClient } from "../../../lib/ipfs/ipfs-test.client";
import { OffChainStorage } from "../../../lib/off-chain-storage/off-chain-storage.client";
import { MetaModel } from "../../app/meta.model";
import { SnackbarController } from "../../snackbar/snackbar.controller";
import { SnackbarModel } from "../../snackbar/snackbar.model";
import { Web3Controller } from "../web3.controller";
import { Web3Errors, Web3Model } from "../web3.model";

describe("web3 controller", () => {
  let model: Web3Model;
  let ctrl: Web3Controller;
  let snackModel: SnackbarModel;
  let snackbar: SnackbarController;

  beforeEach(() => {
    model = new Web3Model(new MetaModel());
    snackModel = new SnackbarModel();
    snackbar = new SnackbarController(snackModel);
    ctrl = new Web3Controller(
      model,
      new OffChainStorage(new ClipItApiTestClient(), new IpfsTestClient()),
      new SubgraphTestClient(),
      snackbar,
      ClipItTestContractCreator,
      AuctionTestContractCreator,
      CONFIG
    );
  });

  describe("without ethereum provider", () => {
    beforeEach(() => {
      expect(model.isMetaMaskInstalled()).toEqual(false);
    });

    it("connectMetaMaskIfNecessaryForConnectBtn does nothing without eth provider", () => {
      expect(ctrl.connectMetaMaskIfNecessaryForConnectBtn()).resolves;
      expect(model.accounts).toEqual([]);
    });

    it("requestConnect sets INSTALL_METAMASK error", () => {
      expect(ctrl.requestConnect()).resolves;
      expect(model.meta.hasError).toEqual(true);
      expect(model.meta.error).toEqual(Web3Errors.INSTALL_METAMASK);
    });

    it("requestConnectAndMint displays INSTALL_METAMASK snack info", () => {
      expect(ctrl.requestConnectAndMint("", "", "", "")).resolves;
      expect(snackModel.open).toEqual(true);
      expect(snackModel.message?.text).toEqual(Web3Errors.INSTALL_METAMASK);
      expect(snackModel.message?.severity).toEqual("info");
    });
  });

  describe("with ethereum provider", () => {
    // TODO replace this
    const { location } = window;
    beforeAll(() => {
      // @ts-ignore
      delete window.location;
      // @ts-ignore
      window.location = { assign: jest.fn(), origin: "http://localhost" };
    });
    afterAll(() => {
      window.location = location;
    });

    beforeEach(() => {
      // create eth provider on window object like a wallet extension would
      window.ethereum = new EthereumTestProvider();

      expect(model.isMetaMaskInstalled()).toEqual(true);
    });

    afterEach(() => {
      delete window.ethereum;
    });

    it("connectMetaMaskIfNecessaryForConnectBtn asks for users address", async () => {
      await ctrl.connectMetaMaskIfNecessaryForConnectBtn();
      expect(model.accounts).toEqual([signerAddress]);
    });

    it("connectMetaMaskIfNecessaryForConnectBtn does not overwrite already existing account", async () => {
      model.setAccounts(["foo"]);

      // if this would call eth_accounts, it would return [signerAddress] fixture
      await ctrl.connectMetaMaskIfNecessaryForConnectBtn();

      expect(model.accounts).toEqual(["foo"]);
    });

    it("requestConnect does not overwrite already existing account", async () => {
      model.setAccounts(["foo"]);

      // if this would call eth_accounts, it would return [signerAddress] fixture
      await ctrl.requestConnect();

      expect(model.accounts).toEqual(["foo"]);
    });

    it("requestConnect requests user to connect account", async () => {
      await ctrl.requestConnect();
      expect(model.accounts).toEqual([signerAddress]);
      expect(model.meta.isLoading).toEqual(false);
      expect(model.meta.hasError).toEqual(false);
    });

    it("requestConnect requests user to connect account and then calls provided function with account address", async () => {
      async function assertAccount(address: string) {
        expect(address).toEqual(signerAddress);
      }

      await ctrl.requestConnect(assertAccount);
      expect(model.accounts).toEqual([signerAddress]);
      expect(model.meta.isLoading).toEqual(false);
      expect(model.meta.hasError).toEqual(false);
    });

    it("requestConnectAndMint: invalid clipId => shows snackbar error", async () => {
      // invalid clipId
      await ctrl.requestConnectAndMint("", "xx", "xx", "xx");
      expect(snackModel.open).toEqual(true);
      expect(snackModel.message?.text).toEqual(Web3Errors.SOMETHING_WENT_WRONG);
      expect(snackModel.message?.severity).toEqual("error");
    });

    it("requestConnectAndMint: invalid clipTitle => shows snackbar error", async () => {
      // invalid clipTitle
      await ctrl.requestConnectAndMint("xx", "xx", "", "xx");
      expect(snackModel.open).toEqual(true);
      expect(snackModel.message?.text).toEqual(Web3Errors.SOMETHING_WENT_WRONG);
      expect(snackModel.message?.severity).toEqual("error");
    });

    it("requestConnectAndMint: creates the NFT and redirects to it", async () => {
      await ctrl.requestConnectAndMint(twitchClip.id, "5", twitchClip.title, "");
      expect(window.location.assign).toHaveBeenCalledWith("http://localhost/nfts/1");
    });
  });
});
