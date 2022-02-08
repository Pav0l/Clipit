import { observer } from "mobx-react-lite";
import { Typography } from "@material-ui/core";

import { AppRoute } from "../../../lib/constants";
import CenteredContainer from "../../../components/container/CenteredContainer";
import ListOfCardsWithThumbnail from "../../../components/nfts/ListOfCardsWithThumbnail";
import { Web3Model } from "../../web3/web3.model";
import { Metadata, NftModel } from "../nft.model";
import { LinkButton } from "../../../components/linkButton/LinkButton";
import { NavigationModel } from "../../navigation/navigation.model";

interface Props {
  model: {
    web3: Web3Model;
    nft: NftModel;
    navigation: NavigationModel;
  };
  metadata: Metadata[];
}

function ActiveBidsPage({ model, metadata }: Props) {
  if (metadata.length === 0) {
    return (
      <CenteredContainer>
        <Typography variant="h6" component="h6">
          It seems you have no Active Bids. You can bid on a CLIP{" "}
          <LinkButton
            to={AppRoute.MARKETPLACE}
            text="here"
            className=""
            setActive={model.navigation.setActiveRoute}
            underline="always"
          />
        </Typography>
      </CenteredContainer>
    );
  }

  return <ListOfCardsWithThumbnail metadata={metadata} />;
}

export default observer(ActiveBidsPage);
