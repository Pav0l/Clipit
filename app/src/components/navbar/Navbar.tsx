import {
  makeStyles,
  Typography,
  Link,
  AppBar,
  Toolbar
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { IAppController } from "../../domains/app/app.controller";
import { NftModel } from "../../domains/nfts/nft.model";
import { AppRoute } from "../../lib/constants";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import LoginWithTwitch from "../../lib/twitch-oauth/LoginWithTwitch/LoginWithTwitch";
import ConnectMetamaskButton from "../connectMetamask/ConnectMetamask";

interface Props {
  model: {
    nft: NftModel;
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

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.div}>
          <LinkButton to={AppRoute.HOME} text="Home" />
          <LinkButton to={AppRoute.MARKETPLACE} text="Marketplace" />
          <LinkButton to={AppRoute.NFTS} text="NFTs" />
          <LinkButton to={AppRoute.CLIPS} text="Clips" />
          <LinkButton to={AppRoute.ABOUT} text="About" />
        </div>

        <div>
          <LoginWithTwitch redirect={redirect} />
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

function LinkButton({ to, text }: { to: AppRoute; text: string }) {
  const classes = useStyles();
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      className={classes.li}
    >
      <Typography>{text}</Typography>
    </Link>
  );
}

const useStyles = makeStyles((theme) => ({
  appbar: {
    backgroundColor: "#fff",
    boxShadow: "none"
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
  }
}));
