import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button } from "@material-ui/core";

import { NftModel } from "../../domains/nfts/nft.model";
import FullPageLoader from "../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../components/error/Error";
import { NftController } from "../../domains/nfts/nft.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { CLIPS_PAGINATION_SKIP_VALUE } from "../../lib/constants";
import ListOfCardsWithThumbnail from "../nfts/ListOfCardsWithThumbnail";

interface Props {
  model: {
    nft: NftModel;
    web3: Web3Model;
  };
  operations: NftController;
}

function Marketplace({ model, operations }: Props) {
  const [skipCount, setSkipCount] = useState(0);

  const metadata = model.nft.metadataForMarketplace;

  function fetchNextBatchOfClips() {
    setSkipCount(skipCount + 1);
  }

  useEffect(() => {
    // skip passing the skipCount on mount
    operations.getClips();
  }, []);

  useEffect(() => {
    const clipsToSkip = skipCount * CLIPS_PAGINATION_SKIP_VALUE;
    operations.getClips(clipsToSkip);
  }, [skipCount]);

  if (model.nft.meta.hasError) {
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={true} />;
  }

  // only show loader on the initial clip load
  if (metadata.length === 0 && skipCount === 0 && model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  return (
    <>
      <ListOfCardsWithThumbnail metadata={metadata} />

      {metadata.length >= CLIPS_PAGINATION_SKIP_VALUE ? (
        <Button variant="outlined" onClick={fetchNextBatchOfClips}>
          Load more
        </Button>
      ) : null}
    </>
  );
}

export default observer(Marketplace);
