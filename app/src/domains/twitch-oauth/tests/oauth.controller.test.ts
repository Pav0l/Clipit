/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LocalStorageTestClient } from "../../../lib/local-storage/local-storage-test.client";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";
import { initTestSync } from "../../../../tests/init-tests";

describe("oauth controller", () => {
  let model: OAuthModel;
  let ctrl: OAuthController;
  let ls: LocalStorageTestClient;

  // TODO replace this
  const { location } = window;
  beforeAll(() => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { reload: jest.fn() };
  });
  afterAll(() => {
    window.location = location;
  });

  beforeEach(() => {
    const init = initTestSync(CONFIG);
    model = init.model.auth;
    ls = init.localStorage;
    ctrl = init.operations.auth;
  });

  it("logout: removes token", async () => {
    // user logged in -> token in storage
    ls.setItem(CONFIG.twitch.accessToken, "secret");
    expect(ls.getItem(CONFIG.twitch.accessToken)).toEqual("secret");

    await ctrl.logout();

    expect(ls.getItem(CONFIG.twitch.accessToken)).toEqual(null);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("logout: token does not exist -> just reload", async () => {
    await ctrl.logout();
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("checkTokenInStorage: set auth flag in app state if token exist", async () => {
    // user logged in -> token in storage
    ls.setItem(CONFIG.twitch.accessToken, "secret");
    expect(ls.getItem(CONFIG.twitch.accessToken)).toEqual("secret");

    expect(model.isLoggedIn).toEqual(false);

    ctrl.checkTokenInStorage();

    expect(model.isLoggedIn).toEqual(true);
  });

  describe("handleOAuth2Redirect", () => {
    let state: string;
    const secret = "top_secret_secret";

    beforeEach(() => {
      ls.setItem(CONFIG.twitch.secretKey, secret);

      state = JSON.stringify({ referrer: "/path", secret: secret });
    });

    it("does nothing on missing access_token in url", async () => {
      expect(model.isLoggedIn).toEqual(false);
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#state=${state}`));
      expect(model.isLoggedIn).toEqual(false);
    });

    it("shows error on malformed state", async () => {
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#access_token=TOKEN&state=NOT-A-JSON`));
      expect(model.meta.hasError).toEqual(true);
    });

    it("shows error on different secret", async () => {
      const differentState = JSON.stringify({
        referrer: "/path",
        secret: "different_secret",
      });
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#access_token=TOKEN&state=${differentState}`));
      expect(model.meta.hasError).toEqual(true);
    });

    it("cleans up secret, stores token and updates state properly if url is correct", async () => {
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#access_token=TOKEN&state=${state}`));

      expect(model.referrer).toEqual("/path");
      expect(model.isLoggedIn).toEqual(true);
      expect(ls.getItem(CONFIG.twitch.secretKey)).toBeNull();
      expect(ls.getItem(CONFIG.twitch.accessToken)).toEqual("TOKEN");
    });
  });
});
