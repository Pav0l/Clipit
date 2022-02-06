import { makeStyles, AppBar, Toolbar, Typography } from "@material-ui/core";
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
import { LinkButton } from "../../navigation/components/LinkButton";

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

  const buildClassName = (to: AppRoute) => `${classes.li} ${model.navigation.activeRoute === to ? classes.active : ""}`;
  const NavLink = ({ to, text }: { to: AppRoute; text: string }) => (
    <LinkButton
      to={to}
      text={<Typography>{text}</Typography>}
      setActive={model.navigation.setActiveRoute}
      className={buildClassName(to)}
      underline="none"
    />
  );

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.div}>
          <NavLink to={AppRoute.HOME} text={"Home"} />
          <NavLink to={AppRoute.MARKETPLACE} text={"Marketplace"} />
          {model.auth.isLoggedIn ? <NavLink to={AppRoute.NFTS} text={"NFTs"} /> : null}

          {model.auth.isLoggedIn ? <NavLink to={AppRoute.CLIPS} text={"Clips"} /> : null}
          {isDevelopment ? <NavLink to={AppRoute.ABOUT} text={"About"} /> : null}
        </div>

        <div>
          <LoginWithTwitch model={{ auth: model.auth }} operations={operations.auth} />
          <ConnectMetamaskButton
            model={model}
            operations={{
              web3: operations.web3,
              snackbar: operations.snackbar,
            }}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
});

const useStyles = makeStyles((theme) => ({
  appbar: {
    backgroundColor: "#fff",
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
  li: {
    display: "block",
    padding: "0.5rem 1rem",
    color: theme.palette.text.primary,
    borderBottom: "1px solid white",
    "&:hover": {
      borderBottom: `1px solid black`,
    },
  },
  active: {
    borderBottom: "1px solid black",
  },
}));
