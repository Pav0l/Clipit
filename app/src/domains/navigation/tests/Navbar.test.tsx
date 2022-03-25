import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Navbar from "../components/Navbar";
import { initTestSync } from "../../../../tests/init-tests";
import { AppRoute } from "../../../lib/constants";
import ThemeProvider from "../../theme/components/ThemeProvider";

describe("Navbar component", function () {
  it("renders navbar links properly when clicking/mouse-overing them", async () => {
    const init = initTestSync(CONFIG);
    const component = (
      <ThemeProvider model={init.model.theme}>
        <Navbar
          model={{ web3: init.model.web3, auth: init.model.auth, navigation: init.model.navigation }}
          isDevelopment={true}
          operations={{
            web3: init.operations.web3,
            auth: init.operations.auth,
            snackbar: init.operations.snackbar,
            navigator: init.operations.navigator,
          }}
        />
      </ThemeProvider>
    );

    const { getByText } = render(component);

    const home = getByText("Home");
    const marketplace = getByText("Marketplace");
    // we can get "About" link, because `isDevelopment=true`
    const about = getByText("About");

    // default route
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);

    // click focuses link
    userEvent.click(about);
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.ABOUT);

    // click back works
    userEvent.click(home);
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);

    // now just hover over another link
    userEvent.hover(marketplace);
    // hovered route is set
    expect(init.model.navigation.hoveredRoute).toEqual(AppRoute.MARKETPLACE);
    // active route did not change
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);

    // now unhover link
    userEvent.unhover(marketplace);
    // hovered route undefined
    expect(init.model.navigation.hoveredRoute).toEqual(undefined);
    // active route still the same
    expect(init.model.navigation.activeRoute).toEqual(AppRoute.HOME);
  });
});
