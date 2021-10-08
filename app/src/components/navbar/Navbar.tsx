import { Link } from "react-router-dom";
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
  return (
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
        {/* TODO remove this link */}
        <li>
          <Link
            to={
              AppRoute.NFTS +
              "/36233396072335468701985568828909990904923376377298966903472230465470283407670"
            }
          >
            Nft one
          </Link>
        </li>
        <li>
          <Link to={AppRoute.CLIPS}>Clips</Link>
        </li>
        <li>
          <Link to={AppRoute.ABOUT}>About</Link>
        </li>
        <LoginWithTwitch redirect={redirect} />
        <ConnectMetamaskButton
          model={model}
          operations={operations}
          snackbar={snackbar}
        />
      </ul>
    </nav>
  );
}
