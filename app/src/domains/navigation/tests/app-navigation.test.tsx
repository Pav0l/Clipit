import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";
import { AppRoute, twitchOAuthUri } from "../../../lib/constants";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";
import { useWindowLocationInTests } from "../../../../tests/setup";
import { fullAppInitForTests } from "../../../../tests/init-tests";
import { renderAppForTests } from "../../../../tests/ui-test-utils";

function flushPromisesInTests() {
  return new Promise((res) => setTimeout(res));
}

describe.skip("app navigation", function () {
  const setLocationForTests = useWindowLocationInTests();

  beforeEach(() => {
    window.ethereum = new EthereumTestProvider();
  });

  afterEach(() => {
    window.ethereum = undefined;
  });

  it("redirects to nft/:tokenId if app opened with `contentHash` query param", async () => {
    setLocationForTests(`http://localhost?contentHash=${clipPartialFragment.contentHash}`);

    const init = await fullAppInitForTests();

    expect(init.model.navigation.activeRoute).toEqual(`/nfts/${clipPartialFragment.id}`);

    const { getByTestId } = renderAppForTests(init);

    const nftContainer = getByTestId("nft-container");
    expect(nftContainer).toBeTruthy();
  });

  it("navigating between routes work", async () => {
    setLocationForTests(`http://localhost${AppRoute.TERMS}`);

    const init = await fullAppInitForTests();
    init.model.web3.setAccounts([signerAddress]);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.TERMS);

    const { getByTestId } = renderAppForTests(init);

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

    const init = await fullAppInitForTests();
    const { getByTestId } = renderAppForTests(init);

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const home = getByTestId("home");
    expect(home).toBeTruthy();
  });

  it("oauth/redirect redirects properly", async () => {
    setLocationForTests(`http://localhost${AppRoute.OAUTH_REDIRECT}`);

    const init = await fullAppInitForTests();
    const { getByTestId } = renderAppForTests(init);

    // default referrer is "home" if it does not exist in /oauth/redirect query params
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const home = getByTestId("home");
    expect(home).toBeTruthy();
  });

  it("oauth protected redirects properly", async () => {
    setLocationForTests(`http://localhost${AppRoute.CLIPS}`);

    const init = await fullAppInitForTests();

    expect(init.model.auth.isLoggedIn).toEqual(false);

    expect(window.location.assign).toHaveBeenCalledTimes(1);
    // we redirect to twitch oauth route
    expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining(`${twitchOAuthUri}/oauth2/authorize`));
    // with proper redirect uri back to app
    expect(window.location.assign).toHaveBeenCalledWith(
      expect.stringContaining("redirect_uri=" + encodeURIComponent(`${window.location.origin}/oauth2/redirect`))
    );
    // and he referrer is the same as where we started
    expect(window.location.assign).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(`"referrer":"${AppRoute.CLIPS}"`))
    );

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.CLIPS);

    const { getByTestId } = renderAppForTests(init);
    const loader = getByTestId("full-page-loader");
    expect(loader).toBeTruthy();
  });
});
