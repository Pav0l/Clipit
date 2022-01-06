import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

import { NftModel } from "../../domains/nfts/nft.model";
import FullPageLoader from "../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../components/error/Error";
import VideoList from "../../components/videoList/VideoList";
import { CardWithThumbnail } from "../../components/nfts/CardWithThumbnail";
import { NftController } from "../../domains/nfts/nft.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { CLIPS_PAGINATION_SKIP_VALUE } from "../../lib/constants";

interface Props {
  model: {
    nft: NftModel;
    web3: Web3Model;
  };
  operations: NftController;
}

function Marketplace({ model, operations }: Props) {
  const [skipCount, setSkipCount] = useState(0);

  // TODO - consider filtering only "not owned" tokens
  const metadata = model.nft.metadata;
  const classes = useStyles();

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
      {/* Temporary button to load more clips */}
      <Button
        variant="contained"
        color="primary"
        onClick={fetchNextBatchOfClips}
      >
        More!
      </Button>

      <VideoList>
        {metadata.map((metadata, idx) => (
          <Link
            to={`/nfts/${metadata.tokenId}`}
            key={idx}
            className={classes.link}
          >
            <CardWithThumbnail
              key={idx}
              title={metadata.clipTitle}
              // TODO - add Game & Streamer name? (are they not on the clip itself?
              // TODO - add current bid
              thumbnailUrl={metadata.thumbnailUri}
              description={metadata.description}
            />
          </Link>
        ))}
      </VideoList>
    </>
  );
}

/**
 * Marketplace card should contain:
 * - Clip title
 * - Game
 * - Streamer name
 * - Current Bid
 */

export default observer(Marketplace);

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: "none",
    margin: "1rem"
  }
}));
