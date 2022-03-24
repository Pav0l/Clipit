import { observer } from "mobx-react-lite";
import { Typography } from "@material-ui/core";

import { AppRoute } from "../../../lib/constants";
import CenteredContainer from "../../../components/container/CenteredContainer";
import ListOfCardsWithThumbnail from "../../../components/nfts/ListOfCardsWithThumbnail";
import { Metadata } from "../nft.model";
import { RouteLink } from "../../navigation/components/RouteLink";

interface Props {
  metadata: Metadata[];
  setTabValue: () => void;
  handleRouteChange: (path: string) => void;
}

function ReceivedBids({ metadata, setTabValue, handleRouteChange }: Props) {
  if (metadata.length === 0) {
    return (
      <CenteredContainer>
        <Typography variant="h6" component="h6">
          It seems you have no Active Auctions. You can create an Auction for{" "}
          <RouteLink to={AppRoute.NFTS} child="minted CLIP" className="" setActive={setTabValue} underline="always" />
        </Typography>
      </CenteredContainer>
    );
  }

  return <ListOfCardsWithThumbnail metadata={metadata} handleRouteChange={handleRouteChange} />;
}

export default observer(ReceivedBids);
