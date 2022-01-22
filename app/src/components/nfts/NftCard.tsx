import { CardMedia, Card, makeStyles, CardActionArea } from "@material-ui/core";
import { Metadata } from "../../domains/nfts/nft.model";
import { NftCardContent } from "./NftCardContent";

interface Props {
  metadata: Metadata;
}

/**
 * NftCard presentation component displays NFTs metadata as a card with embedded video player
 */
export function NftCard({ metadata }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          component="video"
          src={metadata.clipIpfsUri}
          title={`CLIP NFT video: ${metadata.clipTitle}`}
          className={classes.video}
          controls
          controlsList="nodownload"
          poster={metadata.thumbnailUri}
        />
        <NftCardContent
          title={metadata.clipTitle}
          description={metadata.description}
          auction={metadata.auction}
          bid={metadata.currentBid}
        />
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    margin: "1rem",
    maxWidth: "50vw"
  },
  video: {
    maxHeight: "70vh"
  }
}));
