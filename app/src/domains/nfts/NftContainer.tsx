import { observer } from "mobx-react-lite";
import { useParams } from "react-router";
import { useEffect } from "react";

import ErrorWithRetry from "../../components/error/Error";
import { NftModel } from "./nft.model";
import { NftCard } from "../../components/nfts/NftCard";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IWeb3Controller } from "../app/app.controller";
import CenteredContainer from "../../components/container/CenteredContainer";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IWeb3Controller;
}

function NftContainer({ model, operations }: Props) {
  // fetch tokenId from URL
  const { tokenId } = useParams<{ tokenId?: string }>();
  if (!tokenId) {
    // TODO SENTRY + how is this handled?
    return <ErrorWithRetry text="Something went wrong" withRetry={true} />;
  }
  // construct ethereum and contract clients

  useEffect(() => {
    operations.requestConnectAndGetTokenMetadata(tokenId);
  }, []);

  // MetaMask not installed
  if (model.nft.meta.hasError) {
    // TODO add onboarding and retry handler button to error msg
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (model.nft.metadata) {
    return (
      <CenteredContainer>
        <NftCard
          clipIpfsUri={model.nft.metadata.clipIpfsUri}
          clipTitle={model.nft.metadata.clipTitle}
          clipDescription={model.nft.metadata.description}
        />
      </CenteredContainer>
    );
  }

  return <FullPageLoader />;
}

export default observer(NftContainer);
