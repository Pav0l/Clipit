/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { initTestSync } from "../../../../tests/init-tests";
import ThemeProvider from "../../theme/components/ThemeProvider";
import { App } from "../../app/components/App";
import { initAsync } from "../../../init";
import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";
import { AppRoute } from "../../../lib/constants";

function setLocationForTests(href: string) {
  const url = new URL(href);

  // @ts-ignore
  window.location = {
    href: url.href,
    pathname: url.pathname,
  };
}

describe("app navigation", function () {
  const { location } = window;

  beforeAll((): void => {
    // @ts-ignore
    delete window.location;
  });

  afterAll((): void => {
    window.location = location;
  });

  it("redirects to nft/:tokenId if app opened with `contentHash` query param", async () => {
    setLocationForTests(`http://localhost?contentHash=${clipPartialFragment.contentHash}`);

    const init = initTestSync(CONFIG);

    await initAsync({
      model: init.model,
      navigator: init.operations.navigator,
      nft: init.operations.nft,
      user: init.operations.user,
      web3: init.operations.web3,
    });

    expect(init.model.navigation.activeRoute).toEqual(`/nfts/${clipPartialFragment.id}`);

    const component = (
      <ThemeProvider model={init.model.theme}>
        <BrowserRouter>
          <App model={init.model} operations={init.operations} sentry={init.sentry} />
        </BrowserRouter>
      </ThemeProvider>
    );

    const { getByTestId } = render(component);

    const nftContainer = getByTestId("nft-container");
    expect(nftContainer).toBeTruthy();
  });

  it("navigating between routes work", async () => {
    setLocationForTests(`http://localhost${AppRoute.TERMS}`);

    const init = initTestSync(CONFIG);

    await initAsync({
      model: init.model,
      navigator: init.operations.navigator,
      nft: init.operations.nft,
      user: init.operations.user,
      web3: init.operations.web3,
    });

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.TERMS);

    const component = (
      <ThemeProvider model={init.model.theme}>
        <BrowserRouter>
          <App model={init.model} operations={init.operations} sentry={init.sentry} />
        </BrowserRouter>
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
    init.operations.navigator.goToHome();

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    const home = getByTestId("home");
    expect(home).toBeTruthy();
  });
});
