import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { StoreProvider } from "../store/StoreProvider";
import Home from "./home/Home";
import Clips from "../domains/twitch-clips/Clips";
import OAuth2Redirect from "./oauth2-redirect/OAuth2Redirect";
import ClipDetail from "../domains/twitch-clips/ClipDetail";
import Playground from "../modules/playground/Playground";
import { getTwitchOAuth2AuthorizeUrl } from "../lib/twitch-oauth/twitch-oauth.utils";
import LoginWithTwitch from "./loginWithTwitch/LoginWithTwitch";
import Marketplace from "./marketplace/Marketplace";
import AlertSnackbar from "../modules/snackbar/Snackbar";
import { AppRoute } from "../lib/constants";
import { OnboardingButton } from "./connectMetamask/ConnectMetamask";
import ErrorBoundary from "../modules/error/ErrorBoundry";
import Nft from "./nfts/Nft";
import Nfts from "./nfts/Nfts";

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
                <Link to={AppRoute.NFTS}>Nfts</Link>
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
            <Route exact path={AppRoute.NFTS}>
              {/* TODO this route needs to be auth protected */}
              <Nfts />
            </Route>
            <Route exact path={AppRoute.NFT}>
              {/* TODO this route needs to be auth protected */}
              <Nft />
            </Route>
            <Route exact path={AppRoute.ABOUT}>
              <Playground />
            </Route>
            <Route exact path={AppRoute.CLIPS}>
              <ErrorBoundary>
                {/* TODO this route needs to be auth protected */}
                <Clips />
              </ErrorBoundary>
            </Route>
            <Route path={AppRoute.CLIP}>
              <ErrorBoundary>
                {/* TODO this route needs to be auth protected */}
                <ClipDetail />
              </ErrorBoundary>
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
