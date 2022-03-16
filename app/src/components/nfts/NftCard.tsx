import { CardMedia, Card, CardActionArea } from "@material-ui/core";
import { Metadata } from "../../domains/nfts/nft.model";
import { makeAppStyles } from "../../domains/theme/theme.constants";
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
        <NftCardContent title={metadata.clipTitle} description={metadata.description} auction={metadata.auction} />
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeAppStyles(() => ({
  card: {
    margin: "1rem",
    width: "50vw",
  },
  video: {
    maxHeight: "70vh",
  },
}));
