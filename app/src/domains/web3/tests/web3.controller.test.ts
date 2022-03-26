import { initSynchronousWithTestClients } from "../../../../tests/init-tests";
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { RpcErrors, RpcErrorForTests } from "../../../lib/ethereum/rpc.errors";
import { AppModel } from "../../app/app.model";
import { Web3Controller } from "../web3.controller";
import { Web3Errors } from "../web3.model";

describe("web3 controller", () => {
  let model: AppModel;
  let ctrl: Web3Controller;
  let requestAccountsMock: jest.SpyInstance;

  beforeEach(() => {
    const init = initSynchronousWithTestClients(CONFIG);
    model = init.model;
    ctrl = init.operations.web3;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ethProvider = ctrl.ethereum;
    requestAccountsMock = jest.spyOn(ethProvider, "requestAccounts");
  });

  afterEach(() => {
    requestAccountsMock.mockRestore();
  });

  describe("without ethereum provider", () => {
    beforeEach(() => {
      expect(model.web3.isMetaMaskInstalled()).toEqual(false);
    });

    it("requestEthAccounts does nothing without eth provider", () => {
      expect(ctrl.requestEthAccounts()).resolves;
      expect(model.web3.accounts).toEqual([]);
    });

    it("requestConnect sets INSTALL_METAMASK error", () => {
      expect(ctrl.requestConnect()).resolves;
      expect(model.web3.meta.error?.message).toEqual(Web3Errors.INSTALL_METAMASK);
    });

    it("requestConnectIfProviderExist sets INSTALL_METAMASK snackbar", () => {
      expect(ctrl.requestConnectIfProviderExist()).resolves;
      expect(model.web3.meta.error).toEqual(undefined);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.INSTALL_METAMASK);
      expect(model.snackbar.message?.severity).toEqual("info");
    });
  });

  describe("with ethereum provider", () => {
    beforeEach(() => {
      // create eth provider on window object like a wallet extension would
      window.ethereum = new EthereumTestProvider();
      expect(model.web3.isMetaMaskInstalled()).toEqual(true);
    });

    afterEach(() => {
      delete window.ethereum;
      expect(model.web3.isMetaMaskInstalled()).toEqual(false);
    });

    it("requestEthAccounts asks for users address", async () => {
      await ctrl.requestEthAccounts();
      expect(model.web3.accounts).toEqual([signerAddress]);
    });

    it("requestEthAccounts does not overwrite already existing account", async () => {
      model.web3.setAccounts(["foo"]);

      // if this would call eth_accounts, it would return [signerAddress] fixture
      await ctrl.requestEthAccounts();

      expect(model.web3.accounts).toEqual(["foo"]);
    });

    it("requestConnect does not overwrite already existing account", async () => {
      model.web3.setAccounts(["foo"]);

      // if this would call eth_accounts, it would return [signerAddress] fixture
      await ctrl.requestConnect();

      expect(model.web3.accounts).toEqual(["foo"]);
    });

    it("requestConnect requests user to connect account", async () => {
      await ctrl.requestConnect();
      expect(model.web3.accounts).toEqual([signerAddress]);
      expect(model.web3.meta.isLoading).toEqual(false);
      expect(model.web3.meta.error).toEqual(undefined);
    });

    it("requestConnect: handles unknown errors", async () => {
      requestAccountsMock.mockImplementation(() => {
        throw new Error("waat");
      });

      await ctrl.requestConnect();
      expect(model.web3.accounts).toEqual([]);
      expect(model.web3.meta.error?.message).toEqual(Web3Errors.CONNECT_METAMASK);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.SOMETHING_WENT_WRONG);
      expect(model.snackbar.message?.severity).toEqual("error");
    });

    it("requestConnect: request to connect already pending", async () => {
      requestAccountsMock.mockImplementation(() => {
        throw new RpcErrorForTests("", RpcErrors.REQUEST_ALREADY_PENDING);
      });

      await ctrl.requestConnect();
      expect(model.web3.accounts).toEqual([]);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.REQUEST_ALREADY_PENDING);
      expect(model.snackbar.message?.severity).toEqual("info");
    });

    it("requestConnect: user rejected request", async () => {
      requestAccountsMock.mockImplementation(() => {
        throw new RpcErrorForTests("", RpcErrors.USER_REJECTED_REQUEST);
      });

      await ctrl.requestConnect();
      expect(model.web3.accounts).toEqual([]);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.REQUEST_REJECTED);
      expect(model.snackbar.message?.severity).toEqual("info");
    });

    it("requestConnect: unexpected RPC error handled", async () => {
      requestAccountsMock.mockImplementation(() => {
        throw new RpcErrorForTests("", 999);
      });

      await ctrl.requestConnect();
      expect(model.web3.accounts).toEqual([]);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.CONNECT_METAMASK);
      expect(model.snackbar.message?.severity).toEqual("error");
    });

    it("requestConnectIfProviderExist requests user to connect account", async () => {
      await ctrl.requestConnectIfProviderExist();
      expect(model.web3.accounts).toEqual([signerAddress]);
      expect(model.web3.meta.isLoading).toEqual(false);
      expect(model.web3.meta.error).toEqual(undefined);
    });

    it("requestConnectIfProviderExist does not overwrite already existing account", async () => {
      model.web3.setAccounts(["foo"]);

      // if this would call eth_accounts, it would return [signerAddress] fixture
      await ctrl.requestConnectIfProviderExist();

      expect(model.web3.accounts).toEqual(["foo"]);
    });

    it("requestConnectIfProviderExist: handles unknown errors", async () => {
      requestAccountsMock.mockImplementation(() => {
        throw new Error("waat");
      });

      await ctrl.requestConnectIfProviderExist();
      expect(model.web3.accounts).toEqual([]);
      expect(model.web3.meta.error).toEqual(undefined);
      expect(model.snackbar.open).toEqual(true);
      expect(model.snackbar.message?.text).toEqual(Web3Errors.SOMETHING_WENT_WRONG);
      expect(model.snackbar.message?.severity).toEqual("error");
    });
  });
});
