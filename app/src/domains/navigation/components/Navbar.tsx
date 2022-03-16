import { AppBar, Toolbar } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { IWeb3Controller } from "../../web3/web3.controller";
import { AppRoute } from "../../../lib/constants";
import { Web3Model } from "../../web3/web3.model";
import { SnackbarClient } from "../../snackbar/snackbar.controller";
import LoginWithTwitch from "../../twitch-oauth/LoginWithTwitch/LoginWithTwitch";
import { OAuthController } from "../../twitch-oauth/oauth.controller";
import { OAuthModel } from "../../twitch-oauth/oauth.model";
import ConnectMetamaskButton from "../../../components/connectMetamask/ConnectMetamask";
import { NavigationModel } from "../../navigation/navigation.model";
import NavLink from "./NavLink";
import { makeAppStyles } from "../../theme/theme.constants";

interface Props {
  model: {
    web3: Web3Model;
    auth: OAuthModel;
    navigation: NavigationModel;
  };
  operations: {
    web3: IWeb3Controller;
    auth: OAuthController;
    snackbar: SnackbarClient;
  };
  isDevelopment: boolean;
}

export default observer(function Navbar({ model, operations, isDevelopment }: Props) {
  const classes = useStyles();

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.div} data-testid="navlinks-div">
          <NavLink to={AppRoute.HOME} model={{ navigation: model.navigation }} text={"Home"} />
          <NavLink to={AppRoute.MARKETPLACE} model={{ navigation: model.navigation }} text={"Marketplace"} />
          {model.auth.isLoggedIn ? (
            <NavLink to={AppRoute.NFTS} model={{ navigation: model.navigation }} text={"NFTs"} />
          ) : null}

          {model.auth.isLoggedIn ? (
            <NavLink to={AppRoute.CLIPS} model={{ navigation: model.navigation }} text={"Clips"} />
          ) : null}
          {isDevelopment ? (
            <NavLink to={AppRoute.ABOUT} model={{ navigation: model.navigation }} text={"About"} />
          ) : null}
        </div>

        <div>
          <LoginWithTwitch model={{ auth: model.auth }} operations={operations.auth} />
          <ConnectMetamaskButton
            model={model}
            onClick={operations.web3.requestConnect}
            onClickError={operations.snackbar.sendError}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
});

const useStyles = makeAppStyles((theme) => ({
  appbar: {
    backgroundColor: theme.colors.background_primary,
    boxShadow: "none",
    marginBottom: "0.5rem",
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 0,
  },
  div: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 0,
  },
}));
