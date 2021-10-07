import { Link } from "react-router-dom";
import { AppRoute } from "../../lib/constants";
import LoginWithTwitch from "../loginWithTwitch/LoginWithTwitch";
import ConnectMetamaskButton from "../connectMetamask/ConnectMetamask";

interface Props {
  redirect: () => string;
}

export default function Navbar({ redirect }: Props) {
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
        <ConnectMetamaskButton />
      </ul>
    </nav>
  );
}
