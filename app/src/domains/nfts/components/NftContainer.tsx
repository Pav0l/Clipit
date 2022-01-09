import { observer } from "mobx-react-lite";
import { useParams } from "react-router";
import { useEffect } from "react";

import ErrorWithRetry from "../../../components/error/Error";
import { NftCard } from "../../../components/nfts/NftCard";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import CenteredContainer from "../../../components/container/CenteredContainer";
import { NftModel } from "../nft.model";
import { NftController } from "../nft.controller";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: NftController;
}

function NftContainer({ model, operations }: Props) {
  const { tokenId } = useParams<{ tokenId?: string }>();
  if (!tokenId) {
    // TODO SENTRY + how is this handled?
    return <ErrorWithRetry text="Something went wrong" withRetry={true} />;
  }
  const metadata = model.nft.getTokenMetadata(tokenId);

  useEffect(() => {
    if (!metadata) {
      operations.getTokenMetadata(tokenId);
    }
  }, []);

  // MetaMask not installed
  if (model.nft.meta.hasError) {
    // TODO add onboarding and retry handler button to error msg
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (metadata) {
    return (
      <CenteredContainer>
        <NftCard
          clipIpfsUri={metadata.clipIpfsUri}
          clipTitle={metadata.clipTitle}
          clipDescription={metadata.description}
          poster={metadata.thumbnailUri}
        />
      </CenteredContainer>
    );
  }

  return <FullPageLoader />;
}

export default observer(NftContainer);
