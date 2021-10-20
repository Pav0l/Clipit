import {
  makeStyles,
  Typography,
  Link,
  AppBar,
  Toolbar
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { IAppController } from "../../domains/app/app.controller";
import { NftModel } from "../../domains/nfts/nft.model";
import { AppRoute } from "../../lib/constants";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import LoginWithTwitch from "../../lib/twitch-oauth/LoginWithTwitch/LoginWithTwitch";
import { OAuthModel } from "../../lib/twitch-oauth/oauth.model";
import ConnectMetamaskButton from "../connectMetamask/ConnectMetamask";

interface Props {
  model: {
    nft: NftModel;
    auth: OAuthModel;
  };
  operations: IAppController;
  redirect: () => string;
  snackbar: SnackbarClient;
}

export default function Navbar({
  model,
  operations,
  redirect,
  snackbar
}: Props) {
  const classes = useStyles();
  const [active, setActive] = useState<AppRoute | undefined>(undefined);

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.div}>
          <LinkButton
            to={AppRoute.HOME}
            text="Home"
            active={active}
            setActive={setActive}
          />
          <LinkButton
            to={AppRoute.MARKETPLACE}
            text="Marketplace"
            active={active}
            setActive={setActive}
          />
          {model.auth.isLoggedIn ? (
            <LinkButton
              to={AppRoute.NFTS}
              text="NFTs"
              active={active}
              setActive={setActive}
            />
          ) : null}

          {model.auth.isLoggedIn ? (
            <LinkButton
              to={AppRoute.CLIPS}
              text="Clips"
              active={active}
              setActive={setActive}
            />
          ) : null}
          <LinkButton
            to={AppRoute.ABOUT}
            text="About"
            active={active}
            setActive={setActive}
          />
        </div>

        <div>
          <LoginWithTwitch
            model={{ auth: model.auth }}
            operations={operations.auth}
            redirect={redirect}
          />
          <ConnectMetamaskButton
            model={model}
            operations={operations}
            snackbar={snackbar}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
}

function LinkButton({
  to,
  text,
  active,
  setActive
}: {
  to: AppRoute;
  text: string;
  active: AppRoute | undefined;
  setActive: (to: AppRoute) => void;
}) {
  const classes = useStyles();

  useEffect(() => {
    if (location.pathname === to) {
      setActive(to);
    }
  }, []);

  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      className={`${classes.li} ${active === to ? classes.active : ""}`}
      onClick={() => setActive(to)}
    >
      <Typography>{text}</Typography>
    </Link>
  );
}

const useStyles = makeStyles((theme) => ({
  appbar: {
    backgroundColor: "#fff",
    boxShadow: "none",
    marginBottom: "0.5rem"
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 0
  },
  div: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 0
  },
  li: {
    display: "block",
    padding: "0.5rem 1rem",
    color: theme.palette.text.primary,
    borderBottom: "1px solid white",
    "&:hover": {
      borderBottom: `1px solid black`
    }
  },
  active: {
    borderBottom: "1px solid black"
  }
}));
