import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Typography } from "@material-ui/core";

import FullPageLoader from "../../../components/loader/FullPageLoader";
import { IWeb3Controller } from "../../web3/web3.controller";
import { AppRoute } from "../../../lib/constants";
import ErrorWithRetry from "../../../components/error/Error";
import CenteredContainer from "../../../components/container/CenteredContainer";
import ListOfCardsWithThumbnail from "../../../components/nfts/ListOfCardsWithThumbnail";
import { Web3Model, Web3Errors } from "../../web3/web3.model";
import { NftController } from "../nft.controller";
import { NftModel } from "../nft.model";
import { LinkButton } from "../../navigation/components/LinkButton";
import { NavigationModel } from "../../navigation/navigation.model";

interface Props {
  model: {
    web3: Web3Model;
    nft: NftModel;
    navigation: NavigationModel;
  };
  operations: {
    web3: IWeb3Controller;
    nft: NftController;
  };
}

function NftsContainer({ model, operations }: Props) {
  const signer = model.web3.getAccount();
  const metadata = operations.nft.getOwnerMetadata(signer);

  useEffect(() => {
    if (!model.web3.isProviderConnected()) {
      // MM was not connected -> no reason to keep some previous NFTs on state
      model.nft.resetMetadata();
      operations.web3.requestConnect(operations.nft.getCurrentSignerTokensMetadata);
    }

    if (signer) {
      operations.nft.getCurrentSignerTokensMetadata(signer);
    }
  }, []);

  // TODO MM not installed/connected should be a custom error/flow
  // MetaMask not installed or not connected
  if (model.web3.meta.hasError) {
    return <ErrorWithRetry text={model.web3.meta.error} withRetry={false} />;
  }

  if (model.nft.meta.hasError) {
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={true} />;
  }

  if (model.nft.meta.isLoading || model.web3.meta.isLoading) {
    return <FullPageLoader />;
  }

  if (!signer) {
    return <ErrorWithRetry text={Web3Errors.CONNECT_METAMASK} withRetry={false} />;
  }

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

export default observer(NftsContainer);
