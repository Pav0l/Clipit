import { initTestSync } from "../../../../tests/init-tests";
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { MintModel } from "../../mint/mint.model";
import { SnackbarModel } from "../../snackbar/snackbar.model";
import { Web3Controller } from "../web3.controller";
import { Web3Errors, Web3Model } from "../web3.model";

describe("web3 controller", () => {
  let model: Web3Model;
  let ctrl: Web3Controller;
  let snackModel: SnackbarModel;
  let mintModel: MintModel;

  beforeEach(() => {
    const init = initTestSync(CONFIG);
    model = init.model.web3;
    mintModel = init.model.mint;
    snackModel = init.model.snackbar;
    ctrl = init.operations.web3;
  });

  describe("without ethereum provider", () => {
    beforeEach(() => {
      expect(model.isMetaMaskInstalled()).toEqual(false);
    });

    it("requestEthAccounts does nothing without eth provider", () => {
      expect(ctrl.requestEthAccounts()).resolves;
      expect(model.accounts).toEqual([]);
    });

    it("requestConnect sets INSTALL_METAMASK error", () => {
      expect(ctrl.requestConnect()).resolves;
      expect(model.meta.error).not.toEqual(undefined);
      expect(model.meta.error?.message).toEqual(Web3Errors.INSTALL_METAMASK);
    });
  });

  describe("with ethereum provider", () => {
    beforeEach(() => {
      // create eth provider on window object like a wallet extension would
      window.ethereum = new EthereumTestProvider();

      expect(model.isMetaMaskInstalled()).toEqual(true);
    });

    afterEach(() => {
      delete window.ethereum;
    });

    it("requestEthAccounts asks for users address", async () => {
      await ctrl.requestEthAccounts();
      expect(model.accounts).toEqual([signerAddress]);
    });

    it("requestEthAccounts does not overwrite already existing account", async () => {
      model.setAccounts(["foo"]);

      // if this would call eth_accounts, it would return [signerAddress] fixture
      await ctrl.requestEthAccounts();

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
      expect(model.meta.error).toEqual(undefined);
    });

    it("requestConnect requests user to connect account and then calls provided function with account address", async () => {
      async function assertAccount(address: string) {
        expect(address).toEqual(signerAddress);
      }

      await ctrl.requestConnect(assertAccount);
      expect(model.accounts).toEqual([signerAddress]);
      expect(model.meta.isLoading).toEqual(false);
      expect(model.meta.error).toEqual(undefined);
    });
  });
});
