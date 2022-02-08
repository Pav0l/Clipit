import { observer } from "mobx-react-lite";
import { Typography } from "@material-ui/core";

import { AppRoute } from "../../../lib/constants";
import CenteredContainer from "../../../components/container/CenteredContainer";
import ListOfCardsWithThumbnail from "../../../components/nfts/ListOfCardsWithThumbnail";
import { Metadata } from "../nft.model";
import { LinkButton } from "../../../components/linkButton/LinkButton";
import { NavigationModel } from "../../navigation/navigation.model";

interface Props {
  model: {
    navigation: NavigationModel;
  };
  metadata: Metadata[];
}

function NftsPage({ model, metadata }: Props) {
  if (metadata.length === 0) {
    return (
      <CenteredContainer>
        <Typography variant="h6" component="h6">
          It seems you have no NFTs yet. Try{" "}
          <LinkButton
            to={AppRoute.CLIPS}
            text="minting your first clip"
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

export default observer(NftsPage);
