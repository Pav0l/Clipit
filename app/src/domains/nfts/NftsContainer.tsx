import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

import { NftModel } from "./nft.model";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IWeb3Controller } from "../app/web3.controller";
import { AppRoute } from "../../lib/constants";
import ErrorWithRetry from "../../components/error/Error";
import VideoList from "../../components/videoList/VideoList";
import CenteredContainer from "../../components/container/CenteredContainer";
import { CardWithThumbnail } from "../../components/nfts/CardWithThumbnail";
import { NftController } from "./nft.controller";
import {
  EthereumModel,
  MetaMaskErrors
} from "../../lib/ethereum/ethereum.model";

interface Props {
  model: {
    eth: EthereumModel;
    nft: NftModel;
  };
  operations: {
    web3: IWeb3Controller;
    nft: NftController;
  };
}

function NftsContainer({ model, operations }: Props) {
  const metadata = model.nft.metadata;
  const signer = model.eth.getAccount();

  const classes = useStyles();

  useEffect(() => {
    if (!model.eth.isProviderConnected()) {
      // MM was not connected -> no reason to keep some previous NFTs on state
      model.nft.resetMetadata();
      operations.web3.requestConnect(
        operations.nft.getCurrentSignerTokensMetadata
      );
    }

    if (signer) {
      operations.nft.getCurrentSignerTokensMetadata(signer);
    }
  }, []);

  // TODO MM not installed should be a custom error
  // MetaMask not installed
  if (model.eth.meta.hasError) {
    // TODO add onboarding and retry handler button to error msg
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (model.nft.meta.hasError) {
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={true} />;
  }

  if (model.nft.meta.isLoading || model.eth.meta.isLoading) {
    return <FullPageLoader />;
  }

  if (!signer) {
    return (
      <ErrorWithRetry
        text={MetaMaskErrors.CONNECT_METAMASK}
        withRetry={false}
      />
    );
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
