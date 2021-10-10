import { makeStyles, Typography, Link } from "@material-ui/core";
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
    <nav className={classes.nav}>
      <div className={classes.div}>
        <LinkButton to={AppRoute.HOME} text="Home" />
        <LinkButton to={AppRoute.MARKETPLACE} text="Marketplace" />
        <LinkButton to={AppRoute.NFTS} text="NFTs" />
        {/* <LinkButton
          to={
            AppRoute.NFTS +
            "/36233396072335468701985568828909990904923376377298966903472230465470283407670"
          }
          text="DELETE ME"
        /> */}

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
    </nav>
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
  nav: {
    margin: "1rem 0",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
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
    "& :hover": {
      // TODO - this flickers because it applies on child typography
      // borderBottom: `1px solid ${theme.palette.text.secondary}`
    }
  }
}));
