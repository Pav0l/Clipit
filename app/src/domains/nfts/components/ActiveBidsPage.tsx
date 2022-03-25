import { observer } from "mobx-react-lite";
import { Typography } from "@material-ui/core";

import { AppRoute } from "../../../lib/constants";
import CenteredContainer from "../../../components/container/CenteredContainer";
import ListOfCardsWithThumbnail from "../../../components/nfts/ListOfCardsWithThumbnail";
import { Metadata } from "../nft.model";
import { RouteLink } from "../../navigation/components/RouteLink";

interface Props {
  metadata: Metadata[];
  handleRouteChange: (path: string) => void;
}

function ActiveBidsPage({ metadata, handleRouteChange }: Props) {
  if (metadata.length === 0) {
    return (
      <CenteredContainer>
        <Typography variant="h6" component="h6">
          It seems you have no Active Bids. You can bid on a CLIP{" "}
          <RouteLink
            to={AppRoute.MARKETPLACE}
            child="here"
            className=""
            setActive={handleRouteChange}
            underline="always"
          />
        </Typography>
      </CenteredContainer>
    );
  }

  return <ListOfCardsWithThumbnail metadata={metadata} handleRouteChange={handleRouteChange} />;
}

export default observer(ActiveBidsPage);
