import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { NftModel } from "./nft.model";
import { NftCard } from "../../components/nfts/NftCard";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IAppController } from "../app/app.controller";
import { Link } from "react-router-dom";
import { AppRoute } from "../../lib/constants";
import ErrorWithRetry from "../../components/error/Error";
import VideoList from "../../components/videoList/VideoList";
import CenteredContainer from "../../components/container/CenteredContainer";
import { Typography } from "@material-ui/core";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IAppController;
}

function NftsContainer({ model, operations }: Props) {
  const tokenIds = Object.keys(model.nft.metadataCollection);

  useEffect(() => {
    operations.requestConnectAndGetTokensMetadata();
  }, []);

  // TODO MM not installed should be a custom error
  // MetaMask not installed
  if (model.nft.meta.hasError) {
    // TODO add onboarding and retry handler button to error msg
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  if (tokenIds.length === 0) {
    return (
      <CenteredContainer>
        <Typography variant="h6" component="h6">
          It seems you have no NFTs yet. Try{" "}
          <Link to={AppRoute.CLIPS}>minting your first clip</Link>.
        </Typography>
      </CenteredContainer>
    );
  }

  return (
    <VideoList>
      {tokenIds.map((tokenId, idx) => (
        <NftCard
          key={idx}
          clipIpfsUri={model.nft.metadataCollection[tokenId].clipIpfsUri}
          clipTitle={model.nft.metadataCollection[tokenId].clipTitle}
          clipDescription={model.nft.metadataCollection[tokenId].description}
        />
      ))}
    </VideoList>
  );
}

export default observer(NftsContainer);
