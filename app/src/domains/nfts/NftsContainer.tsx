import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { NftModel } from "./nft.model";
import { NftCard } from "../../components/nfts/NftCard";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IWeb3Controller } from "../app/app.controller";
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
  operations: IWeb3Controller;
}

function NftsContainer({ model, operations }: Props) {
  const metadata = model.nft.metadata;

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

  if (metadata.length === 0) {
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
      {metadata.map((metadata, idx) => (
        <NftCard
          key={idx}
          clipIpfsUri={metadata.clipIpfsUri}
          clipTitle={metadata.clipTitle}
          clipDescription={metadata.description}
        />
      ))}
    </VideoList>
  );
}

export default observer(NftsContainer);
