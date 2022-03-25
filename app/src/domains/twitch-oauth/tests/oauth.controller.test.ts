/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LocalStorageTestClient } from "../../../lib/local-storage/local-storage-test.client";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";
import { initTestSync } from "../../../../tests/init-tests";
import { twitchApiAccessTokenKey, twitchOAuthStateSecretKey } from "../../../lib/constants";
import { OAuthErrors } from "../oauth.types";
import { useWindowLocationInTests } from "../../../../tests/setup";

describe("oauth controller", () => {
  let model: OAuthModel;
  let ctrl: OAuthController;
  let ls: LocalStorageTestClient;

  useWindowLocationInTests();

  beforeEach(() => {
    const init = initTestSync(CONFIG);
    model = init.model.auth;
    ls = init.localStorage;
    ctrl = init.operations.auth;
  });

  it("logout: removes token", async () => {
    // user logged in -> token in storage
    ls.setItem(twitchApiAccessTokenKey, "secret");
    expect(ls.getItem(twitchApiAccessTokenKey)).toEqual("secret");

    await ctrl.logout();

    expect(ls.getItem(twitchApiAccessTokenKey)).toEqual(null);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("logout: token does not exist -> just reload", async () => {
    await ctrl.logout();
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("checkTokenInStorage: set auth flag in app state if token exist", async () => {
    // user logged in -> token in storage
    ls.setItem(twitchApiAccessTokenKey, "secret");
    expect(ls.getItem(twitchApiAccessTokenKey)).toEqual("secret");

    expect(model.isLoggedIn).toEqual(false);

    ctrl.checkTokenInStorage();

    expect(model.isLoggedIn).toEqual(true);
  });

  describe("handleOAuth2Redirect", () => {
    let state: string;
    const secret = "top_secret_secret";

    beforeEach(() => {
      ls.setItem(twitchOAuthStateSecretKey, secret);

      state = JSON.stringify({ referrer: "/path", secret: secret });
    });

    it("does nothing on missing access_token in url", async () => {
      expect(model.isLoggedIn).toEqual(false);
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#state=${state}`));
      expect(model.isLoggedIn).toEqual(false);
    });

    it("shows error on malformed state", async () => {
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#access_token=TOKEN&state=NOT-A-JSON`));
      expect(model.meta.error!.message).toEqual(OAuthErrors.INVALID_SECRET);
    });

    it("shows error on different secret", async () => {
      const differentState = JSON.stringify({
        referrer: "/path",
        secret: "different_secret",
      });
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#access_token=TOKEN&state=${differentState}`));
      expect(model.meta.error!.message).toEqual(OAuthErrors.INVALID_SECRET);
    });

    it("cleans up secret, stores token and updates state properly if url is correct", async () => {
      ctrl.handleOAuth2Redirect(new URL(`https://example.com#access_token=TOKEN&state=${state}`));

      expect(model.referrer).toEqual("/path");
      expect(model.isLoggedIn).toEqual(true);
      expect(ls.getItem(twitchOAuthStateSecretKey)).toBeNull();
      expect(ls.getItem(twitchApiAccessTokenKey)).toEqual("TOKEN");
    });
  });
});
