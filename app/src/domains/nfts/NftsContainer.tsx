import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

import { NftModel } from "./nft.model";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IWeb3Controller } from "../app/app.controller";
import { AppRoute } from "../../lib/constants";
import ErrorWithRetry from "../../components/error/Error";
import VideoList from "../../components/videoList/VideoList";
import CenteredContainer from "../../components/container/CenteredContainer";
import { CardWithThumbnail } from "../../components/nfts/CardWithThumbnail";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IWeb3Controller;
}

function NftsContainer({ model, operations }: Props) {
  const metadata = model.nft.metadata;
  const classes = useStyles();

  useEffect(() => {
    if (metadata.length === 0) {
      operations.requestConnectAndGetTokensMetadata();
    }
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
        <Link
          to={`/nfts/${metadata.tokenId}`}
          key={idx}
          className={classes.link}
        >
          <CardWithThumbnail
            key={idx}
            thumbnailUrl={metadata.thumbnailUri}
            title={metadata.clipTitle}
            description={metadata.description}
          />
        </Link>
      ))}
    </VideoList>
  );
}

export default observer(NftsContainer);

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem"
  }
}));
