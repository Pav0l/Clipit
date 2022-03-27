import { clipPartialFragment } from "../../../../tests/__fixtures__/clip-fragment";
import { AppRoute, twitchApiAccessTokenKey } from "../../../lib/constants";
import { EthereumTestProvider } from "../../../lib/ethereum/ethereum-test-provider";
import { useWindowLocationInTests } from "../../../../tests/setup";
import { fullAppInitForTests } from "../../../../tests/init-tests";
import { renderAppForTests } from "../../../../tests/ui-test-utils";
import userEvent from "@testing-library/user-event";
import { signerAddress } from "../../../../tests/__fixtures__/ethereum";

function flushPromisesInTests() {
  return new Promise((res) => setTimeout(res));
}

describe("app tests", function () {
  const setLocationForTests = useWindowLocationInTests();

  beforeEach(() => {
    window.ethereum = new EthereumTestProvider();
  });

  afterEach(() => {
    window.ethereum = undefined;
  });

  it("random clip is displayed on home screen and persisted across different route navigations", async () => {
    setLocationForTests(`http://localhost`);

    const init = await fullAppInitForTests({
      runAfterSyncInit: async (init) => {
        // make sure user has wallet connected and is logged into twitch account
        init.model.web3.setAccounts([signerAddress]);
        init.clients.storage.setItem(twitchApiAccessTokenKey, "secret");
      },
    });

    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
    // before we render Home, there is not randomClip
    expect(init.model.nft.randomClip).toEqual(null);

    const { getByTestId } = renderAppForTests(init);

    let home = getByTestId("home");
    expect(home).toBeTruthy();

    // after the render, we have the clip
    expect(init.model.nft.randomClip?.tokenId).toEqual(clipPartialFragment.id);

    let nftCard = getByTestId("nft-card");
    expect(nftCard).toBeTruthy();

    const nftsLink = getByTestId("nfts-navlink");
    expect(nftsLink).toBeTruthy();

    // click Marketplace navlink
    userEvent.click(nftsLink);

    // wait for promises to resolve
    await flushPromisesInTests();

    const nfts = getByTestId("nfts-container");
    expect(nfts).toBeTruthy();

    const homelink = getByTestId("home-navlink");
    expect(homelink).toBeTruthy();

    // click Home navlink
    userEvent.click(homelink);

    home = getByTestId("home");
    expect(home).toBeTruthy();

    // after the render, we have the same clip
    expect(init.model.nft.randomClip?.tokenId).toEqual(clipPartialFragment.id);

    nftCard = getByTestId("nft-card");
    expect(nftCard).toBeTruthy();
  });
});
