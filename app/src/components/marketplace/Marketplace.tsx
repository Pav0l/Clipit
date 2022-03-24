import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button } from "@material-ui/core";

import { NftModel } from "../../domains/nfts/nft.model";
import FullPageLoader from "../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../components/error/Error";
import { NftController } from "../../domains/nfts/nft.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { CLIPS_PAGINATION_SKIP_VALUE, DEFAULT_SKIP_COUNT_VALUE } from "../../lib/constants";
import ListOfCardsWithThumbnail from "../nfts/ListOfCardsWithThumbnail";
import { NavigatorController } from "../../domains/navigation/navigation.controller";

interface Props {
  model: {
    nft: NftModel;
    web3: Web3Model;
  };
  operations: {
    nft: NftController;
    navigator: NavigatorController;
  };
}

function Marketplace({ model, operations }: Props) {
  const [skipCount, setSkipCount] = useState(DEFAULT_SKIP_COUNT_VALUE);

  const metadata = model.nft.metadataForMarketplace;

  function fetchNextBatchOfClips() {
    setSkipCount(skipCount + 1);
  }

  useEffect(() => {
    if (metadata.length === 0) {
      operations.nft.getClips(DEFAULT_SKIP_COUNT_VALUE);
    }
  }, []);

  useEffect(() => {
    if (skipCount !== DEFAULT_SKIP_COUNT_VALUE) {
      const clipsToSkip = skipCount * CLIPS_PAGINATION_SKIP_VALUE;
      operations.nft.getClips(clipsToSkip);
    }
  }, [skipCount]);

  if (model.nft.meta.error) {
    return <ErrorWithRetry text={model.nft.meta.error.message} withRetry={true} />;
  }

  // only show loader on the initial clip load
  if (metadata.length === 0 && skipCount === 0 && model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  return (
    <>
      <ListOfCardsWithThumbnail
        metadata={metadata}
        handleRouteChange={operations.navigator.goToRoute}
        dataTestId="marketplace"
      />

      {metadata.length >= CLIPS_PAGINATION_SKIP_VALUE ? (
        <Button variant="outlined" onClick={fetchNextBatchOfClips}>
          Load more
        </Button>
      ) : null}
    </>
  );
}

export default observer(Marketplace);
