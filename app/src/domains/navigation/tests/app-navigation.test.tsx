/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render } from "@testing-library/react";

import { initTestSync } from "../../../../tests/init-tests";
import ThemeProvider from "../../theme/components/ThemeProvider";
import { App } from "../../app/components/App";
import { initAsync } from "../../../init";
import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";
import { AppRoute, twitchOAuthUri } from "../../../lib/constants";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";

// TODO take out to reusable test fn
function setLocationForTests(href: string) {
  const url = new URL(href);

  // @ts-ignore
  window.location = {
    href: url.href,
    pathname: url.pathname,
    origin: url.origin,
    assign: jest.fn(),
  };
}

async function initAppForTests() {
  const init = initTestSync(CONFIG);

  await initAsync({
    model: init.model,
    navigator: init.operations.navigator,
    nft: init.operations.nft,
    user: init.operations.user,
    web3: init.operations.web3,
    oauth: init.operations.auth,
  });

  return init;
}
function flushPromisesInTests() {
  return new Promise((res) => setTimeout(res));
}

describe("app navigation", function () {
  const { location } = window;

  beforeAll((): void => {
    // @ts-ignore
    delete window.location;
  });

  afterAll((): void => {
    window.location = location;
    window.ethereum = undefined;
  });

  it("redirects to nft/:tokenId if app opened with `contentHash` query param", async () => {
    setLocationForTests(`http://localhost?contentHash=${clipPartialFragment.contentHash}`);

    const init = await initAppForTests();

    expect(init.model.navigation.activeRoute).toEqual(`/nfts/${clipPartialFragment.id}`);

    const component = (
      <ThemeProvider model={init.model.theme}>
        <App model={init.model} operations={init.operations} sentry={init.sentry} />
      </ThemeProvider>
    );

    const { getByTestId } = render(component);

    const nftContainer = getByTestId("nft-container");
    expect(nftContainer).toBeTruthy();
  });

  it("navigating between routes work", async () => {
    setLocationForTests(`http://localhost${AppRoute.TERMS}`);
    window.ethereum = new EthereumTestProvider();

    const init = await initAppForTests();
    init.model.web3.setAccounts([signerAddress]);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.TERMS);

    const component = (
      <ThemeProvider model={init.model.theme}>
        <App model={init.model} operations={init.operations} sentry={init.sentry} />
      </ThemeProvider>
    );

    const { getByTestId } = render(component);

    const terms = getByTestId("terms");
    expect(terms).toBeTruthy();

    // go to nft/id
    init.operations.navigator.goToNft(clipPartialFragment.id);

    expect(init.model.navigation.activeRoute).toEqual(`/nfts/${clipPartialFragment.id}`);
    const nftContainer = getByTestId("nft-container");
    expect(nftContainer).toBeTruthy();

    // go to home /
    init.operations.navigator.goToRoute(AppRoute.HOME);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const home = getByTestId("home");
    expect(home).toBeTruthy();

    // go to /marketplace
    init.operations.navigator.goToRoute(AppRoute.MARKETPLACE);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.MARKETPLACE);
    const marketplace = getByTestId("marketplace");
    expect(marketplace).toBeTruthy();

    // wait for async operations from rendering Marketplace to finish
    await flushPromisesInTests();

    // go to /nfts
    init.operations.navigator.goToRoute(AppRoute.NFTS);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.NFTS);
    const nftsContainer = getByTestId("nfts-container");
    expect(nftsContainer).toBeTruthy();

    // wait for async operations from rendering Marketplace to finish
    await flushPromisesInTests();

    // go back home
    init.operations.navigator.goToRoute(AppRoute.HOME);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const homeAgain = getByTestId("home");
    expect(homeAgain).toBeTruthy();
  });

  it("non-existent route falls back to HOME", async () => {
    setLocationForTests(`http://localhost/this-route-does-not-exist`);

    const init = await initAppForTests();

    const component = (
      <ThemeProvider model={init.model.theme}>
        <App model={init.model} operations={init.operations} sentry={init.sentry} />
      </ThemeProvider>
    );

    const { getByTestId } = render(component);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const home = getByTestId("home");
    expect(home).toBeTruthy();
  });

  it("oauth/redirect redirects properly", async () => {
    setLocationForTests(`http://localhost${AppRoute.OAUTH_REDIRECT}`);

    const init = await initAppForTests();

    const component = (
      <ThemeProvider model={init.model.theme}>
        <App model={init.model} operations={init.operations} sentry={init.sentry} />
      </ThemeProvider>
    );
    const { getByTestId } = render(component);

    // default referrer is "home" if it does not exist in /oauth/redirect query params
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const home = getByTestId("home");
    expect(home).toBeTruthy();
  });

  it("oauth protected redirects properly", async () => {
    setLocationForTests(`http://localhost${AppRoute.CLIPS}`);

    const init = await initAppForTests();

    expect(init.model.auth.isLoggedIn).toEqual(false);

    const component = (
      <ThemeProvider model={init.model.theme}>
        <App model={init.model} operations={init.operations} sentry={init.sentry} />
      </ThemeProvider>
    );

    expect(window.location.assign).toHaveBeenCalledTimes(1);
    // we redirect to twitch oauth route
    expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining(`${twitchOAuthUri}/oauth2/authorize`));
    // with proper redirect uri back to app
    expect(window.location.assign).toHaveBeenCalledWith(
      expect.stringContaining("redirect_uri=" + encodeURIComponent(`${location.origin}/oauth2/redirect`))
    );
    // and he referrer is the same as where we started
    expect(window.location.assign).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(`"referrer":"${AppRoute.CLIPS}"`))
    );

    const { getByTestId } = render(component);

    const loader = getByTestId("full-page-loader");
    expect(loader).toBeTruthy();
  });
});
