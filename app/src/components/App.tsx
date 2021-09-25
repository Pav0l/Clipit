import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { StoreProvider } from "../store/StoreProvider";
import Home from "./home/Home";
import Clips from "./clips/Clips";
import OAuth2Redirect from "./oauth2-redirect/OAuth2Redirect";
import ClipDetail from "./clipDetail/ClipDetail";
import About from "./About";
import { getTwitchOAuth2AuthorizeUrl } from "../lib/twitch-oauth/twitch-oauth.utils";
import LoginWithTwitch from "./loginWithTwitch/LoginWithTwitch";
import Marketplace from "./marketplace/Marketplace";
import AlertSnackbar from "./snackbar/Snackbar";
import { AppRoute } from "../lib/constants";
import { OnboardingButton } from "./connectMetamask/ConnectMetamask";

export default function App() {
  return (
    <StoreProvider>
      <Router basename="/">
        <div>
          <nav>
            <ul>
              <li>
                <Link to={AppRoute.HOME}>Home</Link>
              </li>
              <li>
                <Link to={AppRoute.MARKETPLACE}>Marketplace</Link>
              </li>
              <li>
                <Link to={AppRoute.CLIPS}>Clips</Link>
              </li>
              <li>
                <Link to={AppRoute.ABOUT}>About</Link>
              </li>
              <LoginWithTwitch redirect={getTwitchOAuth2AuthorizeUrl} />
              <OnboardingButton />
            </ul>
          </nav>

          <AlertSnackbar />

          <Switch>
            <Route exact path={AppRoute.MARKETPLACE}>
              <Marketplace />
            </Route>
            <Route exact path={AppRoute.ABOUT}>
              <About />
            </Route>
            <Route exact path={AppRoute.CLIPS}>
              <Clips />
            </Route>
            <Route path={AppRoute.CLIP}>
              <ClipDetail />
            </Route>
            <Route exact path={AppRoute.OAUTH_REDIRECT}>
              <OAuth2Redirect />
            </Route>
            <Route path={AppRoute.HOME}>
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </StoreProvider>
  );
}
