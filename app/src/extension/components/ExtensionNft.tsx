import { observer } from "mobx-react-lite";
import { Card, CardMedia, Typography } from "@material-ui/core";

import { Metadata, NftModel } from "../../domains/nfts/nft.model";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { AuctionCreateForm } from "../../domains/auction/components/auctions/AuctionCreateForm";
import { Web3Model } from "../../domains/web3/web3.model";
import { StreamerUiController } from "../domains/streamer/streamer-ui.controller";
import { ExtensionNftError } from "./ExtensionNftError";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { AuctionModel } from "../../domains/auction/auction.model";

interface Props {
  metadata: Metadata | null;
  tokenId: string;
  withHeader?: boolean;
  model: {
    web3: Web3Model;
    nft: NftModel;
    auction: AuctionModel;
  };
  operations: {
    streamerUi: StreamerUiController;
  };
}

export const ExtensionNft = observer(function ExtensionNft({ metadata, tokenId, model, operations }: Props) {
  const classes = useStyles();

  if (model.web3.meta.error) {
    return (
      <ExtensionNftError
        error={model.web3.meta.error}
        createAuctionHandler={async () => {
          model.web3.meta.resetError();
          operations.streamerUi.backToNft(tokenId);
        }}
      />
    );
  }

  if (!metadata) {
    return <FullPageLoader />;
  }

  return (
    <>
      <Typography component="h5" variant="h5" className={classes.header}>
        🎉 NFT created 🎉
      </Typography>

      <Card>
        {!model.auction.auctionLoadStatus &&
        !model.auction.approveAuctionStatus &&
        // TODO replace web3 loader with auction
        !model.web3.meta.isLoading &&
        !model.nft.meta.isLoading ? (
          <>
            <CardMedia
              component="video"
              src={metadata.clipIpfsUri}
              title={`CLIP NFT video: ${metadata.clipTitle}`}
              className={classes.video}
              controls
              controlsList="nodownload"
              poster={metadata.thumbnailUri}
            />
            <div className={classes.content}>
              <Typography variant="subtitle1" component="h6" noWrap className={classes.clipTitle}>
                {metadata.clipTitle}
              </Typography>
              <Typography component="p" color="textSecondary" noWrap>
                {metadata.description}
              </Typography>
            </div>
          </>
        ) : null}

        <AuctionCreateForm
          tokenId={tokenId}
          withHeader={false}
          classNames={classes.auctionWidth}
          model={model}
          handleCreateAuction={operations.streamerUi.createAuction}
        />
      </Card>
    </>
  );
});

const useStyles = makeAppStyles((theme) => ({
  content: {
    margin: "1rem 1rem 0",
  },
  header: {
    marginBottom: "1rem",
  },
  video: {
    maxHeight: "70vh",
  },
  clipTitle: {
    fontWeight: 600,
    color: theme.colors.text_secondary,
    fontSize: "1rem",
  },
  auctionWidth: {
    maxWidth: "100%",
    width: "inherit",
  },
  errorBtn: {
    margin: "1rem 0",
  },
}));
